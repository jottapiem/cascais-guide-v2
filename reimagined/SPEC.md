# SPEC.md — De reimagining (Fase 3, wacht op akkoord)

> **Status:** concept ter goedkeuring. Zodra jij dit goedkeurt (of aanpast) is
> dit de permanente source of truth. Vanaf dan bouwen we alleen op basis van
> `SPEC.md` + `PROGRESS.md` + de nieuwe codebase — niet meer op het origineel.
>
> **Werkmap:** `reimagined/` binnen deze repo, branch
> `claude/cascais-guide-reimagine-mzs19a`. Het origineel blijft onaangeroerd.

---

## 1. De pitch — "zelfde verhaal, andere studio"

Het origineel was **de insider-gids van één persoon voor Cascais**: mooie beelden
die verlangen opwekken + insider-tips die vertrouwen geven.

De reimagining houdt die **ziel** — een vriend die je de mooiste plekken laat
zien — maar laat hem **uitgroeien tot een levende reis-companion**:

1. **Hij past zich aan waar je bent of heen gaat.** Cascais is het handgemaakte
   vlaggenschip; elke andere bestemming wordt automatisch samengesteld uit open
   data. Zo blijft de curatie-kwaliteit thuis, maar werkt de app overal.
2. **Hij helpt je écht op reis** — niet alleen dromen, maar plannen en inpakken.
3. **Je beleeft hem samen** — verbind je familie/reisgezelschap, deel plekken en
   synchroniseer trips.

Kortom: van *"de mooiste plekken van Cascais"* naar
***"jouw gids, waar je ook heen gaat — samen"*.**

### Werknaam & merk (voorstel, makkelijk te wijzigen)

**Farol** — Portugees voor *vuurtoren*. Een baken dat reizigers de weg wijst;
geworteld aan de Portugese kust waar dit begon, maar schaalbaar als metafoor naar
overal ("jouw licht op reis"). Geeft een natuurlijk logo-motief (een lichtbundel)
en klinkt niet als een bestaande app. → Zie §5 voor de design-taal die hierbij
hoort. *Niet definitief — als je een andere naam wilt, verander ik dit overal.*

---

## 2. Doelstellingen & niet-doelen

**Doelen**
- Echt bruikbaar (geen showcase-only). Snel, mooi, betrouwbaar, offline-vriendelijk.
- Gratis te bouwen én te draaien (geen betaalde plannen / geen creditcard).
- Voelt als een **native app** (installeerbaar, offline, vloeiend), **simpel te
  delen** (een linkje toont een mooie preview).
- Meertalig (NL / EN / PT), light + dark.
- Een **eigen, herkenbare visuele signatuur** — niet de zoveelste iOS-glass-kloon.

**Niet-doelen (bewust)**
- Geen sprawlende logistiek-suite (de oude Bags-module keert niet terug; zie §4).
- Geen wereldwijde POI-database bouwen; we leunen op open data + gerichte curatie.
- Geen betaalde kaarten/places/AI-API's.

---

## 3. Product-pijlers & features

Legenda: **[K]** behouden uit origineel · **[W]** gewijzigd · **[N]** nieuw

### Pijler 1 — Discover (het hart)
- **[K]** Foto-eerst ontdekken van gecureerde plekken (rails + grid + kaart).
- **[K]** Per plek: vibe-zin, beste tijd, drukte, insider-tips, tags, map-link, gallery.
- **[K]** Signature "foto groeit uit naar detail"-transitie — **[W]** herbouwd op de
  **native View Transitions API** (i.p.v. de handgebouwde FLIP-engine), met een
  Framer-Motion-fallback. Zelfde magie, fractie van de complexiteit.
- **[N]** **Locatie-bewust openen:** "wat is er in de buurt?" of "ik ga naar X" —
  de hele feed past zich aan de bestemming aan.
- **[N]** **Weer-bewuste suggesties** via Open-Meteo (gratis): "zonsondergang
  vanavond 20:41, helder — dit zijn de 3 beste spots."

### Pijler 2 — Plan & Adapt
- **[W]** In plaats van de Bags/Packing-app: een **lichte Trip-planner** —
  sleep opgeslagen plekken in een dag, krijg een logische volgorde/route, deel hem.
- **[W]** **Slimme inpak-helper**, gegenereerd uit *bestemming + datums + weer +
  gekozen activiteiten*. Behoudt het écht nuttige van de oude module, zonder de
  bloat (geen gewicht/verzekering/personen-logistiek).
