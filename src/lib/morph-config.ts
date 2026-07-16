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

// ─── Sheet overlap ──────────────────────────────────────────────────────────
export const SHEET_OVERLAP_PX = 48;
export const SHEET_OVERLAP_REM = `${SHEET_OVERLAP_PX / 16}rem`;

// ─── Hero height (1:1 square) ───────────────────────────────────────────────
export const HERO_HEIGHT_CSS = `min(${APP_CONTAINER_REM}rem, 100vw)`;

// ─── Timing ─────────────────────────────────────────────────────────────────
export const MORPH_DURATION_MS = 480;
export const MORPH_DURATION_S = MORPH_DURATION_MS / 1000;
export const MORPH_SPRING = { type: "spring" as const, stiffness: 400, damping: 40, mass: 1 };
export const SHEET_FADE_END = 0.78;
export const SCRIM_FADE_END = 0.9;

// ─── Easing curves (shared) ─────────────────────────────────────────────────
export const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

// ─── Scrim (static blur, opacity-only animation) ────────────────────────────
export const SCRIM_BLUR_PX = 24;
export const SCRIM_TINT = "oklch(0.16 0.012 230 / 0.10)";
