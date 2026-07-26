import { describe, expect, it } from "vitest";
import {
  clamp01,
  mix,
  shouldRetargetMidFlight,
  retargetGeometry,
  unscaleRectAroundCenter,
  type MorphGeometry,
} from "@/lib/morph-config";

describe("mix", () => {
  it("returns the endpoints at t=0 and t=1", () => {
    expect(mix(10, 20, 0)).toBe(10);
    expect(mix(10, 20, 1)).toBe(20);
  });

  it("interpolates linearly in between", () => {
    expect(mix(0, 100, 0.25)).toBe(25);
    expect(mix(-40, 40, 0.5)).toBe(0);
  });

  it("extrapolates rather than clamping, so callers must clamp themselves", () => {
    expect(mix(0, 100, 1.5)).toBe(150);
    expect(mix(0, 100, -0.5)).toBe(-50);
  });
});

describe("clamp01", () => {
  it("passes values inside the range through untouched", () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(1)).toBe(1);
  });

  it("clamps outside the range", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(9)).toBe(1);
  });
});

// Two different re-target scenarios exist, and only one of them may reuse the
// clone's current on-screen position as its new origin. Getting this predicate
// wrong is what made an earlier version of the clone teleport.
describe("shouldRetargetMidFlight", () => {
  const base = { phase: "forward" as const, isFreshTarget: true, hasPreviousGeometry: true, progress: 0.4 };

  it("retargets when a different card is tapped genuinely mid-flight", () => {
    expect(shouldRetargetMidFlight(base)).toBe(true);
  });

  it("does not retarget while resting at the hero - that case flies from the new card's real rect", () => {
    expect(shouldRetargetMidFlight({ ...base, progress: 1 })).toBe(false);
    expect(shouldRetargetMidFlight({ ...base, progress: 0.9995 })).toBe(false);
  });

  it("does not retarget at the very start, where the real rect is already correct", () => {
    expect(shouldRetargetMidFlight({ ...base, progress: 0 })).toBe(false);
  });

  it("does not retarget when the same card is tapped again", () => {
    expect(shouldRetargetMidFlight({ ...base, isFreshTarget: false })).toBe(false);
  });

  it("does not retarget on the reverse leg", () => {
    expect(shouldRetargetMidFlight({ ...base, phase: "reverse" })).toBe(false);
  });

  it("does not retarget when there is no previous geometry to continue from", () => {
    expect(shouldRetargetMidFlight({ ...base, hasPreviousGeometry: false })).toBe(false);
  });
});

describe("retargetGeometry", () => {
  const prev: MorphGeometry = { originLeft: -120, originTop: 480, scaleX: 0.4, scaleY: 0.4, startRadius: 20 };
  const heroRadius = 49;

  // Expectations here are hand-computed, NOT produced by calling mix() again: an
  // expected value routed through the same helper as the implementation would pass no
  // matter how retargetGeometry was rewritten, as long as it still used mix().
  //
  // prev = {originLeft: -120, originTop: 480, scaleX: 0.4, scaleY: 0.4, startRadius: 20},
  // heroRadius 49. At progress 0.25:
  //   originLeft  -120 + (0 - -120) * 0.25   = -90
  //   originTop    480 + (0 - 480) * 0.25    =  360
  //   scaleX       0.4 + (1 - 0.4) * 0.25    =  0.55
  //   startRadius   20 + (49 - 20) * 0.25    =  27.25
  it("hands the spring a start box equal to where the clone already is", () => {
    const next = retargetGeometry(prev, 0.25, heroRadius);
    expect(next.originLeft).toBeCloseTo(-90, 10);
    expect(next.originTop).toBeCloseTo(360, 10);
    expect(next.scaleX).toBeCloseTo(0.55, 10);
    expect(next.scaleY).toBeCloseTo(0.55, 10);
    expect(next.startRadius).toBeCloseTo(27.25, 10);
  });

  // At progress 0.8: -120 -> -24, 480 -> 96, 0.4 -> 0.88, 20 -> 43.2
  it("stays continuous late in the flight too", () => {
    const next = retargetGeometry(prev, 0.8, heroRadius);
    expect(next.originLeft).toBeCloseTo(-24, 10);
    expect(next.originTop).toBeCloseTo(96, 10);
    expect(next.scaleX).toBeCloseTo(0.88, 10);
    expect(next.startRadius).toBeCloseTo(43.2, 10);
  });

  it("is a no-op at progress 0", () => {
    expect(retargetGeometry(prev, 0, heroRadius)).toEqual(prev);
  });

  it("lands on the hero's own resting values at progress 1", () => {
    const next = retargetGeometry(prev, 1, heroRadius);
    expect(next.originLeft).toBeCloseTo(0, 10);
    expect(next.originTop).toBeCloseTo(0, 10);
    expect(next.scaleX).toBeCloseTo(1, 10);
    expect(next.startRadius).toBeCloseTo(heroRadius, 10);
  });
});

