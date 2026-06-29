# Cascais Guide V2 — Agent Context

## Wat is dit project?
Een privé travel discovery web app voor vrienden en familie, gefocust op Cascais (Portugal) en omgeving: Guincho, Sintra, Lisboa, Belém en day trips. Mobile-first, volledig in het Nederlands, ontworpen als een native iOS-app gevoel in de browser.

## Regels die altijd gelden
- GEEN betaalde APIs of APIs die een creditcard vereisen
- GEEN public indexing (noindex in alle meta tags)
- Open-Meteo is toegestaan voor weer (geen API key nodig)
- Alle content werkt zonder netwerk (built-in data als fallback)
- De app is privé — niet voor openbaar gebruik

## Tech Stack
- Framework: Next.js 16 (App Router, geen Turbopack)
- Language: TypeScript (strict mode, geen `any`)
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand
- Maps: Leaflet + react-leaflet (SSR uitgeschakeld voor MapCanvas)
- Package manager: npm

## Folder structuur
src/
  app/           # Next.js App Router pages + API routes
  components/
    app/         # Feature components (HomeView, ExploreView etc.)
    ui/          # shadcn/ui components
  hooks/         # use- prefix
  lib/           # types, data loading, utilities
  store/         # Zustand stores
content/
  places/        # één .json per plek
  photos/        # één photo-metadata .json per plek
public/
  photos/        # <place-id>/cover.jpg, explore-1.jpg, gallery-1.jpg etc.
scripts/         # validate-places, validate-photos, photos:check
.ai/             # context voor Claude (architect) en agent (engineer)

## Design system
- iOS 26 / Apple HIG stijl
- Kleuren: coastal teal (#0891b2) + sunset coral (#f97316)
- Glassmorphism: 85% tint, 28px blur, 200% saturate
- Geen emoji's — uitsluitend Lucide React icons
- Dark mode via CSS variabelen
- SwiftUI ease curves: cubic-bezier(0.22, 1, 0.36, 1)
- Mobile-first, max 2 klikken tot informatie

## Foto conventie
public/photos/<place-id>/cover.jpg       # hoofdfoto, detail hero
public/photos/<place-id>/explore-1.jpg   # social media stijl, explore grid
public/photos/<place-id>/gallery-1.jpg   # extra gallerij foto's
Metadata in content/photos/<place-id>.json

## Wie beheert wat
- Claude (architect): geeft instructies, reviewt code, beslist architectuur
- Gemini CLI (engineer): voert instructies uit, schrijft en wijzigt bestanden
- Mens (uitvoerder): voert commando's uit, plakt resultaten terug naar Claude

## Antwoord altijd in het Nederlands tenzij het om code gaat.
