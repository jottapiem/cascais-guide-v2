import { describe, expect, it } from "vitest";
import {
  SPEC_HALF_TRAVEL_PROGRESS,
  MORPH_RADIUS_SNAP_PROGRESS,
  MORPH_CHROME_FADE_START,
  SHEET_FADE_END,
  SHEET_EXPAND_END,
  CARD_TEXT_BLOCK_RATIO,
  sheetExpansionInsetPx,
  retargetFeatureProgress,
  clamp01,
  BACKGROUND_MORPH_SHARE,
  backgroundPhase,
  backgroundPhaseFor,
  SCRIM_FADE_END,
  SCRIM_LIGHT_FADE_END,
  MORPH_HOLD_MS,
  MORPH_CROSSFADE_MS,
  BOTTOM_BAR_DELAY_MS,
  BOTTOM_BAR_SPRING,
  springDampingRatio,
  springOvershoot,
} from "@/lib/morph-config";

// The reference spec is written on a fixed 0.8-0.9s clock; this morph is spring-driven
// and has no fixed duration. The spec itself supplies the bridge between the two: at its
// t=0.3s checkpoint "the photo+sheet unit has covered 50% of its total translate/scale
// distance", and every other phase-2 event is pinned to that same instant. So 50% of
// TRAVEL — progress 0.5 — is the anchor these tests defend, not the millisecond.
describe("the 50%-travel anchor (spec t=0.3s)", () => {
  it("fires the corner snap, the chrome fade-in and the sheet's opacity/expansion finish at one single instant", () => {
    expect(SPEC_HALF_TRAVEL_PROGRESS).toBe(0.5);
    expect(MORPH_RADIUS_SNAP_PROGRESS).toBe(SPEC_HALF_TRAVEL_PROGRESS);
    expect(MORPH_CHROME_FADE_START).toBe(SPEC_HALF_TRAVEL_PROGRESS);
    expect(SHEET_FADE_END).toBe(SPEC_HALF_TRAVEL_PROGRESS);
    expect(SHEET_EXPAND_END).toBe(SPEC_HALF_TRAVEL_PROGRESS);
  });

  it("actually changes the shape at the anchor: corners rounded + sheet inset just before, both zero at it", () => {
    // Behaviour check, not an alias restatement (finding #5): assert what the constants *do*.
    const W = 393;
    const H = W * (19.5 / 9);
    const bottomSquare = (p: number) => p >= MORPH_RADIUS_SNAP_PROGRESS;
    const eps = 0.001;
    // Just before the anchor: bottom corners still rounded, sheet not yet fully expanded.
    expect(bottomSquare(SPEC_HALF_TRAVEL_PROGRESS - eps)).toBe(false);
    expect(sheetExpansionInsetPx(SPEC_HALF_TRAVEL_PROGRESS - eps, W, H)).toBeGreaterThan(0);
    // At the anchor: corners have snapped square and the sheet has reached full aspect ratio.
    expect(bottomSquare(SPEC_HALF_TRAVEL_PROGRESS)).toBe(true);
    expect(sheetExpansionInsetPx(SPEC_HALF_TRAVEL_PROGRESS, W, H)).toBe(0);
  });

  it("lands the chrome fade exactly on the end of the positional morph, never before it", () => {
    // Spec phase 3: title, loader and all three buttons reach full opacity at t=0.6s,
    // which is the same instant the position/scale morph completes (progress 1).
    const opacityAt = (t: number) => (t - MORPH_CHROME_FADE_START) / (1 - MORPH_CHROME_FADE_START);
    expect(opacityAt(SPEC_HALF_TRAVEL_PROGRESS)).toBe(0);
    expect(opacityAt(1)).toBe(1);
    expect(opacityAt(0.75)).toBeCloseTo(0.5, 6);
  });
});