- **[N]** **Bestemming-adaptieve gidsen:** voor niet-vlaggenschip-bestemmingen
  bouwt de app automatisch een gids uit open data (zie §6). Duidelijk gelabeld als
  auto-content; de eigenaar kan een bestemming later "adopteren" en handmatig
  aankleden.
- **[N]** **Deelbare publieke plek-/bestemmingspagina's** met mooie OG-preview
  (link delen ⇒ ziet er uit als een app-kaartje). Verzoent "publieke versie" +
  "een plek kunnen delen".

### Pijler 3 — Together (Fase 3, zie §7)
- **[N]** Verbind je **familie/reisgezelschap**: gedeelde trips, gedeelde
  opgeslagen plekken, zie wie wat toevoegde. Near-realtime sync via een **gratis**
  backend.

### Cross-cutting
- **[N]** **Meertalig** (NL/EN/PT), auto-detectie + handmatige switch.
- **[N]** **PWA:** installeerbaar op homescreen, offline curated content.
- **[K]** Both light & dark, privé-by-default, geen emoji in UI, geen betaalde API's.

---

## 4. De Bags/Packing-beslissing (expliciet)

De oude module was knap maar was een **tweede, losstaande app** die de balans
verstoorde. Ik **schrap de logistiek-suite** (gewicht, waarde, verzekering,
personen-toewijzing, smart-view-matrix) en **behoud alleen de reis-praktische
kern** — "wat moet ik meenemen?" — heruitgevonden als een **contextuele
inpak-helper** die volgt uit je trip (bestemming, weer, activiteiten). Dit dient
"echt gebruik" zonder de app opnieuw uit balans te trekken. *Als jij vindt dat de
diepe packing-features onmisbaar zijn, is dit hét moment om dat te zeggen.*

---

## 5. Design-taal — "Editorial Atlas" (voorstel)

Bewust géén glassmorphism-iOS-look en géén Airbnb-kloon. De signatuur:
**een modern reis-tijdschrift gekruist met een navigatiekaart.**

- **Typografie leidt.** Expressieve display-letter (bv. **Fraunces**, variabel,
  gratis) voor grote plaatsnamen/koppen; een heldere UI-grotesk (bv. **Inter** of
  **Geist**, gratis) voor de rest. Grote, strakke, karaktervolle titels.
- **Palet "Inkt, Zon & Zee" (ownable, niet teal/coral):**
  - Light ("Paper"): warm bone-wit, bijna-zwarte inkt, subtiele warme grain.
  - Dark ("Nautical night"): diep inkt-marine (geen puur zwart), zacht off-white.
  - **Eén signatuur-accent: "beacon" amber/goud** (de vuurtoren-lichtbundel) —
    goud-op-inkt is warm, premium en direct herkenbaar, en breekt bewust met het
    teal/coral van het origineel.
- **Motief:** subtiele **hoogtelijnen / route-strokes** als terugkerende grafische
  taal (dividers, lege staten, laadstaten, de kaart). Een klein **baken-merk**
  als logo/favicon.
- **Fotografie:** full-bleed, cinematisch, met editorial bijschriften en een
  consistente lichte warmte/duotone-behandeling, zodat foto's uit gemengde
  bronnen tóch als één magazine voelen.
- **Layout:** app-achtig op mobiel (installeerbaar), maar op groter scherm een
  echte **magazine-layout** met editorial asymmetrie en royale marges — niet enkel
  de 448px-telefoonkolom.
- **Motion:** platform-native, fysiek, spaarzaam. Eén signatuur: de plaatsnaam die
  "op zijn plek settelt" tijdens de detail-transitie. Geen obsessieve one-off engine.
- **Icons:** dun, precies, chart-achtig (Lucide of vergelijkbaar). Geen emoji.

*Dit is een uitgesproken keuze, geen menu. Vind je 'm niks, dan draai ik aan de
knoppen (letter, accentkleur, motief) — maar ik raad aan één sterke richting te
kiezen i.p.v. te middelen.*

---

## 6. Architectuur & tech-stack

Je gaf carte blanche; dit is mijn onderbouwde keuze. **Alles hieronder is gratis
en zonder creditcard**, tenzij expliciet anders vermeld.

### Framework & taal
- **Next.js (App Router) + React + TypeScript (strict).** Behouden omdat het de
  juiste tool is: SSR/ISR geeft ons **snelle, deelbare publieke pagina's met
  OG-previews** en eersteklas PWA-ondersteuning. (Origineel gebruikte dit ook —
  dit is convergentie, geen kopie; alle code wordt vers geschreven.)

### Styling & componenten
- **Tailwind CSS v4** + een dunne eigen design-system-laag (tokens voor het
  Editorial-Atlas-palet/typografie).
