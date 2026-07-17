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
// TransitionLayer checks `matchMedia` itself and swaps to this near-critically-damped,
// fast-settling spring instead of skipping the morph outright — an instant jump-cut
// between a small card and a full hero is a worse experience than a very quick settle.
export const MORPH_SPRING_REDUCED = { type: "spring" as const, stiffness: 1000, damping: 70, mass: 1 };

// ─── Shape vs. motion completion (T1) ────────────────────────────────────────
// Ground-truth observation: the sheet's shape-extension (aspect-ratio match) finishes
// well before the position/scale morph does — around 17–50% of the way through, while
// the image is still only ~50% of the way to its final position. Framer's spring
// `progress` (0→1) doesn't map to a fixed ms timeline the way a duration-based
// animation would, so T1 is expressed here as a progress fraction rather than a ms
// offset. 0.55 sits in the observed range and reads correctly against this spring's
// particular stiffness/damping — tune if the spring config above ever changes.
export const MORPH_RADIUS_SNAP_PROGRESS = 0.55;
export const MORPH_CHROME_FADE_START = 0.55;

// ─── Hold phase (T2 → T3) + crossfade ───────────────────────────────────────
// The reference observation ties this hold to content-load time (Airbnb fetches the
// detail page over the network). This app's place data is bundled and local — there
// is no load to wait on — so this is a fixed, tuned placeholder purely for perceptual
// pacing/craft, not a functional wait. Flagged as a deliberate deviation, not an
// oversight: see summary notes.
export const MORPH_HOLD_MS = 220;
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
// E11, this only adds the scale half. Tune this value once you've seen it — 0.93 is a
// conservative starting point, not a measured one.
export const BASE_VIEW_RECEDE_SCALE = 0.93;
