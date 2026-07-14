# Product Context — Cascais Guide V2

## Wat is dit?
Een privé travel discovery web app voor vrienden en familie, gefocust op Cascais (Portugal) en omgeving: Guincho, Sintra, Lisboa, Belém en day trips. Mobile-first, volledig in het Nederlands, ontworpen als een native iOS-app gevoel in de browser.

## Doelgroep
- Vrienden en familie van de eigenaar
- Niet publiek — geen indexing, geen login, geen analytics

## Kernfeatures
1. **Discover feed** — Airbnb-style horizontale rails (Populair, Trending, Hidden gems, Sunset spots)
2. **Explore grid** — Instagram-style vierkante tiles per categorie
3. **Detail view** — shared-element morph transitie van kaart → detail (Airbnb/Apple Photos feel)
4. **Map** — Leaflet kaart met alle plekken, gelaagd per categorie
5. **Packing list** — slimme inpaklijst per situatie (strand, uitgaan, dagtrip)
6. **Perfect day** — 7-stop itinerary voor de ideale dag in Cascais

## Content model
- 25 plekken in `content/places/*.json`
- Per plek: naam, type (Beach/Food/Viewpoint/Event/Chill/Shopping/Activity), vibe, drukte, beste tijd, tags, tips, locatie, foto's
- Categorieën: Stranden, Food, Sunset, Chill, Viewpoints, Activities, Cultuur, Trending

## Design principles
- **Discovery-first:** beeld komt eerst, tekst tweede
- **Mobile-first:** max-w-md (448px) container, touch-friendly
- **Native feel:** iOS 26 design language, SwiftUI ease curves, glassmorphism
- **Privé:** noindex, geen externe analytics, werkt offline (built-in data fallback)

## Taal
- Volledig in het Nederlands (behalve code/technical terms)
- Plaatsnamen in het Portugees (Praia do Guincho, niet Guincho Beach)