// getBoundingClientRect() reports the VISUAL box. While the base view is mid-
// recede (E11), a card tapped inside it measures smaller and offset, and that
// wrong rect is what the reverse morph later flies back to. Measured in Chrome
// before this correction existed: the clone landed 40.8px too low and 10.2px too
// narrow after a card was tapped 300ms into a morph.
describe("unscaleRectAroundCenter", () => {
  const center = { x: 196.5, y: 426 };

  it("is an identity when the base view is not scaled", () => {
    const rect = { left: 183.1, top: 187, width: 155.1, height: 155.1 };
    expect(unscaleRectAroundCenter(rect, center, 1)).toEqual(rect);
  });

  it("recovers the layout rect from a rect measured through the recede transform", () => {
    const layout = { left: 183.1, top: 187, width: 155.1, height: 155.1 };
    const k = 0.93;
    // Forward: what getBoundingClientRect() would report while <main> is receded.
    const visual = {
      left: center.x + (layout.left - center.x) * k,
      top: center.y + (layout.top - center.y) * k,
      width: layout.width * k,
      height: layout.height * k,
    };
    const recovered = unscaleRectAroundCenter(visual, center, k);
    expect(recovered.left).toBeCloseTo(layout.left, 6);
    expect(recovered.top).toBeCloseTo(layout.top, 6);
    expect(recovered.width).toBeCloseTo(layout.width, 6);
    expect(recovered.height).toBeCloseTo(layout.height, 6);
  });

  // Every number below was read out of the live DOM in ONE frame, 300ms into a real
  // forward morph (Chrome, dev server, card #2 of the Home rail). Nothing here is
  // derived from the implementation, and both axes are asserted — the y-axis is where
  // the original 41px error lived, so a width-only check would miss the actual bug.
  //   <main>            inline scale(0.932783), computed matrix.a 0.932783
  //                     visual rect left 200.49 top -196.84 w 416.02 h 1503.18
  //                     -> centre (408.50, 554.75); layout offsetWidth 446, height 1612
  //   card, at rest     left 393.05  top  -64.00  w 179.55
  //   card, mid-recede  left 394.09  top  -22.41  w 167.49   (off by +41.59 / -12.06)
  it("recovers a real card rect measured through a real recede, on both axes", () => {
    const measured = { left: 394.09, top: -22.41, width: 167.49, height: 167.49 };
    const corrected = unscaleRectAroundCenter(measured, { x: 408.5, y: 554.75 }, 0.932783);
    expect(corrected.left).toBeCloseTo(393.05, 1);
    expect(corrected.top).toBeCloseTo(-64.0, 1);
    expect(corrected.width).toBeCloseTo(179.55, 1);
  });

  it("is what stands between the stored origin and a 41px landing error", () => {
    // Same frame, without the correction: this is what used to be stored, and what the
    // reverse morph then flew the photo back to.
    const measured = { left: 394.09, top: -22.41, width: 167.49, height: 167.49 };
    expect(measured.top - -64.0).toBeCloseTo(41.59, 1);
    expect(measured.width - 179.55).toBeCloseTo(-12.06, 1);
  });

  it("leaves a rect that was never inside the receding base view alone", () => {
    // Related-place cards live in DetailOverlay's portal, outside <main>, so no
    // correction may be applied to them at all.
    const rect = { left: 16, top: 554, width: 144, height: 180 };
    expect(unscaleRectAroundCenter(rect, center, 1)).toEqual(rect);
  });
});
