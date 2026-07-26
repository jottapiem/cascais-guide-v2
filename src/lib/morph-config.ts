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

// Mid-flight retarget continuity for the t-driven SHAPE features (sheet expansion,
// sheet/chrome opacity, bottom-corner snap) — the analogue of retargetGeometry for the
// position. retargetGeometry keeps the *position* continuous by re-baselining geometry so
// mix(...,0) lands on the current on-screen box. But the shape features are pure functions
// of the raw progress t and would otherwise snap back to their t=0 values the instant a
// retarget resets progress to 0: a sheet that had already expanded would un-expand, faded-in
// chrome would blink out, square bottom corners would round again — a visible three-property
// pop, precisely in the sub-300ms window the retarget exists to smooth.
//
// The fix: never let those features run *backward* across a retarget. `floor` is the progress
// captured at the moment of retarget; the effective progress is clamped to never dip below it,
// so a feature holds at wherever it was and resumes forward once the fresh flight's t catches
// up. Destination is identical either way (the hero), so monotonic-forward is exactly right.
// On a first open or a reverse leg the floor is 0, making this an exact no-op — features track
// raw t as before, and reverse still runs them smoothly back down.
export function retargetFeatureProgress(t: number, floor: number): number {
  return Math.max(t, floor);
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
// Under- and critically damped springs decay inside an e^(-zeta*omega0*t) envelope;
// past critical damping the slow real root takes over and extra damping actively
// *slows* the settle down. Both branches agree at zeta = 1, as they must.
export function springSettleRate(spring: { stiffness: number; damping: number; mass: number }): number {
  const omega0 = Math.sqrt(spring.stiffness / spring.mass);
  const zeta = springDampingRatio(spring);
  return zeta <= 1 ? zeta * omega0 : omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
}

// Peak overshoot of a step response, as a fraction of the travelled distance: how far
// PAST its resting value the thing goes before settling back. Critically damped and
// overdamped springs never cross their target, so they report 0. This is the number that
// makes "bouncy" a measurable property instead of a taste claim — see BOTTOM_BAR_SPRING.
export function springOvershoot(spring: { stiffness: number; damping: number; mass: number }): number {
  const zeta = springDampingRatio(spring);
  if (zeta >= 1) return 0;
  return Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta));
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

// ─── The spec's t=0.3s, expressed the only way a spring can hold it ─────────────
// The reference spec is written against a fixed 0.8-0.9s clock. A spring has no fixed
// duration — its elapsed time depends on the distance travelled, which differs per card
// position — so a millisecond offset cannot be a contract here. The spec supplies its
// own bridge: at t=0.3s "the photo+sheet unit has covered 50% of its total translate/
// scale distance", and it pins every other phase-2 event to that same instant. Travel,
// not time, is therefore the invariant, and 50% travel is progress 0.5.
//
// What that costs, stated plainly: this spring passes 50% travel ~166ms after the tap
// (measured in Chrome, 393x852), not at 300ms. The spec's own motion-quality section
// demands "fast initial acceleration, an early velocity peak, then steep deceleration",
// and any curve of that shape is well past half its distance at half its duration — so
// "50% of travel" and "at 0.3s of a 0.6s morph" cannot both hold. Travel wins, because
// it is what the phase-2 sequencing is written against and because the spring config is
// a project constraint. See PROGRESS.md, evaluate/verify tables.
export const SPEC_HALF_TRAVEL_PROGRESS = 0.5;

// Sheet opacity finishes at the anchor, not after it. Spec: "Sheet hits 100% opacity and
// final aspect ratio at exactly t = 0.3s" — the same instant as the corner snap and the
// chrome fade-in start, so all three coincide by construction rather than by tuning.
// (Was 0.62, one frame *after* the old 0.55 threshold; the spec wants them simultaneous.)
export const SHEET_FADE_END = SPEC_HALF_TRAVEL_PROGRESS;

// Heavy scrim layer's fade end, expressed in BACKGROUND phase u (see backgroundPhase),
// not in morph progress. 1 means it is still deepening when the positional morph lands
// and only peaks at content-ready — which is exactly what the spec's Background Scene
// section requires. (Was 0.9 in progress-space, i.e. fully done before the morph ended.)
export const SCRIM_FADE_END = 1;

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

