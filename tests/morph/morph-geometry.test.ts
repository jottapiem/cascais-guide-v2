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

  // This is the whole point of the function: restarting the spring from 0 against
  // the returned geometry must put the clone exactly where it already is, so the
  // retarget is invisible.
  it("produces a geometry whose t=0 frame equals the previous geometry at the current progress", () => {
    for (const t0 of [0.05, 0.25, 0.5, 0.83, 0.99]) {
      const next = retargetGeometry(prev, t0, heroRadius);
      expect(next.originLeft).toBeCloseTo(mix(prev.originLeft, 0, t0), 10);
      expect(next.originTop).toBeCloseTo(mix(prev.originTop, 0, t0), 10);
      expect(next.scaleX).toBeCloseTo(mix(prev.scaleX, 1, t0), 10);
      expect(next.scaleY).toBeCloseTo(mix(prev.scaleY, 1, t0), 10);
      expect(next.startRadius).toBeCloseTo(mix(prev.startRadius, heroRadius, t0), 10);
    }
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

  it("recovers the real card width from the two numbers actually measured in the browser", () => {
    // Card #2 in the Home rail, tapped 300ms into a forward morph. Chrome reported
    // width 144.9 while <main> stood at scale(0.934072); the card's real layout
    // width is 155.1. Both numbers come from that run and neither is derived from
    // the other, so this is a real check rather than a restatement of the formula.
    const measuredWhileReceding = { left: 184, top: 227.8, width: 144.9, height: 144.9 };
    const corrected = unscaleRectAroundCenter(measuredWhileReceding, center, 0.934072);
    expect(corrected.width).toBeCloseTo(155.1, 1);
  });

  it("leaves a rect that was never inside the receding base view alone", () => {
    // Related-place cards live in DetailOverlay's portal, outside <main>, so no
    // correction may be applied to them at all.
    const rect = { left: 16, top: 554, width: 144, height: 180 };
    expect(unscaleRectAroundCenter(rect, center, 1)).toEqual(rect);
  });
});
