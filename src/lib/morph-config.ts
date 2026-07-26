// Shared-element morph configuration — single source of truth.
// Consumed by: MorphCard (captures tap origin + radius), TransitionLayer (spring engine),
// DetailView (hero + sheet resting state).

// ─── Geometry ───────────────────────────────────────────────────────────────
// All dimensions derive from the app container width (max-w-md = 28rem = 448px).
// Cards are 1:1 square. Hero is 1:1 square. The morph scales uniformly because
// scaleY === scaleX (both use the same 19.5/9 container ratio — see TransitionLayer).
//
// Carousel formula (2 full cards + 25% peek of 3rd):
//   available = containerWidth - 2 × padding
//   cardWidth = (available - gap) / 2.25
//   On 448px container: (448 - 32 - 12) / 2.25 = 180px
//   On 393px (iPhone 16): (393 - 32 - 12) / 2.25 = 155px
export const APP_CONTAINER_REM = 28;
export const APP_CONTAINER_PX = APP_CONTAINER_REM * 16;
export const RAIL_PADDING_PX = 16;
export const RAIL_GAP_PX = 12;
export const CARD_WIDTH_CSS = `calc((min(100vw, ${APP_CONTAINER_REM}rem) - ${RAIL_PADDING_PX * 2}px - ${RAIL_GAP_PX}px) / 2.25)`;

// ─── Corner-radius system (proportional) ────────────────────────────────────
// Ratio 0.1094 is the anchor — every surface scales its radius to its width.
export const MORPH_RADIUS_RATIO = 0.1094;
export const MORPH_RADIUS_PX = Math.round(180 * MORPH_RADIUS_RATIO);
export const MORPH_RADIUS_HERO_PX = Math.round(APP_CONTAINER_PX * MORPH_RADIUS_RATIO);
export const MORPH_RADIUS_ALL = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px`;
export const MORPH_RADIUS_SHEET = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px 0 0`;
export const MORPH_RADIUS_HERO_ALL = `${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px`;
export const MORPH_RADIUS_HERO_SHEET = `${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px 0 0`;

// ─── Interpolation primitives ───────────────────────────────────────────────
// Shared by TransitionLayer's per-frame applyFrame() and by the retarget maths
// below, so "where the clone is right now" is computed exactly one way.
export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Morph geometry ─────────────────────────────────────────────────────────
export interface MorphGeometry {
  originLeft: number; // relative to hero left
  originTop: number; // relative to hero top (0)
  scaleX: number;
  scaleY: number;
  startRadius: number;
}

export type MorphPhase = "idle" | "forward" | "reverse";

// Tapping a *different* card has two distinct shapes, and only one of them may
// reuse the clone's current on-screen box as its new origin:
//   - resting at the hero (progress ~1): fly from the new card's real rect.
//   - genuinely mid-flight (0 < progress < 1): the new card's rect would make the
//     clone teleport, because geometry changes while progress does not. Continue
//     from wherever the clone currently sits instead — see retargetGeometry.
export function shouldRetargetMidFlight(args: {
  phase: MorphPhase;
  isFreshTarget: boolean;
  hasPreviousGeometry: boolean;
  progress: number;
}): boolean {
  return (
    args.phase === "forward" &&
    args.isFreshTarget &&
    args.hasPreviousGeometry &&
    args.progress > 0 &&
    args.progress < 0.999
  );
}

// The clone's live box, expressed as a fresh origin so the spring can restart
// from 0 without moving a pixel. Uses the same mix() applyFrame runs every frame.
export function retargetGeometry(prev: MorphGeometry, progress: number, heroRadius: number): MorphGeometry {
  return {
    originLeft: mix(prev.originLeft, 0, progress),
    originTop: mix(prev.originTop, 0, progress),
    scaleX: mix(prev.scaleX, 1, progress),
    scaleY: mix(prev.scaleY, 1, progress),
    startRadius: mix(prev.startRadius, heroRadius, progress),
  };
}