// ─── Shape vs. motion completion (the spec's t=0.3s) ─────────────────────────
// Spec, phase 2: "Instant, zero-duration event at t = 0.3s: Photo's bottom corners snap
// from rounded to square. This is a hard cut, not a fast ease — do not add any transition
// duration to this." Implemented literally: applyFrame writes the radius per frame with
// no CSS transition on clip-path, so the change lands inside a single frame.
//
// Moved 0.55 -> 0.5 so it sits on the 50%-travel anchor together with the chrome fade-in
// and the sheet's opacity/expansion finish, per the spec's "also triggered at t = 0.3s".
//
// Previously recorded here, and still true: the corners this snaps are not tucked under
// anything mid-flight — the clone's bottom edge floats mid-screen, so the hard cut is
// visible. That is no longer filed as a defect: the spec calls for exactly this hard cut,
// and with the sheet's bottom-edge expansion now landing on the same instant, the snap
// coincides with the box reaching its final aspect ratio instead of happening in the
// middle of nothing. Kept as a deliberate, spec-mandated event.
export const MORPH_RADIUS_SNAP_PROGRESS = SPEC_HALF_TRAVEL_PROGRESS;
// Spec, phase 2/3: place title, loading indicator and all three action buttons begin
// fading in at the anchor and reach full opacity together at the end of the positional
// morph. One shared opacity curve drives all of them — see TransitionLayer.applyFrame.
export const MORPH_CHROME_FADE_START = SPEC_HALF_TRAVEL_PROGRESS;

// ─── Sheet bottom-edge expansion (spec phase 2) ──────────────────────────────
// Spec: the sheet's bottom edge extends downward while it fades in, until the photo+sheet
// bounding box's aspect ratio matches the screen's — reaching it at the anchor. Before
// this, the clone's box was ALREADY at the final 19.5/9 ratio on frame one and merely
// scaled up, so no expansion was ever visible (screenshot spec-pass/B3-morph-t055-before).
//
// Implemented as a bottom inset on the clone's existing clip-path rather than by animating
// height: clip-path is already written every frame, costs no layout, and leaves the photo
// at the top of the box completely untouched — which is what keeps "no crop or aspect
// change, pure translate/scale" true for the photo itself.
export const SHEET_EXPAND_END = SPEC_HALF_TRAVEL_PROGRESS;
// Height of a card's title/subtitle block as a fraction of the card's own width. Measured
// in Chrome on the 393px rail card: photo 155.11px wide, text block (including its mt-1
// gap) 61.75px tall -> 0.398. This is what makes the sheet start exactly where the card's
// text was, per the spec's phase-1 starting geometry, instead of at a guessed offset.
export const CARD_TEXT_BLOCK_RATIO = 0.398;

// Bottom inset (in clone coordinates) that hides the not-yet-expanded part of the sheet.
// At t=0 the visible box is photo + text block; by SHEET_EXPAND_END it is the full
// container and the inset is exactly 0 from there on.
export function sheetExpansionInsetPx(t: number, heroWidth: number, containerHeight: number): number {
  const e = clamp01(t / SHEET_EXPAND_END);
  const startHeight = heroWidth * (1 + CARD_TEXT_BLOCK_RATIO);
  return Math.max(0, containerHeight - mix(startHeight, containerHeight, e));
}

// ─── Background phase (spec: continuous to content-ready) ────────────────────
// Spec, Background Scene: blur and z-recede increase "continuously and monotonically
// across the ENTIRE transition — still intensifying right up to content-ready, not just
// until t=0.6s". The positional morph only occupies the first stretch of that window, so
// the background runs on its own phase u in [0,1] spanning tap -> content-ready. The
// morph covers BACKGROUND_MORPH_SHARE of it; the hold carries u the rest of the way.
//
// 0.7 is measurement-derived, then deliberately rounded — not a free knob. The spring's
// settle callback was clocked at 569-603ms after tap across runs (569ms in this pass's
// post-change trace, 603ms in the earlier baseline; both above the 4x-CPU noise floor).
// MORPH_HOLD_MS adds 250ms, so the morph occupies 819/1069 = 0.75 down to 603/853 = 0.707
// of the tap->content-ready window. 0.7 is the rounded lower bound: it keeps content-ready
// inside the spec's 0.8-0.9s band (0.7 share => 250ms hold => 833-861ms total) with a hair
// of margin against the faster settle, rather than tracking either raw millisecond figure.
export const BACKGROUND_MORPH_SHARE = 0.7;
export function backgroundPhase(t: number): number {
  return clamp01(t) * BACKGROUND_MORPH_SHARE;
}