// Spec phase 2: "the Animation Sheet's bottom edge extends downward while fading in,
// until the photo+sheet bounding box's aspect ratio matches the device screen's".
// Implemented as a bottom inset on the clone's clip-path, so the photo above it is
// untouched (no crop, no aspect change) and nothing relayouts per frame.
describe("sheet bottom-edge expansion", () => {
  // 393px phone: hero/clone coordinate width 393, container height 393 * 19.5/9.
  const HERO_W = 393;
  const CONTAINER_H = 393 * (19.5 / 9);

  it("starts the visible box at the card's own photo + text-block height", () => {
    const inset = sheetExpansionInsetPx(0, HERO_W, CONTAINER_H);
    const visible = CONTAINER_H - inset;
    // photo (square, = width) + the card's text block, measured at 61.75px on a
    // 155.11px card = 0.398 of card width.
    expect(visible).toBeCloseTo(HERO_W * (1 + CARD_TEXT_BLOCK_RATIO), 6);
    expect(CARD_TEXT_BLOCK_RATIO).toBeCloseTo(0.398, 6);
  });

  it("has fully expanded — inset 0 — by the 50%-travel anchor and stays there", () => {
    expect(sheetExpansionInsetPx(SHEET_EXPAND_END, HERO_W, CONTAINER_H)).toBe(0);
    expect(sheetExpansionInsetPx(0.8, HERO_W, CONTAINER_H)).toBe(0);
    expect(sheetExpansionInsetPx(1, HERO_W, CONTAINER_H)).toBe(0);
  });

  it("only ever shrinks the inset — the bottom edge never travels back up", () => {
    let prev = Infinity;
    for (let t = 0; t <= 1.0001; t += 0.02) {
      const inset = sheetExpansionInsetPx(t, HERO_W, CONTAINER_H);
      expect(inset).toBeLessThanOrEqual(prev + 1e-9);
      expect(inset).toBeGreaterThanOrEqual(0);
      prev = inset;
    }
  });

  it("reaches the screen aspect ratio exactly at the anchor, having started near-square", () => {
    const aspectAt = (t: number) => HERO_W / (CONTAINER_H - sheetExpansionInsetPx(t, HERO_W, CONTAINER_H));
    expect(aspectAt(0)).toBeCloseTo(1 / (1 + CARD_TEXT_BLOCK_RATIO), 6);
    expect(aspectAt(SHEET_EXPAND_END)).toBeCloseTo(9 / 19.5, 6);
  });
});

// Spec, Background Scene: blur and z-recede increase "continuously and monotonically
// across the ENTIRE transition — still intensifying right up to content-ready, not just
// until t=0.6s". The positional morph only covers the first part of that window, so the
// background runs on its own phase u, of which the morph is BACKGROUND_MORPH_SHARE.
describe("background phase runs past the positional morph", () => {
  it("has NOT finished when the positional morph lands", () => {
    expect(backgroundPhase(1)).toBeCloseTo(BACKGROUND_MORPH_SHARE, 6);
    expect(BACKGROUND_MORPH_SHARE).toBeLessThan(1);
    expect(BACKGROUND_MORPH_SHARE).toBeGreaterThan(0.5);
  });

  it("is monotonic and starts at zero", () => {
    expect(backgroundPhase(0)).toBe(0);
    let prev = -1;
    for (let t = 0; t <= 1.0001; t += 0.02) {
      const u = backgroundPhase(t);
      expect(u).toBeGreaterThanOrEqual(prev);
      prev = u;
    }
  });

  // The forward leg's background window is longer than its morph, because the hold
  // extends it. The reverse leg has no hold, so the whole window collapses onto the
  // morph — and, critically, a reverse always STARTS from a settled detail page where the
  // background is already fully receded. Mapping the reverse over the full range is what
  // makes its first frame continuous with where the hold left the base view, instead of
  // popping it back out by (1 - BACKGROUND_MORPH_SHARE) of the recede on frame one.
  it("collapses the background window onto the morph on the reverse leg", () => {
    expect(backgroundPhaseFor(1, "reverse")).toBe(1);
    expect(backgroundPhaseFor(0, "reverse")).toBe(0);
    expect(backgroundPhaseFor(1, "forward")).toBeCloseTo(BACKGROUND_MORPH_SHARE, 6);
    expect(backgroundPhaseFor(0.5, "forward")).toBeCloseTo(0.5 * BACKGROUND_MORPH_SHARE, 6);
  });

  it("leaves the heavy scrim layer still climbing at morph-complete, peaking at content-ready", () => {
    // Heavy layer's fade end is expressed in u, not in progress: reaching 1 only at
    // u = 1 is what keeps the blur intensifying through the hold.
    expect(SCRIM_FADE_END).toBe(1);
    expect(backgroundPhase(1) / SCRIM_FADE_END).toBeLessThan(1);
    expect(SCRIM_LIGHT_FADE_END).toBeLessThan(SCRIM_FADE_END);
  });
});

// Spec global timing: morph done at t=0.6s, content-ready at ~0.8-0.9s. Measured in
// Chrome on this branch, the spring's settle callback fires 603ms after the tap, so the
// hold is what has to carry the remaining distance into that window.
describe("hold puts content-ready inside the spec window", () => {
  const MEASURED_SETTLE_MS = 603;

  it("holds long enough to land content-ready between 0.8s and 0.9s", () => {
    const contentReady = MEASURED_SETTLE_MS + MORPH_HOLD_MS;
    expect(contentReady).toBeGreaterThanOrEqual(800);
    expect(contentReady).toBeLessThanOrEqual(900);
  });

  it("keeps the hold non-zero — the loading indicator needs a window to exist in", () => {
    expect(MORPH_HOLD_MS).toBeGreaterThan(0);
  });
});