- **Radix UI primitives** (gratis, headless, toegankelijk) i.p.v. een kant-en-klare
  kit — zo krijgen we volledige controle over de unieke look (bewust géén shadcn,
  om niet dezelfde stijl te erven).

### Animatie
- **Native View Transitions API** voor de hero/shared-element-transities
  (progressive enhancement) + **Framer Motion** voor micro-interacties en als
  fallback. Dit **vervangt de handgebouwde FLIP-engine** volledig.

### State & data-fetching
- **Zustand** voor lokale UI-state (minimaal, bewezen).
- **TanStack Query** voor async/opendata-fetching + caching.
- **Zod** voor schema-validatie van content (vervangt ad-hoc validate-scripts).

### Content
- **Gecureerde content** (vlaggenschip-bestemmingen zoals Cascais): getypeerde,
  Zod-gevalideerde bestanden in de repo (MDX/JSON). Schema zo dat content
  **zonder app-code te editen** onderhouden kan worden (jouw wens #16).
- **Open-data-adapters** voor bestemming-adaptieve gidsen — allemaal gratis,
  geen key, geen creditcard (wél attributie/rate-limit-plichten, zie §9):
  - **Wikivoyage API** — reisgids-tekst per bestemming.
  - **OpenStreetMap Overpass API** — POI's (stranden, cafés, viewpoints…).
  - **Nominatim** — geocoding ("ik ga naar X" → coördinaten).
  - **Wikimedia Commons** — vrij te gebruiken foto's (fase foto-overhaul).
  - **Open-Meteo** — weer & zonsondergang (was al toegestaan in het origineel).
- **i18n:** **next-intl** (gratis) voor NL/EN/PT.

### PWA
- **Serwist** (de onderhouden opvolger van next-pwa, gratis) voor service worker,
  offline-caching van curated content, en installeerbaarheid + manifest.

### Delen / previews
- **@vercel/og (Satori)** — gratis, genereert mooie OG-afbeeldingen voor gedeelde
  plek-/bestemmingslinks.

### Backend & sync — **uitgesteld tot Fase 3 (bewust)**
Fases 0–2 hebben **geen backend nodig**: alles draait lokaal (Zustand +
localStorage) en delen kan via publieke SSR-pagina's / URL-encoded state. Pas de
**Together**-pijler vereist echte sync. Dat houdt de eerste ~80% van de app 100%
gratis, statisch en zonder afhankelijkheden. Bij Fase 3 kiezen we (dan pas):
- **Aanbevolen: Supabase** — Postgres + auth + realtime + row-level-security,
  gratis, geen creditcard, open source en porteerbaar. *Kanttekening:* free-tier
  projecten **pauzeren na 7 dagen inactiviteit** (voor een zelden-gebruikte
  familie-app een reële ergernis; op te lossen met een kleine keep-alive-ping).
- **Alternatief: Firebase Firestore (Spark)** — gratis, geen creditcard,
  **pauzeert niet**, offline-first, realtime. *Kanttekening:* vendor lock-in bij
  Google, minder porteerbaar.
- Ik neig naar **Supabase** (portabiliteit + schone security), maar als
  "werkt-altijd-meteen na een week stilte" zwaarder weegt, wint **Firebase**.
  → Beslissen we bij Fase 3; nu alleen: akkoord om het uit te stellen?

### Hosting
- **Aanbevolen: Vercel (Hobby, gratis)** — beste Next.js-DX, ISR/OG out-of-the-box,
  perfect voor privégebruik. *Kanttekening:* Hobby-tier is alleen voor
  **niet-commercieel** gebruik — dat is dit, dus prima.
- **Alternatief: Cloudflare Pages (gratis)** — genereus, globaal snel; iets meer
  config voor Next SSR (`@cloudflare/next-on-pages`). Sterk als we grotendeels
  statisch/edge blijven.
- *(Ter info: deze omgeving heeft ook een "Manufact" deploy-integratie beschikbaar;
  niet nodig, maar een mogelijke extra route.)*
- **Aanbeveling:** start op Vercel; het is de kortste weg naar "voelt als een app +
  makkelijk te delen". Is er iets beters? Voor deze stack niet, gratis en gemak
  meegewogen.

---

## 7. Fasering (de-risking van de scope)

- **Fase 0 — Fundament.** Scaffold in `reimagined/`, design-system (Editorial
  Atlas), theming light/dark, i18n (NL/EN/PT), content-schema + Zod, de ~25
  Cascais-plekken naar het nieuwe schema porten, basis-navigatie/layout, PWA-shell.
  *100% gratis, geen backend.*
- **Fase 1 — Discover (vlaggenschip).** Home-discovery, plek-detail met de
  signature View-Transitions-transitie, kaart, zoeken, favorieten (lokaal),
  weer-bewuste accenten. **Dit is het kloppend hart — hier gaat de meeste zorg heen.**
- **Fase 2 — Plan & Adapt.** Trip-/dagplanner, slimme inpak-helper,
  bestemming-adaptieve open-data-gidsen, deelbare publieke pagina's + OG.
  *Nog steeds geen verplichte backend (lokaal + deel-links).*
- **Fase 3 — Together (vereist akkoord + gratis backend).** Auth + familie-groepen
  + sync + gedeelde trips/plekken. Hier kiezen we Supabase vs Firebase.
- **Fase 4 — Polish.** **Foto-overhaul** (jouw genoemde volgende stap), performance,
  toegankelijkheid, diepere i18n-content.

---

## 8. Projectstructuur (globaal)

```
reimagined/
  app/                      # Next.js App Router (routes, layouts, API routes)
    [locale]/               # i18n-gesegmenteerde routes (NL/EN/PT)
      (discover)/           # home, categorie, detail
      plan/                 # trip-planner, inpak-helper
      d/[destination]/      # publieke, deelbare bestemmingspagina's
    api/                    # og-image, opendata-proxy (caching/attributie)
  components/
    ui/                     # eigen design-system-primitives (op Radix)
    discover/ plan/ map/    # feature-componenten
  content/
    destinations/           # gecureerde vlaggenschepen (Cascais) — Zod-gevalideerd
      cascais/
        places/*.mdx|json
  lib/
    schema/                 # Zod-schema's + types
    opendata/               # adapters: wikivoyage, overpass, nominatim, open-meteo
    i18n/                   # next-intl config + messages
    store/                  # Zustand
  messages/                 # nl.json / en.json / pt.json (UI-strings)
  public/                   # manifest, icons, (later) lokale foto's
  UNDERSTANDING.md  SPEC.md  PROGRESS.md
```

*Vers ontworpen; neemt geen bestandsindeling of code uit het origineel over.*

---

## 9. Risico's & trade-offs (eerlijk)

1. **Kwaliteitsverschil curatie vs. open data.** Auto-gidsen voor willekeurige
   bestemmingen halen nooit het niveau van het handgemaakte Cascais. *Mitigatie:*
   "vlaggenschip + nette fallback", auto-content duidelijk labelen, bestemmingen
   later kunnen "adopteren" en handmatig aankleden.
2. **Rate-limits & attributie** op gratis API's (Nominatim, Overpass, Wikimedia).
   Privé-familiegebruik valt ruim binnen de policies, maar we **moeten** agressief
   cachen, een correcte User-Agent sturen en bronnen attribueren. Ingebouwd vanaf
   Fase 2.
3. **Foto's = bekende schuld.** Externe Unsplash-URL's breken offline en hebben
   hotlink/licentie-haken. Jij koos: nu behouden, **foto-overhaul als volgende
   stap** (Fase 4 / apart traject).
4. **Backend-keuze** (idle-pauze bij Supabase vs. lock-in bij Firebase). Bewust
   uitgesteld tot Fase 3 zodat Fases 0–2 volledig gratis en dependency-vrij zijn.
5. **Vercel Hobby = niet-commercieel.** Prima voor dit privé-project; benoemd voor
   de volledigheid.
6. **Scope blijft de grootste vijand.** "Beste app voor alle needs" is oneindig;
   de fasering hierboven is de rem. Ik bouw Fase 0–1 tot ze écht goed zijn vóór ik
   verbreed — precies om de fout van het origineel (packing-creep) niet te herhalen.

---

## 10. Wat ik van jou nodig heb (akkoord-punten)

1. **Concept & het "vlaggenschip + open-data-overal"-model** (§1, §3, §6) — akkoord?
2. **Bags → lichte trip-planner + inpak-helper** (§4) — akkoord, of wil je meer?
3. **Design-richting "Farol / Editorial Atlas / inkt + goud"** (§5) — akkoord, of
   bijsturen (naam, accentkleur, motief)?
4. **Tech-stack** (§6) — carte blanche gegeven; iets waar je toch iets van vindt?
5. **Backend uitstellen tot Fase 3** (Supabase vs. Firebase dan beslissen) — akkoord?
6. **Hosting = Vercel Hobby** als default — akkoord?

Zodra jij ja zegt (of dit aanpast), bevries ik deze SPEC en start ik met **Fase 0**.