// Only the FORWARD leg has a hold, so only the forward leg's background window is longer
// than its morph. A reverse always starts from a settled detail page, where the hold has
// already carried the background all the way to u = 1 — so the reverse must map its
// progress over the full range, or its very first frame would pop the base view back out
// by (1 - BACKGROUND_MORPH_SHARE) of the recede before starting to animate.
// Reverse cannot be entered mid-forward-flight (DetailOverlay, which owns the back
// button, only mounts at T3), so the two mappings can never meet in the middle.
export function backgroundPhaseFor(t: number, phase: MorphPhase): number {
  return phase === "reverse" ? clamp01(t) : backgroundPhase(t);
}

// ─── Hold phase (spec t=0.6s → content-ready) + crossfade ───────────────────
// Spec, phase 4: between the end of the positional morph and content-ready "only the
// Loading Indicator keeps animating; everything else is static", with content-ready
// landing at ~0.8-0.9s. That window is what this constant is.
//
// History worth keeping, because it is a reversal: a previous verification pass measured
// this hold at 220ms, watched it, and cut it to 0 — the app's place data is bundled, so a
// spinner here turns over a photo that is already decoded and on screen, which read as
// manufactured latency. The reference spec then asked for the hold and the loading
// indicator back, explicitly and by name. The spec wins as a design decision, but the
// earlier observation was not wrong and is not deleted: this pause is perceptual pacing,
// not a real wait. 250ms is derived, not re-guessed — the spring settles 603ms after the
// tap (measured), so 603 + 250 = 853ms puts content-ready inside the spec's 0.8-0.9s
// window. Asserted in tests/morph/morph-spec-timeline.test.ts.
export const MORPH_HOLD_MS = 250;
// T3: the clone fades out the instant the real content sheet fades in — literally the
// same fading DOM subtree here, so the spec's "single simultaneous crossfade, zero gap
// between them" falls out of the architecture rather than needing two synced timers. The
// loading indicator lives inside that same subtree, so it fades out with it, on the same
// frame, by construction. Measured 243ms in Chrome against this 260ms setting.
export const MORPH_CROSSFADE_MS = 260;

// Spec, phase 5: the bottom bar rises "after the content crossfade ends" — "strictly
// sequential, not parallel with the crossfade". The crossfade starts the instant the
// morph hands off, so waiting exactly its duration is what makes the two sequential.
// (Was 50ms, which started the bar in the middle of the crossfade — measured at 753ms
// against a crossfade running 603 -> 863ms.)
export const BOTTOM_BAR_DELAY_MS = MORPH_CROSSFADE_MS;

// Spec, phase 5: translate-only, "never a fade", and the ONE element with genuine bounce
// rather than the overdamped settle used everywhere else — it should visibly overshoot
// its resting position before settling back. Damping 24 against stiffness 400 puts the
// damping ratio at 0.6, i.e. a 9.5% peak overshoot (springOvershoot above): on a ~70px
// bar that is ~6.7px past the resting line — visible, not comical. Replaces a 340ms
// easeOut, which by definition never overshoots at all.
export const BOTTOM_BAR_SPRING = { type: "spring" as const, stiffness: 400, damping: 24, mass: 1 };
// Kept for the reverse/instant paths, which use a plain duration rather than the spring.
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
// Both fade-end points are now expressed in BACKGROUND phase u (see backgroundPhase),
// not in morph progress: the spec requires the blur to keep intensifying through the
// hold, right up to content-ready, so the heavy layer must not be finished when the
// positional morph lands. The light layer still crosses first, which is what makes the
// blur read as increasing rather than stepping.
//
// Measured 2026-07-25 (previous pass, in progress-space): the two-layer cross-fade does
// read as a continuous increase rather than a step. Noted honestly and unchanged: on this
// light-on-light UI the combination is strong — around half-travel the base view is
// already an unreadable wash. That is on the heavy side of "recede" but it is a taste
// call, not a defect, so the blur amounts stay.
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
// This is now the value at CONTENT-READY, not at the end of the positional morph: the
// recede runs on the same background phase u as the blur, so at morph-complete it sits at
// mix(1, 0.93, BACKGROUND_MORPH_SHARE) = 0.951 and keeps receding through the hold. Spec:
// the z-recede continues "in lockstep with the blur" across the entire transition.
//
// It has one non-obvious consequence, now handled: while this transform is applied,
// getBoundingClientRect() on any card inside <main> returns the *visually scaled*
// box. Tapping a second card mid-morph therefore used to store a wrong origin, and
// the reverse morph flew back to it — measured 40.8px too low and 10.2px too narrow
// after a re-tap 300ms in. MorphCard now converts that rect back to layout
// coordinates via unscaleRectAroundCenter() before storing it.
export const BASE_VIEW_RECEDE_SCALE = 0.93;
