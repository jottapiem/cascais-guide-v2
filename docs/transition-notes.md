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

## Background layer: blur, deliberately no scale

`.ai/coding-standards.md` documents that scaling the live base view during the morph
was the cause of a previously-shipped "zoom-out" bug. The observation's E11 calls for
scale + blur together. Built blur only — two constant-blur layers (`SCRIM_BLUR_LIGHT_PX`
/`SCRIM_BLUR_PX`) cross-faded by progress, which reads as *increasingly* blurred without
ever animating `backdrop-filter` itself (also documented as janky in Chromium; opacity
on constant-blur layers is the existing established pattern, just now with two layers
instead of one so the amount visibly increases rather than jumping in one step). If the
recede/depth cue still feels too flat without any scale, that's a real trade-off to
revisit deliberately — not something to silently re-add.

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
