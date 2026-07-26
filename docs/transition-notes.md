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
inset in a `max-w-md` column (`MORPH_RADIUS_HERO_PX`).

> **Correction, 2026-07-25 (on-device pass):** "never goes edge-to-edge" is only true
> above 448px. The hero is `min(100vw, 448px)` wide, so on any phone — 393px on an
> iPhone 16 — it *is* edge-to-edge horizontally and its top corners sit in the physical
> screen corners, which is the exact situation the observation's rule was written for.
> The conclusion happens to survive anyway: the interpolated 49px lands close to a real
> iPhone's ~47–55px corner radius, so the rounding reads as intentional rather than
> under-rounded (screenshot `docs/morph-verify/03-detail-rest-light.png`). Keeping the
> current behaviour, but the stated reason for it does not hold on the target device. Freezing the top corners here
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

> **Superseded 2026-07-25 (on-device pass):** it did not earn its keep. `MORPH_HOLD_MS`
> is now 0 and the spinner has been removed from `TransitionLayer`. The section below
> describes the state before that; see "On-device verification pass" at the end.

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

**Superseded 2026-07-25 by agent `morph-verify`.** Everything below the line was written
before anyone had seen the morph run. It has now been run, measured frame by frame and
screenshotted in Chrome — see the section "On-device verification pass" at the end of
this file for what held up, what did not, and what changed as a result. The historical
text is kept because it records what was assumed at the time.

---

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

> **Superseded 2026-07-25 (on-device pass):** all three were checked. 0.93 reads as
> recession rather than zoom-out; the fast double-tap retargets smoothly (largest frame
> step 26.8px against a natural ~20px next-frame delta); and the `sm:` layout is correct,
> with both scrim layers measured back at opacity 0 once the page is idle. What the pass
> *did* find here is that this same recede corrupts any card rect measured while it runs
> — see item 3 of "On-device verification pass" below.

## On-device verification pass — 2026-07-25, agent `morph-verify`

The morph was finally run and watched: Chrome, `next dev` on :3001, 393x852 at dpr3
(iPhone-class) plus a 1680px-wide pass for the `sm:` breakpoint. Method: a
`requestAnimationFrame` wrapper installed *before* the app bundle evaluates (framer-motion
captures `requestAnimationFrame` once at module-eval time, so a patch applied after load
never sees the spring loop), sampling the actually-applied DOM styles every frame, plus
the ability to freeze the spring on a chosen frame so mid-flight states could be
screenshotted rather than guessed at. Harness kept at `docs/morph-verify/instrument.js`,
raw per-frame traces under `docs/morph-verify/traces/`, screenshots alongside them.
Progress is derived, never assumed: `t = (scaleX - s0) / (1 - s0)`.

**The spring itself is healthy.** 29 animation frames over 468ms, inter-frame gaps
15.9–17.4ms with zero gaps over 20ms; under 4x CPU throttling the worst frame gap was
20.2ms with no long tasks in the window, and DevTools reported CLS 0.00. `MORPH_SPRING`
is exactly critically damped (ratio 1.000) and the traces show no overshoot in either
direction. It stays.

**Confirmed against measurement, unchanged:** `MORPH_RADIUS_SNAP_PROGRESS` /
`MORPH_CHROME_FADE_START` 0.55 (fires ~150ms into a ~480ms morph — 31% of elapsed time
with the image 55% of the way there, inside the observed window), `SHEET_FADE_END` 0.62,
`SCRIM_FADE_END` 0.9 and `SCRIM_LIGHT_FADE_END` 0.45 (both land exactly where specified,
and the blur does read as increasing rather than stepping), `SCRIM_BLUR_PX` 24 /
`SCRIM_BLUR_LIGHT_PX` 10, `MORPH_CROSSFADE_MS` 260 (measured 243–280ms),
`BOTTOM_BAR_RISE_MS` 340 (measured ~331ms, translateY only, opacity stays 1),
`CARD_TEXT_FADE_MS` 70 (measured ~70ms), `BASE_VIEW_RECEDE_SCALE` 0.93.

**Changed, with the measurement that forced it:**

1. `MORPH_HOLD_MS` 220 → **0**, and the E7 spinner is **removed** from `TransitionLayer`.
   Seen: 220ms of an empty white sheet with a spinner turning over a photo that is
   already decoded and on screen, on top of a ~560ms settle and a 260ms crossfade. It
   reads as manufactured latency. Time from spring-settle to real content is now 28ms,
   down from ~250ms. Removing the spinner also makes the clone's chrome an exact match
   for `DetailOverlay`'s real header, which is what keeps the T3 hand-off from popping.

