# Morph verification evidence

Produced by agent `morph-verify`, 2026-07-25/26. Read `PROGRESS.md` in the worktree root
for the verdict per constant; this folder is the raw material behind it.

## Read this before citing a screenshot

**All nine PNGs are the PRE-CHANGE baseline** — captured before any constant was touched,
which is what the assignment asked for ("leg de uitgangssituatie vast ... zodat je later
kunt aantonen dat iets beter of slechter werd"). `02d-morph-t0996-hold-chrome-spinner.png`
in particular still contains the spinner that was subsequently removed; that is the point
of the shot — it is the evidence for cutting it, not a picture of the current build.

There are **no post-change screenshots**: the Chrome DevTools MCP connection that could
write PNGs to disk (and inject the pre-load rAF harness) dropped partway through the
session, and the in-app browser pane cannot save images to a file. Post-change behaviour
was therefore verified as measurements instead — see `traces/post-change-verification.json`,
which covers the hold removal, the origin-rect correction, the hit-testing gate, dark mode,
the `sm:` breakpoint and the cleanup after back.

Screenshots were downscaled to 620px wide (from dpr3 originals) to keep the repo sane.

## Files

| file | what it is | build |
|---|---|---|
| `01-home-light.png` | home at rest, 393x852 | pre-change |
| `02a-morph-t032.png` | frozen mid-morph, t = 0.32 | pre-change |
| `02b-morph-t050-before-snap.png` | t = 0.50, bottom corners still 20px round | pre-change |
| `02c-morph-t057-after-snap.png` | t = 0.57, bottom corners snapped square | pre-change |
| `02d-morph-t0996-hold-chrome-spinner.png` | t = 0.996 — what the 220ms hold looked like | pre-change |
| `03-detail-rest-light.png` | detail at rest | pre-change |
| `04a-morph-dark-t078.png` | dark mode mid-morph (wide viewport) | pre-change |
| `05a-wide-sm-morph-t049.png` | `sm:` width mid-morph, scrim blurring the margins | pre-change |
| `05b-wide-sm-detail-rest-scrim-cleared.png` | `sm:` at idle, scrim cleared | pre-change |
| `instrument.js` | the rAF measurement harness, and why it must load first | — |
| `traces/trace-forward-*.json` | per-frame forward morph | pre-change |
| `traces/trace-reverse-1.json` | per-frame reverse; **polluted run**, see note below | pre-change |
| `traces/trace-midflight-retarget.json` | fast tap on two cards | pre-change |
| `traces/trace-late-retarget-reverse.json` | the 40.8px landing error | pre-change |
| `traces/trace-resting-retarget.json` | **polluted run** — `placeA == placeB`, `framesInMorph: 0`; kept because the pollution is itself the finding that the same-card re-tap is a no-op | pre-change |
| `traces/trace-resting-retarget-2.json` | the clean rerun | pre-change |
| `traces/trace-startpop-repeat.json` | 3x from home vs 3x from a related card | pre-change |
| `traces/trace-hittest-gate.json` | gate probe; its favourite-button rows prove nothing (wrong element), superseded by the post-change file | pre-change |
| `traces/trace-reduced-motion.json` | reduced-motion path, **before** the damping fix | pre-change |
| `traces/trace-timings*.json` | crossfade / bottom bar / card-text fade | pre-change |
| `traces/perf-morph-*-summary.json` | extracted frame-interval stats; raw event dumps (31MB + 25MB) discarded | pre-change |
| `traces/post-change-verification.json` | everything re-measured after the change | **post-change** |

`trace-reverse-1.json` contains an apparent "undershoot to t = -0.045". That is an artefact
of the run, not the app: a card behind the detail overlay had been tapped, so the stored
origin was 0.93x too small and the derived `t` is skewed. Re-measured with clean geometry,
there is no undershoot. Kept, labelled, rather than quietly deleted.