// getBoundingClientRect() reports the *visual* box. A card tapped while the base
// view is mid-recede (BASE_VIEW_RECEDE_SCALE, applied to <main>) therefore
// measures smaller and offset, and that wrong rect is what a later reverse morph
// flies back to. Undo the ancestor scale — which happens about <main>'s own
// centre — so a stored origin is always in layout coordinates. `scale` of 1 (no
// morph in flight, or a card that lives outside <main> entirely, like the
// related-places strip in DetailOverlay's portal) makes this an exact no-op.
export function unscaleRectAroundCenter(
  rect: { left: number; top: number; width: number; height: number },
  center: { x: number; y: number },
  scale: number
): { left: number; top: number; width: number; height: number } {
  if (scale === 1) return rect;
  return {
    left: center.x + (rect.left - center.x) / scale,
    top: center.y + (rect.top - center.y) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

// ─── Spring characteristics ─────────────────────────────────────────────────
// A spring's feel is its damping ratio and its settle rate, not its raw
// stiffness: a stiffer spring that is also more overdamped settles no faster.
export function springDampingRatio(spring: { stiffness: number; damping: number; mass: number }): number {
  return spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
}

// Exponential decay rate of the slowest term, in 1/s — bigger settles sooner.
// At or below critical damping that is the natural frequency; above it, the
// slow root dominates and extra damping actively *slows* the settle down.
export function springSettleRate(spring: { stiffness: number; damping: number; mass: number }): number {
  const omega0 = Math.sqrt(spring.stiffness / spring.mass);
  const zeta = springDampingRatio(spring);
  return zeta <= 1 ? omega0 : omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
}

// ─── Sheet overlap ──────────────────────────────────────────────────────────
export const SHEET_OVERLAP_PX = 48;
export const SHEET_OVERLAP_REM = `${SHEET_OVERLAP_PX / 16}rem`;

// ─── Hero height (1:1 square) ───────────────────────────────────────────────
export const HERO_HEIGHT_CSS = `min(${APP_CONTAINER_REM}rem, 100vw)`;

// ─── Timing ─────────────────────────────────────────────────────────────────
export const MORPH_DURATION_MS = 480;
export const MORPH_DURATION_S = MORPH_DURATION_MS / 1000;
export const MORPH_SPRING = { type: "spring" as const, stiffness: 400, damping: 40, mass: 1 };
// Ground-truth observation: E4's opacity fade (T0 -> T1b) finishes *shortly after* the
// shape/radius-snap threshold (T1, MORPH_RADIUS_SNAP_PROGRESS below) — not gradually,
// all the way out near full completion. 0.78 previously put the sheet's opacity finish
// almost at T2's territory instead of just past T1; 0.62 sits just after the 0.55
// shape-done threshold, matching "opacity catches up shortly after." Re-tune alongside
// MORPH_RADIUS_SNAP_PROGRESS if that value ever moves.
export const SHEET_FADE_END = 0.62;
export const SCRIM_FADE_END = 0.9;

// Reduced-motion fallback: the global CSS `prefers-reduced-motion` rule (globals.css)
// forces CSS transition/animation durations to ~0, but it can't reach this spring
// because it's driven imperatively by Framer Motion's RAF loop, not a CSS transition.
// TransitionLayer checks `matchMedia` itself and swaps to this critically damped,
// fast-settling spring instead of skipping the morph outright — an instant jump-cut
// between a small card and a full hero is a worse experience than a very quick settle.
//
// Damping was 70, which made this spring OVERDAMPED (ratio 1.107) and cancelled out
// the whole point of the higher stiffness: its slowest decay term came out at 19.9998
// 1/s against the default spring's 20.0 — mathematically the same settle, so the
// accommodation accommodated nothing. Measured in Chrome 2026-07-25 before the fix:
// 400ms to settle versus 450ms for the default spring. 63 puts the ratio back at
// 0.996 (critically damped, no overshoot) and the decay rate at 31.6 1/s — a genuine
// ~1.6x faster settle. `springSettleRate` in this file is what the test asserts on.
export const MORPH_SPRING_REDUCED = { type: "spring" as const, stiffness: 1000, damping: 63, mass: 1 };

// ─── Shape vs. motion completion (T1) ────────────────────────────────────────
// Ground-truth observation: the sheet's shape-extension (aspect-ratio match) finishes
// well before the position/scale morph does — around 17–50% of the way through, while
// the image is still only ~50% of the way to its final position. Framer's spring
// `progress` (0→1) doesn't map to a fixed ms timeline the way a duration-based
// animation would, so T1 is expressed here as a progress fraction rather than a ms
// offset. 0.55 sits in the observed range — tune if the spring config above changes.
//
// Verified in Chrome 2026-07-25 (393x852, 60fps): the snap fires on the first frame
// at or past 0.55, which lands ~150ms into a ~480ms morph — 31% of elapsed time,
// with the image 55% of the way to its final size. That is inside the observed
// "17-50% of the way through, image still ~50% there" window, so the value stands.
//
// What the same run also showed, and what this constant cannot fix on its own: the
// bottom corners it hard-snaps from startRadius to 0 are NOT tucked under anything
// mid-flight. At 0.55 the clone's bottom edge floats around 63% down the screen, so
// the snap is a visible corner pop on a free-floating edge. See PROGRESS.md
// ("bottom-radius snap") for the before/after screenshots and the options.
export const MORPH_RADIUS_SNAP_PROGRESS = 0.55;
export const MORPH_CHROME_FADE_START = 0.55;

// ─── Hold phase (T2 → T3) + crossfade ───────────────────────────────────────
// The reference observation ties this hold to content-load time (Airbnb fetches the
// detail page over the network). This app's place data is bundled and local — there
// is no load to wait on — so this was a fixed, tuned placeholder purely for
// perceptual pacing.
//
// Cut from 220 to 0 after watching it: the hold buys 220ms of an empty white sheet
// with a spinner turning over a photo that is already fully loaded, on top of a
// spring that takes ~560ms to settle and a 260ms crossfade after that. It reads as
// manufactured latency, not craft. The spinner (E7) it existed to display has been
// removed from TransitionLayer for the same reason. The timeout itself is kept in
// place at 0 so the T2 -> T3 hand-off keeps its own well-tested code path and the
// hold can be dialled back up without restructuring anything.
export const MORPH_HOLD_MS = 0;
// T3: E4 (this clone) and E7 (its spinner) fade out the instant E9 (the real content
// sheet) fades in — they're literally the same fading DOM subtree here, so that
// simultaneity falls out of the architecture for free rather than needing separate
// choreography. This constant is that crossfade's duration.
export const MORPH_CROSSFADE_MS = 260;

// E10: bottom bar rise, explicitly unspecified by the observation. Independent,
// translateY-only, not tied to any opacity fade.
export const BOTTOM_BAR_RISE_MS = 340;

// E3: card title/subtitle fade-out on tap.
export const CARD_TEXT_FADE_MS = 70;

// ─── Easing curves (shared) ─────────────────────────────────────────────────
export const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

// ─── Scrim (static blur, opacity-only animation) ────────────────────────────
// Two constant-blur layers cross-faded by progress fake a continuously *increasing*
// blur without ever animating `backdrop-filter` itself (documented Chromium jank —
// see coding-standards.md). Replaces the single-layer scrim; SCRIM_BLUR_PX/SCRIM_TINT
// stay as the "heavy" layer so nothing else importing them needs to change.
//
// Measured 2026-07-25: the light layer reaches full opacity at progress 0.45 and the
// heavy one at 0.90, exactly as the two fade-end constants specify, and the blur does
// read as continuously increasing rather than stepping. Kept as-is. Noted honestly:
// on this light-on-light UI the combination is strong — by progress 0.5 the base view
// is an unreadable wash (see 02b screenshot in docs/morph-verify). That is on the
// heavy side of "recede" but it is a taste call, not a defect, so it stays.
export const SCRIM_BLUR_PX = 24;
export const SCRIM_BLUR_LIGHT_PX = 10;
export const SCRIM_LIGHT_FADE_END = 0.45;
export const SCRIM_TINT = "oklch(0.16 0.012 230 / 0.10)";

// ─── Background recede (E11 — scale) ────────────────────────────────────────
// Ground-truth observation: the background layer scales down continuously in the same
// T0->T2 window as everything else, synced with the blur increase, as a z-axis
// recession cue. An earlier version of this codebase scaled the whole app-shell
// wrapper — which also contains this clone's own position:fixed elements as
// DESCENDANTS — and a `transform` on that ancestor becomes a new containing block for
// every `position: fixed` descendant, breaking their fixed-to-viewport behavior. That
// was the "zoom-out bug" this was previously kept out over. This version only scales
// <main> (the base view), which is a SIBLING of TransitionLayer/DetailOverlay in the
// DOM, not an ancestor of either — see AppShell.tsx's `baseViewRef`. Compositor-only
// (transform, no filter): the existing two-layer scrim already owns the blur half of
// E11, this only adds the scale half.
//
// Seen and kept, 2026-07-25: 0.93 is legible as a recession without reading as a
// zoom-out, both on a 393px phone and at the sm: breakpoint where the shrunken
// column is fully covered by DetailOverlay (448px wide against the receded 414.8px)
// and the revealed gap shows the parent's identical bg-background — no seam.
//
// It has one non-obvious consequence, now handled: while this transform is applied,
// getBoundingClientRect() on any card inside <main> returns the *visually scaled*
// box. Tapping a second card mid-morph therefore used to store a wrong origin, and
// the reverse morph flew back to it — measured 40.8px too low and 10.2px too narrow
// after a re-tap 300ms in. MorphCard now converts that rect back to layout
// coordinates via unscaleRectAroundCenter() before storing it.
export const BASE_VIEW_RECEDE_SCALE = 0.93;
