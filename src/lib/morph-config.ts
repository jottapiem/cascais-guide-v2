// ─────────────────────────────────────────────────────────────
// Shared-element morph configuration — single source of truth
// ─────────────────────────────────────────────────────────────
// These values MUST be used by every component that participates
// in the card ↔ detail shared-element transition:
//
//   1. AirbnbCard image wrapper (HomeView.tsx)
//   2. TransitionLayer container + image + sheet (TransitionLayer.tsx)
//   3. DetailView hero frame + sheet (DetailView.tsx)
//
// If you change a value here, it propagates everywhere and the
// morph stays pixel-consistent across all three states.
// ─────────────────────────────────────────────────────────────

/** The card's corner radius in pixels. This is the anchor — everything matches this. */
export const MORPH_RADIUS_PX = 28;

/** Full-radius string for image containers (all four corners). */
export const MORPH_RADIUS_ALL = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px`;

/** Sheet radius (top corners rounded, bottom square — sheet sits at screen edge). */
export const MORPH_RADIUS_SHEET = `${MORPH_RADIUS_PX}px ${MORPH_RADIUS_PX}px 0 0`;
