# Card → Detail transition — implementation notes

Context for whoever reads this next: the starting point was already a fairly mature
FLIP-based clone (`TransitionLayer.tsx`) driven by a Framer Motion spring, plus a
detailed behavioral observation of Airbnb's card→detail transition (element-by-element
timeline, T0–T3). This is a record of what changed, what was deliberately kept
different from the literal observation, and what's still unverified.

## Architecture (unchanged, worth restating)

One `progress` value (0 = resting at card, 1 = resting at hero), animated by a single
Framer Motion spring, mutating DOM styles directly via refs in `applyFrame()` — no
React re-render per frame. Both forward and reverse target the same value, which is
what makes a fast re-tap or quick back-then-forward redirect smoothly instead of
snapping. This wasn't rebuilt; it was the right foundation and everything below hangs
off it.

## Spring vs. bezier

Already spring-based before this change (`stiffness: 400, damping: 40, mass: 1` —
`morph-config.ts`). Not revisited, for the same reason the original observation argues
for springs: fast-start/steep-late-decel is what mass-spring-damper systems produce
natively, and it's what makes interruption possible at all — a bezier can't be
redirected mid-flight without a visible seam.

## T1 as a progress fraction, not a millisecond offset

The observation's timestamps (T0/T1/T1b/T2/T3) describe a *fixed-duration* animation.
A spring doesn't have a fixed duration — "when it settles" depends on the distance
travelled, which varies per card position. So T1 ("shape extension done, ahead of the
position/scale morph") is expressed as `MORPH_RADIUS_SNAP_PROGRESS = 0.55` and
`MORPH_CHROME_FADE_START = 0.55` — a progress fraction, tuned against this specific
spring config. If the spring's stiffness/damping ever changes, re-eyeball this value;
it's not derived from anything more principled than "reads correctly against this
spring."

## Per-corner radius: one deliberate deviation from the literal spec

Bottom corners: hold at source radius, then hard-snap to 0 at the T1 threshold — no
easing, exactly as observed. Structurally correct here too, since the bottom edge
tucks under the sheet.

Top corners: the observation says these *never change* from the source card's radius,
specifically so that if the photo ends up edge-to-edge, its corners match the physical
device screen corners. That's the reasoning, not just the instruction — and it doesn't
transfer, because this app's hero never goes edge-to-edge. It rests as a rounded card
inset in a `max-w-md` column (`MORPH_RADIUS_HERO_PX`). Freezing the top corners here
would just leave them under-rounded relative to their own resting design. So top
corners keep interpolating to `MORPH_RADIUS_HERO_PX` throughout. Flagging this clearly
because it's the one place code does something other than what the observation
literally says — everywhere else (bottom-corner snap, sheet-before-position sequencing,
chrome landing at T2) is implemented as described.

## No title text in the chrome overlay (E6)

The observation's E6 is a header-bar title. This app's resting detail-page design has
no header-bar title — the place name is a large heading inside the scrollable sheet,
not floating chrome over the photo. Inventing a floating title here would be importing
a UI element the design doesn't otherwise have, not recreating an existing one. E6 is
represented by the type badge (which does live in the header, in both the morph chrome
and the real `DetailOverlay`) rather than new text.

## Background layer: blur — see follow-up pass below for the scale half

`.ai/coding-standards.md` documents that scaling the live base view during the morph
was the cause of a previously-shipped "zoom-out" bug. The observation's E11 calls for
scale + blur together. Built blur only — two constant-blur layers (`SCRIM_BLUR_LIGHT_PX`
/`SCRIM_BLUR_PX`) cross-faded by progress, which reads as *increasingly* blurred without
ever animating `backdrop-filter` itself (also documented as janky in Chromium; opacity
on constant-blur layers is the existing established pattern, just now with two layers
instead of one so the amount visibly increases rather than jumping in one step).

*(Superseded below — the scale half was explicitly requested and has now been added
back in, with the DOM-structure reasoning for why it's safe this time.)*

## Hold phase (T2→T3) and the loading spinner

The observation ties this hold to content-load time — Airbnb fetches the detail page
over the network, and the hold is "however long that takes." This app's place data is
bundled (`AGENTS.md`: "alle content werkt zonder netwerk") — there is nothing to wait
for. `MORPH_HOLD_MS = 220` and the spinner (E7) are implemented anyway, purely for
perceptual pacing/craft parity with the reference — not functional necessity. This is
the clearest "tuned placeholder, not a derived value" in the whole implementation;
if it doesn't earn its keep on review, it's the first thing to cut or shorten.

T3 itself (spinner + sheet fading out, real content fading in, "at the same instant")
falls out of the architecture rather than needing separate choreography: the spinner is
inside the same fading container as the rest of the clone, so its fade-out is
automatically simultaneous with the crossfade, by construction, not by hand-syncing two
separate timers.

## E10 — bottom bar

Changed from an opacity fade to a `translateY` rise (`BOTTOM_BAR_RISE_MS = 340`,
independent of the content sheet's own fade), matching the observation's explicit "not
opacity-based" note. Duration is a tuned placeholder — the observation flags this one
as genuinely unspecified.

## E9 — content sheet

Removed a 14px slide-up that was on the real `DetailOverlay` sheet's mount animation.
The observation is explicit that E9 occupies the exact position/size E4 was already
holding — a straight crossfade, no motion. The 14px slide was small enough to mostly
read as "settling," but it's not what's described, and removing it costs nothing.

## Regression check: re-tapping a different card mid-hold

Widening T2→T3 into an actual ~220ms window (previously near-zero) exposed a real edge
case: `progress` never resets to 0 between two forward morphs unless `morphPlace`
passed through `null` in between, which it doesn't when going from one detail page
straight into a related-place card. Without a fix, `animate(1, 1, ...)` targeting the
new card's geometry is a no-op — the clone would sit at the old hero position instead of
animating to the new card's origin. Fixed by resetting `progress` to 0 whenever a
forward morph targets a *different* card instance while already resting at 1; genuine
in-flight interruptions (0 < progress < 1) are untouched and still redirect smoothly,
which was already correct before this change.

*(See follow-up pass below — the "mid-flight, not resting" version of this same
scenario was still unhandled and has now been fixed too.)*

## Reduced motion

`.ai/coding-standards.md`'s existing global CSS rule
(`prefers-reduced-motion: reduce { transition-duration: 0.01ms }`) can't reach this
spring — it's driven by Framer Motion's RAF loop, not a CSS transition. Added an
explicit `matchMedia` check in `TransitionLayer` that swaps to a much stiffer,
faster-settling spring (`MORPH_SPRING_REDUCED`) and skips the hold, rather than
disabling the morph outright — an instant jump-cut between two very different sizes
reads as more broken than a very quick, still-continuous settle.

## What was actually verified vs. eyeballed

Verified for real, in this sandbox: `tsc --noEmit` clean, `eslint` clean (no new
warnings/errors beyond pre-existing ones on lines this change didn't touch), and the
sequencing logic was traced through by hand (spring completion → hold timer → crossfade
trigger → interruption/cleanup paths).

**Not verified — flagging rather than papering over:**
- No visual/on-device confirmation. `next build` in this sandbox fails on an unrelated
  network restriction (Google Fonts fetch, blocked by the sandbox's egress allowlist —
  present on the unmodified codebase too, nothing to do with this change). Load it in
  a real dev server and actually watch it, ideally slowed down, before trusting the
  tuned numbers (`0.55` progress threshold, `220ms` hold, `340ms` bottom-bar rise).
- The two-layer scrim blur amounts (10px / 24px) and their fade-end points (0.45 / 0.9)
  are a first pass, not derived from anything — tune against how it actually looks.
- Reduced-motion path is implemented but I have no way to visually confirm it in this
  sandbox (no way to toggle OS-level `prefers-reduced-motion` here).
- Real side-by-side frame comparison against actual Airbnb footage was never possible
  from a text observation — if that footage is available, the two values most worth
  checking against it are the `0.55` shape/chrome threshold and how "steep" the spring's
  actual deceleration reads compared to the real thing.

## Follow-up pass — static-review fixes, before any on-device tuning

This pass didn't touch anything that needs eyes to tune (`MORPH_HOLD_MS`,
`BOTTOM_BAR_RISE_MS`, `MORPH_RADIUS_SNAP_PROGRESS`, the scrim blur/fade values) — those
are still exactly as the previous pass left them, waiting on a real look. What follows
came from re-reading the code against the observation, not from watching it run.

**Fixed:**

1. **E3 fade-out missing on the `row` variant.** `rich` (rail/boxed-grid) already faded
   its title/subtitle out over `CARD_TEXT_FADE_MS` on tap; `row` (Trips) didn't — the
   image cut to opacity 0 instantly while the text sitting next to it stayed fully
   visible, so tapping a trip card would show the photo vanish while the name/subtitle
   kept floating there. Now uses the same `CARD_TEXT_FADE_MS` fade as `rich`.

2. **Real back/favorite buttons were tappable while invisible.** `DetailOverlay`'s
   buttons fade in via opacity, but `pointer-events-auto` was unconditional — the
   invisible buttons still received taps during the forward morph and the T2→T3 hold.
   The observation is explicit that T3 is "also when the page becomes interactive,"
   implying it isn't before. Added an `interactive` flag
   (`!exiting && morphPhase === "idle"`) gating hit-testing the same way opacity was
   already gated.

3. **Sheet opacity finishing too late relative to the shape threshold.**
   `SHEET_FADE_END` was `0.78` — on this spring (critically damped: stiffness 400 /
   damping 40 / mass 1, damping ratio exactly 1), progress 0.78 sits close to full
   settle, not "shortly after" the `0.55` shape/radius-snap threshold the way T1→T1b
   describes it. Brought down to `0.62`.

## Follow-up pass — background recede (E11 scale), explicitly requested back in

The earlier pass left the scale half of E11 out, citing a previously-shipped
"zoom-out bug" from scaling the live base view. That decision has been explicitly
overridden — the recede/zoom effect is wanted regardless. Re-investigated why the old
attempt broke and built it to avoid the same failure mode rather than just re-adding
the old code:

**Most likely cause of the original bug:** a CSS `transform` on an element creates a
new *containing block* for every `position: fixed` descendant inside it. If the scale
was previously applied to an ancestor that also contained this clone's own
`position: fixed` elements (or, worse, `DetailOverlay`'s, before it was moved behind a
`createPortal`), every fixed-positioned piece of this whole system would have started
tracking that scaled ancestor's box instead of the viewport — explaining a "zoom-out"
class of bug (things sized/positioned as if the viewport had shrunk).

**Why this is structurally safe now:** `DetailOverlay` already renders through
`createPortal(..., document.body)` — fully outside `AppShell`'s tree, immune to
anything scaled inside it. `TransitionLayer`'s own `position: fixed` elements are
rendered as **siblings** of `<main>` in `AppShell`, not descendants of it. So scaling
only `<main>` (the base view) cannot become a containing block for anything this system
needs fixed-to-viewport — checked this explicitly before writing any code, not assumed.

**Implementation:** `AppShell` holds a `baseViewRef` (on `<main>`, a plain element, not
Framer-controlled — Framer only touches the `motion.div` *inside* it, so there's no
fight between Framer's own style writes and this imperative one) and passes it to
`<TransitionLayer baseViewRef={baseViewRef} />`. `applyFrame()` sets
`main.style.transform = scale(mix(1, BASE_VIEW_RECEDE_SCALE, t))` alongside everything
else it already drives from the same `t` — same T0→T2 window as the blur, per the
observation. `BASE_VIEW_RECEDE_SCALE = 0.93` in `morph-config.ts` — a conservative
starting guess, not a measured one. `will-change: transform` is toggled on only while a
forward/reverse run is active and cleared once things are static (idle, or fully
cleared), rather than left on `<main>` permanently.

Two things this could not verify without eyes on a device: whether 0.93 is the right
amount of recede (too subtle / too aggressive), and whether the edges revealed by the
shrink read cleanly — `<main>`'s parent already shares the same `bg-background` color,
so the reveal *should* be seamless rather than showing a mismatched color, but that's
reasoned from the CSS, not observed.

## Follow-up pass — mid-flight card re-target

The earlier "regression check" fix only covered tapping a different card while
*resting* at the hero (progress ≈ 1). It didn't cover tapping a different card while a
morph was genuinely still *mid-flight* (0 < progress < 1) — e.g. a fast tap on two
different cards in a row. Confirmed this is actually reachable: `MorphCard.handleTap`
calls `setMorphPlace` unconditionally, nothing in the store or any list view blocks
taps on other cards while a morph is in flight, and this pattern shows up in several
places (Home rails, Explore/Category/Favorites/Search grids, Trips rows, and the
related-places strip *inside* `DetailOverlay` itself).

Previously, that scenario would recompute geometry for the new card but leave
`progress` wherever it was — the next spring frame would then render the new card's
origin mixed with the *old* progress value, an instant visible jump. Fixed by
detecting this specific case (`isFreshTarget` while `0 < progress < ~1`, distinct from
the already-handled "resting at hero" case) and retargeting from wherever the clone
currently sits — computed with the exact same `mix()` `applyFrame` already uses every
frame — instead of the new card's real DOM rect, then resetting progress to 0 to
restart the spring cleanly from there. Top-corner radius carries over this way too
(interpolated the same way); a retarget landing after the bottom-radius snap threshold
can still show a brief bottom-corner correction — a narrow, sub-300ms edge case judged
an acceptable trade-off against fully modeling both corners independently through a
retarget.

## Follow-up pass — scrim left blurring past T3 on wide viewports

The scrim's opacity is only ever written inside `applyFrame`, which stops running once
`morphPhase` is `"idle"` — so whatever opacity it was left at (fully blurred) persisted
for as long as the detail page stayed open. Invisible on phone-width viewports
(`DetailOverlay` is opaque edge-to-edge there), but the scrim is `position: fixed;
inset: 0` — full viewport — while `AppShell`'s `sm:` styles put the app in a centered
`max-w-md` column with visible margins on wider screens. On those, the scrim would keep
blurring the margins for as long as the detail page stayed open. Now fades to 0 over
`MORPH_CROSSFADE_MS` the moment `morphPhase` reaches `"idle"`, and the CSS `transition`
that fade needs is reset back to `none` at the start of the next forward/reverse run so
it can't fight the per-frame imperative writes.

**Still not verified — same caveat as before:** no on-device pass on any of this
follow-up work either. Specifically worth checking: does `0.93` read as the right
amount of background recede, does the mid-flight retarget actually read smooth on a
fast double-tap (hard to trigger deliberately even with eyes on it), and does the wider
`sm:` breakpoint layout look correct with the scrim now clearing on idle.