2. `MORPH_SPRING_REDUCED` damping 70 → **63**. The old value made this spring *overdamped*
   (ratio 1.107), which cancelled the higher stiffness completely: its slowest decay term
   came out at 19.9998 1/s against the default spring's 20.0 — mathematically the same
   settle. Measured in the browser: 400ms versus 450ms. The reduced-motion accommodation
   was not accommodating. 63 restores critical damping (ratio 0.996) and a 31.6 1/s decay
   rate, a genuine ~1.6x faster settle. `springSettleRate()` in `morph-config.ts` is what
   the regression test asserts on.

3. **`MorphCard` now stores tap origins in layout coordinates.** `getBoundingClientRect()`
   reports the *visual* box, and E11 scales `<main>` during the morph — so tapping a
   second card mid-morph stored a rect measured through the recede. Measured: a card
   tapped 300ms in reported top 228.9 instead of 187 and width 137.1 instead of 147.1,
   and the reverse morph then flew the photo back to that wrong box (40.8px too low,
   10.2px too narrow). `unscaleRectAroundCenter()` undoes the ancestor scale; measured
   again afterwards, the landing error is 0.1px. Cards outside `<main>` — the
   related-places strip lives in `DetailOverlay`'s portal — find no ancestor and are
   correctly left untouched.

**The four never-tested scenarios, now tested:**

- *Mid-flight retarget* (tap two different cards fast): works. Largest single-frame
  movement at the retarget was 26.8px against a natural next-frame delta of ~20px — an
  acceleration, not a teleport. The bottom-corner radius carries over at the interpolated
  value (25.1px rather than the card's 20px) exactly as this file predicted.
- *Resting retarget* (related card from an open detail page): navigates correctly, but
  **starts with a visible jump** — see open issues below.
- *Reduced motion*: the `matchMedia` swap and the hold-skip both fire correctly; the
  spring itself was the problem, now fixed.
- *`sm:` breakpoint*: verified at 1680px and 817px. Both scrim layers are full-viewport
  and both are back to opacity 0 once the page is idle, `will-change` is released, and
  the 448px overlay fully covers the receded 414.8px column so the shrunken base view
  never peeks out. The cleanup fix works.

Also checked: dark mode (reachable only through the profile toggle — `next-themes` runs
with `enableSystem={false}`, so the OS setting does nothing), and the hit-testing gate.
The gate works — mid-morph the back button computes to `pointer-events: none` and
`document.elementFromPoint()` at its centre returns the clone's image instead. One
correction to the note above, though: for the *initial* forward morph from a list view
there is nothing to gate, because `DetailOverlay` only mounts at T3. The gate earns its
keep on the reverse leg and on detail→related-card morphs, not on the first open.

### Open, deliberately not changed here

- **The bottom-radius snap is a visible pop.** The reasoning above ("the bottom edge
  tucks under the sheet") does not hold in this app: at progress 0.55 the clone's bottom
  edge is floating around 63% down the screen, so the hard 20px→0 snap happens on a free
  edge in plain view (screenshots `02b`/`02c`). It only becomes a non-issue at rest,
  where the container's bottom sits at/below the viewport edge. No *value* fixes this —
  moving the threshold just moves the pop. `MORPH_RADIUS_SNAP_PROGRESS = 1` would hide it
  (the corners would hold at the source radius and snap off-screen), and interpolating
  the bottom corners like the top ones would remove it outright. Both change behaviour
  this file explicitly documents as deliberate, so the call belongs to whoever owns that
  decision, not to a verification pass.
- **A morph launched from an open detail page skips its first ~13%.** Reproduced 3/3:
  from Home the first animated frame lands at t≈0.01–0.08, from a related card at
  t≈0.12–0.15 — a ~72px jump on the first painted frame. `applyFrame(0)` runs in the
  layout effect but the next frame consumes a large (clamped ~40ms) first delta before
  the browser paints. Fixing it means controlling Motion's frame clock; out of scope for
  this pass.
- **Back after a related-card navigation does not leave the detail page.** A → related B
  → back plays the full reverse morph and then lands on B's detail page again, because
  `finishMorphForward` pushes `"detail"` onto history and `finishMorphReverse` pops
  straight back to it. A second back then exits. The fix lives in `app-store.ts`, which
  is outside this agent's terrain — escalated rather than touched.
- **`.morph-scrim` in `globals.css` has rotted.** Its comment claims the timing is kept
  in sync with `MORPH_DURATION`/`MORPH_EASE` in `TransitionLayer`, and it still carries
  an `.is-active` rule that nothing uses — opacity is driven imperatively per frame now,
  and the inline `transition` overrides the 480ms one in the class. Harmless at runtime,
  misleading to read. `globals.css` is shared ground, so it is reported, not edited.