// Spec phase 5: the bottom bar starts AFTER the content crossfade has ended (strictly
// sequential, not parallel), translate-only, and is the one element with real bounce.
describe("bottom bar", () => {
  it("does not start until the content crossfade has finished", () => {
    expect(BOTTOM_BAR_DELAY_MS).toBeGreaterThanOrEqual(MORPH_CROSSFADE_MS);
  });

  it("is underdamped, unlike every other spring in the morph", () => {
    expect(springDampingRatio(BOTTOM_BAR_SPRING)).toBeLessThan(1);
  });

  it("overshoots visibly but not comically", () => {
    const overshoot = springOvershoot(BOTTOM_BAR_SPRING);
    expect(overshoot).toBeGreaterThan(0.05);
    expect(overshoot).toBeLessThan(0.2);
  });

  it("reports zero overshoot for the critically damped morph spring", () => {
    expect(springOvershoot({ stiffness: 400, damping: 40, mass: 1 })).toBe(0);
    expect(springOvershoot({ stiffness: 400, damping: 80, mass: 1 })).toBe(0);
  });
});

// A mid-flight retarget (fast-tapping a second card while the first is in flight) resets the
// spring progress to 0 for the fresh run. The position stays continuous via retargetGeometry,
// but the t-driven SHAPE features would otherwise snap back to their t=0 state — a visible pop
// of sheet expansion, sheet/chrome opacity and the bottom-corner snap. retargetFeatureProgress
// is the guard: these tests compose it with the REAL feature curves and assert the features
// never run backward across the seam (they are behaviour checks, not restatements of the alias).
describe("mid-flight retarget continuity (adversarial finding #7)", () => {
  const W = 393;
  const H = W * (19.5 / 9);
  const insetAt = (p: number) => sheetExpansionInsetPx(p, W, H);
  const chromeAt = (p: number) => clamp01((p - MORPH_CHROME_FADE_START) / (1 - MORPH_CHROME_FADE_START));
  const sheetAt = (p: number) => clamp01(p / SHEET_FADE_END);
  const bottomSquare = (p: number) => p >= MORPH_RADIUS_SNAP_PROGRESS; // corners snapped to 0

  it("is an exact no-op with no retarget in effect (floor 0): features track raw t", () => {
    for (const t of [0, 0.1, 0.3, 0.5, 0.75, 1]) {
      expect(retargetFeatureProgress(t, 0)).toBe(t);
    }
  });

  it("hands off with zero seam: the fresh flight's first frame equals where the retarget caught it", () => {
    // progressRef resets to 0 for the new run; featureProgress(0, floor) must equal `floor`
    // so the very first painted frame is identical to the last pre-retarget one — no pop.
    for (const floor of [0.2, 0.5, 0.6, 0.9]) {
      expect(retargetFeatureProgress(0, floor)).toBe(floor);
    }
  });

  it("never un-expands a sheet that had already reached full aspect ratio (floor past half-travel)", () => {
    const floor = 0.62; // caught after the half-travel anchor: sheet done, chrome climbing, corners square
    expect(insetAt(floor)).toBe(0);
    let prevInset = insetAt(retargetFeatureProgress(0, floor));
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const p = retargetFeatureProgress(t, floor);
      expect(insetAt(p)).toBeLessThanOrEqual(prevInset + 1e-9); // monotonic: inset only ever shrinks
      expect(insetAt(p)).toBe(0); // and stays fully expanded the whole fresh flight
      expect(chromeAt(p)).toBeGreaterThanOrEqual(chromeAt(floor) - 1e-9); // chrome never fades back out
      expect(sheetAt(p)).toBe(1); // sheet opacity holds at full
      expect(bottomSquare(p)).toBe(true); // corners never round back
      prevInset = insetAt(p);
    }
  });

  it("holds a partially-expanded sheet steady, then resumes forward once the fresh t catches up (mid-range floor)", () => {
    const floor = 0.3; // caught before the anchor: sheet still expanding, chrome not yet started
    const insetSeam = insetAt(retargetFeatureProgress(0, floor));
    expect(insetSeam).toBe(insetAt(floor)); // seam is continuous
    // While the fresh t is below the floor the inset must not grow (no backward pop)...
    for (let t = 0; t <= floor; t += 0.05) {
      expect(insetAt(retargetFeatureProgress(t, floor))).toBeLessThanOrEqual(insetSeam + 1e-9);
    }
    // ...and once t passes the floor the feature resumes and still completes at t=1.
    expect(insetAt(retargetFeatureProgress(1, floor))).toBe(0);
    expect(chromeAt(retargetFeatureProgress(1, floor))).toBe(1);
  });
});
