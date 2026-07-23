# PROGRESS.md — Werklog & handoff

> Lees dit + `SPEC.md` om naadloos verder te kunnen zonder de rest van de chat.
> Werkmap: `reimagined/` · branch: `claude/cascais-guide-reimagine-mzs19a`.

## Status: SPEC goedgekeurd · Fase 0 klaar · Discover + Detail live gebouwd

### Gedaan
- **Fase 1 (Discovery):** origineel bestudeerd → `UNDERSTANDING.md`.
- **Fase 2 (Vragen):** beantwoord. Richting: echte travel-helper, bestemming-adaptief,
  publiek deelbaar, meertalig (NL/EN/PT), light+dark, PWA, gratis, familie-sync.
- **Fase 3 (Spec):** `SPEC.md` — concept "Farol", Editorial/Nautical-design.
  **Goedgekeurd** met één amendement: **Bags blijft hoofdpijler** (best-in-class
  inpak- & baggage-tracker; zie SPEC §3/§4).
- **Fase 0 (Fundament):** Next.js 16 + Tailwind v4 + next-intl + Zod + Framer Motion
  + Phosphor + Geist. Design-system in `globals.css` ("Nautical Editorial": sea-ink
  grond, één beacon-gold accent, Fraunces display, film-grain, double-bezel).
  UI-kit: `Bezel`, `Eyebrow`, `Meter`, `PillButton`, `Reveal`, `AppFrame`,
  `ThemeToggle`. 25 Cascais-plekken geport in `content/cascais.ts` (+ Zod-schema).
  i18n `home`/`place`/`bags` volledig in nl/en/pt.

### Deze sessie (schermen + verificatie)
- **Discover-feed** (`app/[locale]/page.tsx`): typografische hero met chart-strip
  (coördinaten · timezone · aantal plekken), daarna 9 data-gedreven rails
  (signature/goldenHour/shoreline/tables/vistas/quiet/wild/culture/afterdark).
- **PlaceCard** + **Rail**: horizontale snap-rails, editorial 4:5-kaarten met
  kind-chip, beste-licht-label, Fraunces-naam, geclampte tagline. Server-components
  (geen client-JS behalve `Reveal`-stagger).
- **Detail** (`app/[locale]/place/[slug]/page.tsx`): cover in double-Bezel, meta-plaat
  (beste licht + drukte-`Meter`), insidertips (beacon-pin, niet genummerd), galerij,
  chart-plaat + "Route hierheen" (universele Google Maps directions-URL, geen key),
  tags/activities-chips. `generateStaticParams` + `generateMetadata`.
- **Placeholders** die niet 404'en: `plan/` en `bags/` via gedeelde `SoonScreen`
  (eerlijke "in aanbouw", binnen het design-system). `not-found.tsx` (gelokaliseerd).
- **Content-selectors** in `lib/content.ts` (`getPlacesByKinds/ByLight/Quiet/Signature`)
  + `lib/geo.ts` (`formatCoords`, `mapsDirectionsUrl`).
- **Infra:** `middleware.ts` → `proxy.ts` (Next 16-conventie); `turbopack.root` gepind
  (workspace-root-warning weg); `reimagined/.gitignore` toegevoegd (node_modules/.next/
  `._*` waren nog niet genegeerd!). i18n uitgebreid: `notFound`/`soon`/`plan`/`bags.soonNote`.
- **Geverifieerd:** `tsc --noEmit` groen · `next build` groen (87 statische pagina's) ·
  dev-server live getest (redirect `/`→`/nl`, alle locales 200, detail 200, onbekende
  slug 404, placeholders 200) · screenshots hero (licht+donker), feed-rail, detail.

### Bekende schuld / nog te doen
1. **Foto-overhaul (hoogste prio, SPEC §9.3):** covers/galerij zijn remote Unsplash-URL's.
   De feed vuurt ~50 image-requests af → Unsplash rate-limit → intermitterende 504's op
   `/_next/image`. Zelf-hosten (of open-data Wikimedia) lost betrouwbaarheid én de
   rate-limit op.
2. **Shared-element morph (SPEC §6):** kaart→detail-morph is nog NIET bedraad. Bewust:
   dezelfde plek staat in meerdere rails → statische `view-transition-name` moet uniek
   zijn, dus duplicaten breken de View Transitions API. Aanpak volgende pass: naam op
   klik-moment toewijzen (dedupe), Next 16 view-transition-mechaniek live testen.
   `globals.css` heeft de `::view-transition-group`-regels al staan (nu no-op).
3. **Bags-pijler écht bouwen:** grote interactieve module (Zustand-store, tassen-CRUD,
   gewicht-`Meter` vs limiet, inpakmodus, later baggage-journey/QR/return-check). Verdient
   een eigen gefocuste build; i18n-woordenschat staat al klaar in `messages/*.json`.
4. **Plan-pijler bouwen:** dag-routes uit bewaarde plekken, weer-aware.
5. **`nearby`-rail:** vereist geolocatie (i18n staat klaar) — later.
6. **tags/activities zijn NL-only** (plain `string[]` in schema, niet `Localized`) → tonen
   Nederlands op EN/PT. Content-model-keuze voor later.
7. **Bewaren/delen (Together, Fase 3):** nog geen state/persistence; backend-keuze
   (Supabase vs Firebase) nog open.

### Belangrijke afspraken/constraints
- Origineel NOOIT wijzigen; alles in `reimagined/`. (Playwright-artefacten die per
  ongeluk in de repo-root belanden altijd opruimen.)
- Geen betaalde API's / geen creditcard. Privé-by-default (noindex globaal in layout).
- Geen emoji in UI — uitsluitend Phosphor-icons. Content zonder code-edits onderhoudbaar.
- Design-taal komt uit `globals.css`; niet opnieuw uitvinden, wel trouw uitbreiden.
