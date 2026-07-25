# Orchestration Log — Cascais Guide V2

Beheerd door de **master agent**. Dit is het enige gedeelde geheugen tussen chats die
elkaar niet kunnen zien. Elke escalatie, elk antwoord en elke merge komt hier te staan.

Sub-agents schrijven hier **niet** in — die houden `PROGRESS.md` in hun eigen worktree bij.

---

## Opzet

| Agent | Branch | Worktree | Poort |
|---|---|---|---|
| `morph-verify` | `agents/morph-verify` | `/Volumes/SSD/cascais-guide-v2.worktrees/agents-morph-verify` | 3001 |
| `content-layer` | `agents/content-layer` | `/Volumes/SSD/cascais-guide-v2.worktrees/agents-content-layer` | 3002 |
| `bags-features` | `agents/bags-features` | `/Volumes/SSD/cascais-guide-v2.worktrees/agents-bags-features` | 3003 |

**Merge-volgorde:** `morph-verify` → `bags-features` → `content-layer`, met een
herverificatie van de morph ná `content-layer` (die raakt het beeldpad).

---

## 2026-07-24 — Fase 1 & 2: analyse en plan

**Vastgesteld:**
- `main` (d1176ce) draagt een afgeronde shared-element morph. Alle getunede constanten
  (`0.55`, `220ms`, `340ms`, `0.93`, scrim 10/24px) zijn per `docs/transition-notes.md`
  nooit visueel geverifieerd.
- `AGENTS.md` beschreef mappen die niet bestaan (`scripts/`, `content/photos/`,
  `public/photos/`, `src/hooks/`) en een `MORPH_RADIUS_PX = 28` die inmiddels een
  berekende `20` is. Zou alle drie de agents tegelijk hebben misleid.
- `content/places/*.json` (25 bestanden) bestaat maar wordt door niets geïmporteerd.
- Foto's komen van `images.unsplash.com` — schendt de harde regel "alle content werkt
  zonder netwerk".
- `node_modules` ontbrak volledig; niets kon bouwen of typechecken.
- Dood hout: branch `morph-engine-rebuild` (0 commits vóór op main), twee worktrees op
  `agents/nextjs-console-error-fix` (idem, vieze working tree), `reimagined/` restanten
  op main, `animation_conflicts.txt` (verwijst naar verwijderde bestanden),
  `tsconfig.tsbuildinfo` (735 KB, tracked ondanks `.gitignore`), `stash@{0}`.

**Beslissingen van de mens:**
1. Doorgaan op `main`. De Farol-herbouw (`claude/cascais-guide-reimagine-mzs19a`,
   12.788 regels in `reimagined/`) wordt geparkeerd, niet verwijderd.
2. Drie agents, gesplitst per domein: morph / content / bags.
3. Elke worktree krijgt een slanke `CLAUDE.md` bovenop de gedeelde root-`AGENTS.md`.
4. Skill-toewijzing = verplichte kern + vrije rest.
5. **Harde verificatie na élke opdracht** — het moet onmogelijk zijn om "klaar" te
   zeggen terwijl de opdracht niet volledig is uitgevoerd. Via MCP-tools, subagent-
   checkers of andere aantoonbare methodes. Statisch schoon telt niet als bewijs.
6. Vitest wordt in de pre-flight opgezet, vóór de worktrees bestaan, zodat alle drie op
   dezelfde config starten.

---

## 2026-07-24 — Fase 3: pre-flight

Alles hieronder is gecommit als `bb6d822` op `main` (lokaal, niet gepusht).

- `npm install` gedraaid — ontbrak volledig, niets kon bouwen of typechecken.
- `AGENTS.md` herschreven naar de feitelijke repo-staat, met een expliciete sectie
  "Bekende afwijkingen" die elke afwijking aan een agent toewijst.
- **Vitest opgezet** (jsdom, testing-library, `@/`-alias) met `tests/harness.test.tsx`
  als smoketest. Reden: een rode `npm test` in een worktree moet "jouw wijziging" betekenen,
  nooit "de opstelling was er nooit". Bewust in de pre-flight en niet door een agent —
  het raakt `package.json` en root-config, per definitie gedeeld terrein.
