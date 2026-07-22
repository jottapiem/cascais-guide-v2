# UNDERSTANDING.md — Het origineel begrijpen (Fase 1)

> Dit document is mijn samenvatting van het **bestaande** "Cascais Guide V2".
> Doel: de onderliggende *story* en bedoeling vastleggen, zodat de reimagining
> ("zelfde verhaal, andere studio") daarop kan bouwen — zonder code, layout of
> teksten over te nemen. Vanaf een goedgekeurde SPEC.md stoppen we met naar het
> origineel te kijken.

---

## 1. De kern in één zin

Een **privé, mobile-first travel-discovery web-app** waarmee de eigenaar zijn
vrienden & familie de mooiste plekken rond **Cascais** (Portugal) laat ontdekken
— beaches, food, sunset spots, viewpoints, day trips naar Sintra/Lisboa/Belém —
met een **native iOS-gevoel** in de browser, volledig in het **Nederlands**, en
werkend **zonder netwerk**.

## 2. Voor wie

- Vrienden en familie van de eigenaar (een klein, bekend publiek).
- **Niet publiek**: `noindex`, geen login, geen analytics, geen tracking.
- Aanname: bezoekers zijn Nederlandstalig, gebruiken vooral hun telefoon, en
  plannen (of dromen over) een trip naar de regio Cascais.

## 3. De onderliggende "story" / bedoeling

Dit is in de kern een **gecureerde gids van een local/insider**: "dit zijn míjn
favoriete plekken, dit is wanneer je moet gaan, dit is de vibe, en dit zijn de
insider-tips." Het is geen Google Maps en geen TripAdvisor — het is
persoonlijk, smaakvol, klein en betrouwbaar. De emotie die het najaagt is
**verlangen + vertrouwen**: mooie beelden die je zin geven om te gaan, plus net
genoeg praktische info om het ook echt te doen.

Twee dingen maken het onderscheidend t.o.v. een gewone lijst:
1. **Beeld eerst, tekst tweede** — het voelt als bladeren door Instagram/Airbnb,
   niet als een naslagwerk lezen.
2. **Insider-curatie** — beperkt aantal plekken (~25), elk met een "vibe-zin",
   beste tijd, drukte-inschatting en concrete tips.

## 4. Kernfeatures (wat de app *doet*)

De app bestaat feitelijk uit **twee helften** die aan elkaar geplakt zijn:

