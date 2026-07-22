# PROGRESS.md — Werklog & handoff

> Lees dit + `SPEC.md` om naadloos verder te kunnen zonder de rest van de chat.
> Werkmap: `reimagined/` · branch: `claude/cascais-guide-reimagine-mzs19a`.

## Status: wacht op SPEC-goedkeuring (nog geen implementatiecode)

### Gedaan
- **Fase 1 (Discovery):** origineel bestudeerd → `UNDERSTANDING.md`. Kernpunt: het
  origineel is een privé, NL, mobile-first insider-gids voor Cascais, met een
  discovery-hart + een uit-de-hand-gelopen packing-module.
- **Fase 2 (Vragen):** beantwoord door eigenaar. Kernrichting:
  - Echt bruikbare travel-helper (geen showcase), radicale herinterpretatie toegestaan.
  - **Bestemming-adaptief** ("past zich aan de plek aan") + **publieke, deelbare** versie.
  - **Meertalig** (NL/EN/PT), **light + dark**, **PWA/installeerbaar**, **gratis**.
  - **Familie-sync** (trips syncen, plekken delen) gewenst.
  - **Carte blanche** op tech & design; unieke, herkenbare stijl (niet kopiëren).
  - ~25 Cascais-plekken conceptueel hergebruiken mag; externe foto's nu behouden
    (foto-overhaul = expliciete volgende stap).
- **Fase 3 (Spec):** `SPEC.md` geschreven — concept "Farol", Editorial-Atlas-design,
  Next.js + Tailwind v4 + Radix + View Transitions + TanStack Query + Zustand +
  next-intl + Zod + Serwist, open-data-adapters, gefaseerd plan (Fase 0–4),
  backend uitgesteld tot Fase 3.

### Open beslissingen (wachten op eigenaar)
- Goedkeuring van de 6 akkoord-punten in `SPEC.md` §10 (concept, packing→planner,
  design-richting/naam, tech, backend-uitstel, hosting).
- Later (Fase 3): Supabase vs Firebase voor sync.

### Volgende stap zodra goedgekeurd
- **Fase 0 — Fundament:** scaffold Next.js in `reimagined/`, design-system +
  theming (light/dark), i18n (NL/EN/PT), content-schema + Zod, ~25 Cascais-plekken
  porten, basis-navigatie/layout, PWA-shell. Geen backend.

### Belangrijke afspraken/constraints
- Origineel NOOIT wijzigen; alles in `reimagined/`.
- Geen betaalde API's / geen creditcard. Privé-by-default (noindex op privé-delen).
- Geen emoji in UI. Content zonder code-edits onderhoudbaar.