- npm scripts toegevoegd: `typecheck`, `test`, `test:watch`, `verify`. `lint` draait nu
  op `src` in plaats van op niets.
- **5 `any`-lintfouten in `app-store.ts` opgelost** (`migrate`). Die schonden de eigen
  projectregel én maakten "eslint schoon" als poort onmogelijk. Gedeeld bestand, dus
  pre-flight-werk.
- eslint en tsconfig negeren nu `**/._*`. Deze repo staat op een non-HFS volume; elke
  schrijfactie maakt een binaire AppleDouble-tweeling die eslint met "Invalid character"
  liet falen. Dat had alle drie de agents willekeurig geraakt.
- `.gitignore`: `SPEC.md`, `PROGRESS.md`, `CLAUDE.local.md` en `.claude/` blijven per
  worktree lokaal. Ze verschillen per agent — tracken zou merge-conflicten garanderen.
- Per worktree een eigen `.claude/launch.json` op een eigen poort, zodat drie
  dev-servers tegelijk kunnen draaien.

### Baseline na `bb6d822` — dit is de meetlat voor elke agent

| Poort | Resultaat |
|---|---|
| `npm run typecheck` | schoon |
| `npm test` | 4/4 groen |
| `npm run lint` | **2 errors + 20 warnings** |

De 2 errors staan allebei in `BagsView.tsx` (regel 285 en 326,
`react-hooks/static-components`) en zijn toegewezen aan **bags-features**. Morph-verify en
content-layer mogen ze laten staan; hun regel is "geen nieuwe". Bags-features moet naar 0.

### Vooraf beslecht grensgeschil: `app-store.ts`

Beide zouden dit bestand kunnen willen aanraken. Toewijzing, opgenomen in beide SPEC's:
- **content-layer** mag uitsluitend `version` en `migrate` wijzigen — nodig voor de
  id-migratie van favorieten (zie hieronder).
- **bags-features** blijft van `version` en `migrate` af, en bezit de rest.

Reden: `content/places/*.json` en `places-data.ts` hebben allebei 25 plekken, maar **20
van de 25 ids verschillen** (`boca-do-inferno` vs `bocainferno`, `farol-santa-marta` vs
`santamarta`, …). Favorieten worden op place-id in localStorage bewaard. Overschakelen
zonder migratie wist stilzwijgend de favorieten van elke gebruiker. Twee agents die
tegelijk aan dezelfde migratieketen sleutelen zou dat risico verdubbelen.

### Openstaand bij de mens

**Wie levert de foto's?** De harde regel "alle content werkt zonder netwerk" kan niet
volledig worden waargemaakt: er zijn nul lokale foto's en content-layer kan die niet
verzinnen. Die agent bouwt daarom de volledige pijplijn plus een lokale fallback, zodat
bestanden neerzetten in `public/photos/<id>/` genoeg is. De echte foto's en hun licentie
zijn een menselijke beslissing.

### Worktrees aangemaakt en geverifieerd

Alle drie afgetakt van `main` @ `bb6d822`, `npm install` gedraaid, en de baseline
gecontroleerd — niet aangenomen:

| Worktree | typecheck | lint | test |
|---|---|---|---|
| `agents-morph-verify` | exit 0 | 2 errors, 20 warnings | 4/4 |
| `agents-content-layer` | exit 0 | 2 errors, 20 warnings | 4/4 |
| `agents-bags-features` | exit 0 | 2 errors, 20 warnings | 4/4 |

Identiek aan `main`. Elke agent start dus aantoonbaar op dezelfde ondergrond, en een
afwijking in een worktree is vanaf nu toe te schrijven aan die agent.

Per worktree neergezet (untracked, gitignored, worden nooit gemergd):
`CLAUDE.local.md`, `SPEC.md`, `PROGRESS.md`, `.claude/launch.json`.

**Nog niet opgeruimd — wacht op akkoord van de mens:** branch `morph-engine-rebuild`,
de twee worktrees op `agents/nextjs-console-error-fix`, `stash@{0}`, de map `reimagined/`
op main, en `animation_conflicts.txt`.

_(vervolg wordt hieronder bijgehouden)_

---

## Escalaties

_Nog geen._

---

## Merges

_Nog geen._
