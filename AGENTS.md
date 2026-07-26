# Cascais Guide V2 — Agent Context

> Dit bestand beschrijft de repo **zoals die is**, niet zoals die bedoeld was.
> Waar werkelijkheid en bedoeling uit elkaar lopen staat dat expliciet onder
> "Bekende afwijkingen". Vertrouw geen padverwijzing in dit bestand die daar
> als openstaand gemarkeerd staat — controleer eerst of het pad bestaat.

## Wat is dit project?
Een privé travel discovery web app voor vrienden en familie, gefocust op Cascais
(Portugal) en omgeving: Guincho, Sintra, Lisboa, Belém en day trips. Mobile-first,
volledig in het Nederlands, ontworpen als een native iOS-app gevoel in de browser.

## Regels die altijd gelden
- GEEN betaalde APIs of APIs die een creditcard vereisen
- GEEN public indexing (noindex in alle meta tags)
- Open-Meteo is toegestaan voor weer (geen API key nodig)
- Alle content werkt zonder netwerk (built-in data als fallback)
- De app is privé — niet voor openbaar gebruik

## Tech Stack
- Framework: Next.js 16.2.9 (App Router, geen Turbopack)
- Language: TypeScript 5 (strict mode, geen `any`)
- Styling: Tailwind CSS v4 + shadcn/ui
- State: Zustand 5 (persisted, `skipHydration: true`)
- Animatie: Framer Motion 12 + een eigen FLIP-morph engine
- Maps: Leaflet + react-leaflet (SSR uitgeschakeld voor MapCanvas)
- Tests: Vitest
- Package manager: npm

## Folder structuur — feitelijk
```
src/
  app/            # App Router pages + API routes (api/packing/import)
  components/
    app/          # Feature components (AppShell, HomeView, ExploreView, …)
    ui/           # shadcn/ui primitives
    magicui/      # losse effect-componenten
  lib/            # types, data, utilities, morph-config
  store/          # app-store.ts — één Zustand store
content/
  places/         # 25 × .json — AANWEZIG MAAR NIET AANGESLOTEN, zie afwijkingen
docs/             # transition-notes.md — logboek van de morph-rebuild
public/           # alleen Next.js svg's
.ai/              # coding-standards, product, tech-stack, ui-rules
```

Bestaat **niet** (ondanks eerdere documentatie): `src/hooks/`, `scripts/`,
`content/photos/`, `public/photos/`.

## Bekende afwijkingen — actief werk, niet stilzwijgend "oplossen"
1. **De data-laag is hardcoded.** Alle plekken staan in `src/lib/places-data.ts`
   (761 regels). De 25 JSON-bestanden in `content/places/` worden door niets
   geïmporteerd. Eigenaar: agent `content-layer`.
2. **Foto's komen van het netwerk.** `src/lib/images-v2.ts` bouwt Unsplash-URLs.
   Dat botst met de harde regel "alle content werkt zonder netwerk". Er zijn geen
   lokale foto's. Eigenaar: agent `content-layer`.
3. **De morph is nooit visueel geverifieerd.** `docs/transition-notes.md` somt
   precies op welke constanten getunede plaatshouders zijn. Eigenaar: agent
   `morph-verify`. Verander die waarden niet zonder ze te hebben gezien.

## Design system
- iOS 26 / Apple HIG stijl
- Kleuren: coastal teal (#0891b2) + sunset coral (#f97316)
- Glassmorphism: 85% tint, 28px blur, 200% saturate
- Geen emoji's — uitsluitend Lucide React icons
- Dark mode via CSS variabelen
- SwiftUI ease curves: cubic-bezier(0.22, 1, 0.36, 1)
- Mobile-first, max 2 klikken tot informatie

## Shared-element morph — ENKELE SOURCE OF TRUTH
Alle geometrie, radii en timing van de kaart→detail transitie staan in
`src/lib/morph-config.ts`. Niets daarvan hoort ergens anders hardcoded te staan.

De radius is **proportioneel**, niet één vast getal: `MORPH_RADIUS_RATIO = 0.1094`
schaalt mee met de breedte van elk oppervlak. Daaruit volgt `MORPH_RADIUS_PX = 20`
(kaart, 180px breed) en `MORPH_RADIUS_HERO_PX = 49` (hero, 448px breed).

Consumenten:
1. **MorphCard** (`MorphCard.tsx`) — kaart-image wrapper, legt de tap-origin vast
2. **TransitionLayer** (`TransitionLayer.tsx`) — de spring-engine + morphende clone
3. **DetailView** (`DetailView.tsx`) — hero frame + sheet in ruststand
4. **AppShell** (`AppShell.tsx`) — levert `baseViewRef` voor de background-recede

## Beeld-contract — BEVROREN
`src/components/app/PlaceImage.tsx` is een ruwe `<img>` met `forwardRef`, bewust
géén `next/image`. De morph-engine kloont dat element byte-voor-byte en meet zijn
`getBoundingClientRect()`. Wie de src-herkomst verandert mag het elementtype, de
ref-doorgifte en de `absolute inset-0 object-cover` styling niet aanraken.

## Verificatie
```
npm run typecheck         # tsc --noEmit
npm test                  # vitest
npm run lint              # eslint src
npm run verify            # alle drie, lint als laatste
npm run e2e               # playwright, echte browser (WebKit, iPhone-viewport)
npm run dev               # dev server
```

`npm run verify` faalt op dit moment met exitcode 1, en dat hoort zo: er staan twee
eslint-errors open in `BagsView.tsx`. Lint draait daarom als laatste, zodat typecheck
en tests altijd hun uitslag geven. De poort gaat op groen zodra `agents/bags-features`
landt.

`npm run e2e` is de merge-gate: hij loopt de kritieke route (home → kaart → morph →
detail → terug) in een echte browser, controleert dat élke foto daadwerkelijk laadt, en
dwingt `noindex` af. Draai hem na élke merge, niet alleen aan het eind — hij bestaat om
breuk te vangen die precies op de grens tussen twee agent-domeinen ontstaat.

Statisch schoon is geen bewijs dat iets wérkt. Zie `.ai/coding-standards.md` en de
verificatie-eis in de CLAUDE.md van je eigen worktree.

### Valkuilen die je gaat tegenkomen
- **Één dev-server per directory.** Next 16 weigert een tweede dev-server voor dezelfde
  map, ongeacht de poort. Worktrees zijn aparte mappen, dus die kunnen wel naast elkaar.
- **`.next` raakt corrupt bij hard afbreken.** Symptoom: `Failed to open database /
  Loading persistence directory failed`. Oplossing: `rm -rf .next`.
- **AppleDouble-bestanden.** Deze repo staat op een non-HFS volume: elke schrijfactie
  maakt een binaire `._naam`-tweeling. eslint, tsconfig, vitest en playwright negeren
  die inmiddels alle vier expliciet. Loopt een nieuwe tool erop stuk, dat is de oorzaak.

## Werkwijze
Dit project wordt gebouwd door meerdere Claude Code agents die elk in een eigen
git worktree en een eigen chat werken. Ze kunnen niet met elkaar praten — de mens
is het enige kanaal, en `ORCHESTRATION_LOG.md` in de repo-root is het gedeelde
geheugen. Werk je in een worktree, lees dan eerst je eigen `SPEC.md` en
`CLAUDE.md`.

## Antwoord altijd in het Nederlands tenzij het om code gaat.