### Helft A — Discovery (het hart, trouw aan de story)
- **Home / discover-feed**: horizontale rails ("Populair", "Trending", "Hidden
  gems", "Sunset") in Airbnb-stijl, plus categorie-bubbles bovenaan.
- **Explore-grid**: Instagram-achtige vierkante tiles per categorie.
- **Detail-view**: per plek een hero-foto + sheet met vibe, tips, drukte, beste
  tijd, tags, kaartlink, gallery.
- **Signature-animatie**: een **shared-element "morph"** van kaart → detail
  (de foto groeit vloeiend uit naar de hero). Hier is buitensporig veel
  engineering in gestopt (custom FLIP + spring, pagina's aan notities).
- **Map**: Leaflet-kaart met alle plekken, gelaagd per categorie.
- **Categorie-view**, **favorieten**, **zoeken**, **aanbevolen**.

### Helft B — Packing / Bags (een tweede, bijna losstaande app)
- Een verrassend diepe **inpaklijst-module**: bags-first informatie-architectuur,
  smart lists (unpacked, need-to-buy, overweight, assigned-to-me, by-trip…),
  templates/starters, personen-toewijzing, gewicht- en waarde-tracking,
  prioriteiten (must/nice/optional), situaties (strand, uitgaan, hiking…), en
  een auto-classifier die items in categorieën indeelt.
- Dit deel is qua omvang en complexiteit bijna groter dan de discovery-helft
  en voelt als een aparte productlijn die in dezelfde app is gegroeid.

### Overige feature-flows
- **Trips**, **Profile**, en een API-route voor het *importeren* van een
  packing-lijst.

## 5. Belangrijkste user-flows

1. Open app → home-feed → scroll rails → tap kaart → **morph** naar detail →
   lees vibe/tips → tap map-link of favoriet → terug.
2. Explore → kies categorie → grid → detail.
3. Map → tap marker → detail.
4. Packing → kies/maak bag → voeg items toe (handmatig, template of import) →
   vink af per situatie/persoon/gewicht.

## 6. Content- & datamodel (conceptueel, niet letterlijk)

- **~25 plekken**, elk met: naam (PT), korte naam, type (Beach/Food/Viewpoint/
  Event/Chill/Shopping/Activity/Museum), vibe, drukte (1-5), beste tijd
  (Morning/Sunset/Night), mood-tags, tags, één-regel "vibeLine", voor-wie,
  tips[], map-link, cover/gallery/explore-foto's, lat/lng, buurt, en
  social-signalen (saves, rating, addedDaysAgo, trending).
- Plekken staan als **losse JSON-bestanden** in `content/places/` én er is een
  grote **built-in dataset** in code als offline fallback.
- Categorieën, explore en map zijn **afgeleide/gefilterde views** van diezelfde
  dataset (één source of truth).
- Foto's: deels externe URL's (Unsplash e.d.), deels lokale conventie
  (`cover.jpg` / `explore-1.jpg` / `gallery-1.jpg` per plek).
- Packing heeft zijn eigen rijke datamodel (items, bags, people, templates,
  smart views) dat **persist** in localStorage.

## 7. Tech stack van het origineel (ter kennisgeving, niet als voorschrift)

- **Next.js 16** (App Router, webpack i.p.v. Turbopack) + **React 19** +
  **TypeScript strict**.
- **Tailwind CSS v4** + shadcn/ui (base-lyra), **oklch** kleuren, `@theme` in
  `globals.css` (geen tailwind.config).
- **Zustand 5** (één store, persist, `skipHydration` + handmatige rehydrate).
- **Framer Motion 12** + een **custom FLIP-morph-engine** (directe DOM-manipulatie
  via refs, compositor-only transforms, spring-gedreven).
- **Leaflet** + react-leaflet voor de kaart (SSR uit).
- Alles is **client-side**; er is geen echte backend (wel een Prisma/SQLite-
  vermelding en één API-route, maar content werkt volledig offline).

## 8. Design-taal van het origineel

- **iOS 26 / Apple HIG**-esthetiek, "native app in de browser".
- Kleuren: **coastal teal** (#0891b2) + **sunset coral** (#f97316), warme
  neutrale achtergrond, lage chroma voor rust.
- **Glassmorphism** (getinte blur) voor floating bars/buttons.
- **Geen emoji's in de UI** — uitsluitend Lucide-icons.
- **Plus Jakarta Sans** als font.
- **SwiftUI ease-curves** (`cubic-bezier(0.22, 1, 0.36, 1)`), veel aandacht voor
  micro-timing en haptics.
- Mobile-first: één `max-w-md` (448px) kolom, gecentreerd op desktop.
- Portugese plaatsnamen, Nederlandse UI-teksten.

## 9. Mijn observaties (relevant voor de reimagining)

- **Het echte hart is de discovery-story**, uitgevoerd met een obsessie voor één
  animatie. Dat is mooi, maar ook een enorme onderhoudslast en een single point
  of complexity. Een reimagining kan dezelfde "magie" (beeld dat tot leven komt)
  halen met moderne, robuustere technieken (bv. de View Transitions API of
  `layoutId`) i.p.v. een handgebouwde FLIP-engine.
- **De packing-helft is scope-creep.** Hij is knap, maar staat conceptueel ver
  van de "ontdek de mooiste plekken van Cascais"-story. Voor de reimagining is
  dit dé grote vraag: houden we het (afgeslankt tot reis-praktisch), of
  vervangen we het door iets dat dichter bij de story ligt (bv. "bouw je eigen
  dag/route" of een simpele trip-planner)?
- **Offline-first + privé + gratis** zijn harde, bewuste constraints — die
  respecteer ik.
- **Content is de eigenlijke waarde** (de curatie + tips + foto's). Die kunnen we
  conceptueel hergebruiken; de vorm eromheen mag volledig anders.
- De app is **volledig client-side** met bundled data. Dat maakt hosting triviaal
  (statisch) maar betekent dat er nu geen makkelijke manier is om content te
  onderhouden zonder code te editen.

## 10. Wat ik expliciet NIET overneem

Geen code, componentstructuur, bestandsindeling, styling-tokens of teksten uit
het origineel. De reimagining wordt vanaf nul opgebouwd; het origineel dient
alleen als *concept-/doelreferentie* via dit document en de latere SPEC.md.

---

*Volgende stap: Fase 2 — een gerichte batch vragen, gegroepeerd per thema, zodat
we samen de richting van de reimagining kunnen bepalen voordat er een SPEC komt.*
