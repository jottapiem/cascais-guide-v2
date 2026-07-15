// Shared-element morph configuration — single source of truth.
// Consumed by: MorphCard (captures tap origin + radius), TransitionLayer (spring engine),
// DetailView (hero + sheet resting state).
//
// Everything the morph animates — position, scale, radius, sheet opacity, scrim blur — is
// derived from ONE spring-driven progress value in TransitionLayer, not from independent
// timers. That's a deliberate fix: previous versions synchronized these with separate
// CSS transition durations that had to be hand-kept in sync across files (see git history —
// "fix: transition sync" shows up repeatedly). A single driver removes that failure mode.

export const MORPH_RADIUS_PX = 28;
export const MORPH_RADIUS_ALL = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px`;
export const MORPH_RADIUS_SHEET = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px 0 0`;

// Reference duration — used only to size the non-spring bits (scrim CSS transition,
// a ballpark for design/QA). The transform itself is a real spring and settles by
// physics, not by this clock.
export const MORPH_DURATION_MS = 480;
export const MORPH_DURATION_S = MORPH_DURATION_MS / 1000;

// Critically-damped-ish spring for the shared-element transform (position + scale).
// stiffness/damping chosen so it settles in ~MORPH_DURATION_MS for a typical card→hero
// distance with negligible overshoot (a bouncy corner-to-corner morph reads as a glitch,
// not "premium"). Genuinely velocity-aware: interrupting mid-flight (fast re-tap, quick
// back-then-forward) continues from the live position/velocity instead of snapping.
export const MORPH_SPRING = { type: "spring" as const, stiffness: 400, damping: 40, mass: 1 };

// Fraction of the transform's progress at which the sheet should finish fading in —
// "shortly before the morph finishes" per spec, so the sheet feels attached to the
// photo rather than trailing it.
export const SHEET_FADE_END = 0.78;

// Fraction of progress at which the background scrim blur should be fully resolved —
// synchronized with movement rather than snapping in/out.
export const SCRIM_FADE_END = 0.9;

export const SHEET_OVERLAP_PX = 48; // Visual overlap of the sheet under the photo
