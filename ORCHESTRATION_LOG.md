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

- `AGENTS.md` herschreven naar de feitelijke repo-staat, met een expliciete sectie
  "Bekende afwijkingen" die elke afwijking aan een agent toewijst.
- `.claude/launch.json` toegevoegd (root op poort 3000; elke worktree krijgt een eigen
  poort zodat drie dev-servers tegelijk kunnen draaien).
- Dit logboek aangemaakt.

_(vervolg wordt hieronder bijgehouden)_

---

## Escalaties

_Nog geen._

---

## Merges

_Nog geen._
