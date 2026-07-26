import { describe, expect, it } from "vitest";
import {
  APP_CONTAINER_PX,
  MORPH_RADIUS_RATIO,
  MORPH_RADIUS_PX,
  MORPH_RADIUS_HERO_PX,
  MORPH_RADIUS_ALL,
  MORPH_RADIUS_SHEET,
  MORPH_RADIUS_HERO_ALL,
  MORPH_RADIUS_HERO_SHEET,
  MORPH_RADIUS_SNAP_PROGRESS,
  MORPH_CHROME_FADE_START,
  SHEET_FADE_END,
  SCRIM_FADE_END,
  SCRIM_LIGHT_FADE_END,
  MORPH_SPRING,
  MORPH_SPRING_REDUCED,
  BASE_VIEW_RECEDE_SCALE,
  springDampingRatio,
  springSettleRate,
} from "@/lib/morph-config";

// The radius system is proportional: one ratio, every surface scales its own
// radius from its own width. A hardcoded 20 or 49 anywhere would silently break
// that relationship, which is exactly what these numbers exist to prevent.
describe("proportional corner-radius system", () => {
  // Deliberately literal, not `Math.round(180 * MORPH_RADIUS_RATIO)`: repeating the
  // implementation's own expression cannot fail unless both files are edited together.
  // These are the two numbers the rest of the design system is drawn against.
  it("puts the card radius at 20px and the hero radius at 49px", () => {
    expect(MORPH_RADIUS_PX).toBe(20);
    expect(MORPH_RADIUS_HERO_PX).toBe(49);
  });

  it("keeps the ratio itself at the documented anchor", () => {
    expect(MORPH_RADIUS_RATIO).toBeCloseTo(0.1094, 6);
    expect(APP_CONTAINER_PX).toBe(448);
  });

  it("keeps card and hero radii on the same ratio at their DESIGN widths", () => {
    const cardRatio = MORPH_RADIUS_PX / 180;
    const heroRatio = MORPH_RADIUS_HERO_PX / APP_CONTAINER_PX;
    expect(Math.abs(cardRatio - heroRatio)).toBeLessThan(0.002);
  });

  // Recorded, not celebrated: the "proportional" claim holds at the design widths only.
  // 180px is the rail card at a 448px container; on the 393px phone this pass actually
  // ran on, the measured card is 155.11px (traces/trace-forward-2.json, geom.cardW), so
  // the shipped 20px is ratio 0.129 there — the card radius is in practice a constant,
  // not a proportion. Asserted so the discrepancy cannot quietly widen.
  it("does not actually stay proportional at the real 393px card width", () => {
    const measuredCardWidthOn393 = 155.11;
    const realRatio = MORPH_RADIUS_PX / measuredCardWidthOn393;
    expect(realRatio).toBeGreaterThan(MORPH_RADIUS_RATIO);
    expect(realRatio).toBeCloseTo(0.129, 3);
  });

  it("composes every radius shorthand from those two numbers only", () => {
    expect(MORPH_RADIUS_ALL).toBe(`${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px`);
    expect(MORPH_RADIUS_SHEET).toBe(`${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px 0 0`);
    expect(MORPH_RADIUS_HERO_ALL).toBe(
      `${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px`
    );
    expect(MORPH_RADIUS_HERO_SHEET).toBe(`${MORPH_RADIUS_HERO_PX}px ${MORPH_RADIUS_HERO_PX}px 0 0`);
  });
});

// The sequencing constants encode T1 -> T1b -> T2 as progress fractions. Their
// ORDER is the contract; the exact values are tuning. Measured 2026-07-25 in
// Chrome: bottom-radius snap and chrome fade-in both fire on the first frame at
// or past 0.55, sheet opacity lands one frame later. See PROGRESS.md.
describe("morph sequencing thresholds", () => {
  it("fires the chrome fade at the same instant as the shape/radius snap (both are T1)", () => {
    expect(MORPH_CHROME_FADE_START).toBe(MORPH_RADIUS_SNAP_PROGRESS);
  });

  it("finishes the sheet fade after the shape threshold, not before it", () => {
    expect(SHEET_FADE_END).toBeGreaterThan(MORPH_RADIUS_SNAP_PROGRESS);
  });

  it("keeps every progress threshold inside the 0..1 progress range", () => {
    for (const t of [MORPH_RADIUS_SNAP_PROGRESS, MORPH_CHROME_FADE_START, SHEET_FADE_END, SCRIM_FADE_END, SCRIM_LIGHT_FADE_END]) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it("cross-fades the light scrim layer out before the heavy one, so blur only increases", () => {
    expect(SCRIM_LIGHT_FADE_END).toBeLessThan(SCRIM_FADE_END);
  });

  it("recedes the base view without inverting or hiding it", () => {
    expect(BASE_VIEW_RECEDE_SCALE).toBeGreaterThan(0.8);
    expect(BASE_VIEW_RECEDE_SCALE).toBeLessThanOrEqual(1);
  });
});

// Both springs are judged by their damping ratio and their settle rate, not by
// their raw stiffness: a stiffer spring that is also more overdamped settles no
// faster, which is exactly the trap MORPH_SPRING_REDUCED fell into (measured
// 400ms vs 450ms for the default spring — an accessibility accommodation that
// did not actually accommodate).
describe("spring characteristics", () => {
  it("keeps the default morph spring critically damped, so it never overshoots", () => {
    expect(springDampingRatio(MORPH_SPRING)).toBeCloseTo(1, 2);
  });

  it("keeps the reduced-motion spring at or below critical damping", () => {
    expect(springDampingRatio(MORPH_SPRING_REDUCED)).toBeLessThanOrEqual(1.01);
  });

  it("settles the reduced-motion spring substantially faster than the default one", () => {
    expect(springSettleRate(MORPH_SPRING_REDUCED)).toBeGreaterThan(1.5 * springSettleRate(MORPH_SPRING));
  });
});
