import type { Destination } from "@/lib/schema/content";

/**
 * Cascais — the hand-curated flagship destination (SPEC.md §3, §6).
 *
 * Facts (names, coordinates, areas, photo URLs) come from the owner's own
 * earlier guide; every line of prose here is written fresh for Farol.
 *
 * Voice: a friend who actually goes there. Concrete over enthusiastic — the
 * hour a place is worth visiting, where to park, what the wind does after noon.
 * Nothing is sold, nothing is exclaimed.
 *
 * Photos are still remote Unsplash URLs and are known debt: the secondary
 * gallery frames are shared mood shots rather than documentary images of the
 * place, which is why their alt text says so ("Sfeerbeeld"). The photo overhaul
 * is its own track (SPEC.md §9.3).
 */
export const cascais: Destination = {
  slug: "cascais",
  name: "Cascais",
  country: "Portugal",
  countryCode: "PT",
  center: { lat: 38.6979, lng: -9.4215 },
  timezone: "Europe/Lisbon",
  intro: {
    nl:
      "Twintig minuten met de trein vanaf Lissabon houdt de stad op en begint de " +
      "oceaan. Cascais is een vissersdorp dat koninklijk werd en daarna gewoon " +
      "bleef: kasseien en azulejos in het centrum, een kust die naar het westen " +
      "toe steeds wilder wordt, en Sintra vlak achter de heuvel. Dit zijn de " +
      "plekken waar we zelf terugkomen, met het uur waarop ze op hun best zijn.",
    en:
      "Twenty minutes by train from Lisbon the city stops and the ocean starts. " +
      "Cascais is a fishing town that went royal and then stayed ordinary: " +
      "cobbles and tilework in the centre, a coast that turns wilder the further " +
      "west you go, and Sintra just over the hill. These are the places we keep " +
      "coming back to, with the hour they are at their best.",
    pt:
      "A vinte minutos de comboio de Lisboa a cidade acaba e começa o oceano. " +
      "Cascais é uma vila piscatória que se tornou real e continuou simples: " +
      "calçada e azulejo no centro, uma costa que fica mais bravia para " +
      "ocidente e Sintra logo depois do monte. Estes são os sítios a que " +
      "voltamos, com a hora em que estão no seu melhor.",
  },
  curated: true,
  places: [
    // ---------------------------------------------------------------- Guincho
    {
      slug: "praia-do-guincho",
      name: "Praia do Guincho",
      kind: "beach",
      tagline: {
        nl: "Open Atlantische kust waar de wind altijd meedoet en de zon recht in zee zakt.",
        en: "Open Atlantic coast where the wind never sits out and the sun drops straight into the sea.",
        pt: "Costa atlântica aberta, onde o vento nunca falha e o sol cai a direito no mar.",
      },
      notes: [
        {
          nl: "Vanaf een uur of twaalf trekt de noordwestenwind aan en blijft die de hele middag staan. Wil je rustig liggen, kom dan 's ochtends; wil je kitesurfen, juist niet.",
          en: "From around noon the north-westerly picks up and holds all afternoon. Come in the morning to lie still, come later to kitesurf.",
        },
        {
          nl: "De parkeerstroken langs de kustweg zitten in juli en augustus rond elven vol. Parkeer dan bij Cresmina en loop het laatste stuk door de duinen.",
          en: "In July and August the parking strips along the coast road fill up by eleven. Park at Cresmina instead and walk the last stretch through the dunes.",
        },
        {
          nl: "Het water komt recht van de oceaan en blijft ook in augustus rond de zeventien graden. Zwemmen kan prima, lang blijven liggen niet.",
          en: "The water comes straight off the ocean and stays around seventeen degrees even in August. Fine for a swim, not for lingering.",
        },
        {
          nl: "Neem iets met lange mouwen mee: zodra de zon zakt koelt het strand binnen een kwartier af.",
          en: "Bring long sleeves — once the sun drops the beach cools off within fifteen minutes.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 3,
      coords: { lat: 38.7278, lng: -9.4785 },
      area: "Guincho",
      cover: {
        src: "https://images.unsplash.com/photo-1659859910992-9aaa28958eda?w=1600&q=80",
        alt: {
          nl: "Breed zandstrand met aanrollende Atlantische golven en duinen op de achtergrond.",
          en: "A wide sandy beach with Atlantic waves rolling in and dunes behind it.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["oceaan", "wind", "zonsondergang", "duinen"],
      activities: ["zwemmen", "surfen", "kitesurfen", "wandelen", "fotograferen"],
    },

    // ----------------------------------------------------------------- Rainha
    {
      slug: "praia-da-rainha",
      name: "Praia da Rainha",
      kind: "beach",
      tagline: {
        nl: "Klein zandstrand tussen de rotsen, twee minuten van de winkelstraat.",
        en: "A small stretch of sand between rocks, two minutes from the shopping street.",
        pt: "Um areal pequeno entre rochas, a dois minutos da rua comercial.",
      },
      notes: [
        {
          nl: "Bij hoogwater blijft er nauwelijks zand over. Check het getij voordat je met handdoeken en al de trap afloopt.",
          en: "At high tide there is barely any sand left. Check the tide before you carry everything down the steps.",
        },
        {
          nl: "De trap naar beneden is smal en er is geen schaduw. Met kinderwagen of kleine kinderen is Praia da Conceição even verderop een stuk makkelijker.",
          en: "The stairway down is narrow and there is no shade. With a pushchair or small children, Praia da Conceição just along the coast is easier.",
        },
        {
          nl: "Voor elf uur ligt het strand nog half leeg; daarna is elke vierkante meter zand bezet.",
          en: "Before eleven the beach is still half empty; after that every square metre of sand is taken.",
        },
      ],
      bestLight: "midday",
      busyness: 4,
      coords: { lat: 38.6973, lng: -9.4213 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1550508111-0c20041f55bd?w=1600&q=80",
        alt: {
          nl: "Klein baaistrand ingesloten door donkere rotswanden.",
          en: "A small cove beach enclosed by dark rock walls.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["stadsstrand", "rotsen", "kort-bij-het-centrum"],
      activities: ["zwemmen", "zonnebaden"],
    },

    // ---------------------------------------------------------------- Tamariz
    {
      slug: "praia-do-tamariz",
      name: "Praia do Tamariz",
      kind: "beach",
      tagline: {
        nl: "Het stadsstrand van Estoril, met het station en het casino op loopafstand.",
        en: "Estoril's town beach, with the train station and the casino within walking distance.",
        pt: "A praia urbana do Estoril, com a estação e o casino a poucos passos.",
      },
      notes: [
        {
          nl: "De trein Cascais–Lissabon stopt vlak achter het strand. Met de auto ben je hier vooral bezig met parkeren.",
          en: "The Cascais–Lisbon train stops right behind the beach. Come by car and you will mostly be hunting for parking.",
        },
        {
          nl: "Aan de westkant ligt een oud zeewaterbad uit de jaren dertig: rustiger dan het strand zelf en fijn voor kinderen die de branding nog niet aankunnen.",
          en: "At the western end sits a 1930s seawater pool — calmer than the beach itself and good for children not yet up to the surf.",
        },
        {
          nl: "Zomerse weekenden lopen tegen de middag helemaal vol. Doordeweeks voor elven vind je nog zo een plek.",
          en: "Summer weekends are packed by midday. On a weekday before eleven you can still walk straight onto the sand.",
        },
      ],
      bestLight: "midday",
      busyness: 5,
      coords: { lat: 38.7055, lng: -9.394 },
      area: "Estoril",
      cover: {
        src: "https://images.unsplash.com/photo-1528628802467-4f7fd989feb0?w=1600&q=80",
        alt: {
          nl: "Stadsstrand met parasols en gebouwen die pal achter het zand beginnen.",
          en: "A town beach with parasols and buildings starting right behind the sand.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["stadsstrand", "met-de-trein", "druk", "kindvriendelijk"],
      activities: ["zwemmen", "zonnebaden", "uit-eten"],
    },

    // --------------------------------------------------------------- Cresmina
    {
      slug: "praia-da-cresmina",
      name: "Praia da Cresmina",
      kind: "beach",
      tagline: {
        nl: "Het rustige zusje van Guincho, met een houten duinpad erachter.",
        en: "Guincho's quieter sister, with a boardwalk through the dunes behind it.",
        pt: "A irmã sossegada do Guincho, com um passadiço pelas dunas atrás.",
      },
      notes: [
        {
          nl: "Achter het strand loopt een vlonderpad door het duingebied — een rondje van een half uur met borden over hoe het zand hier landinwaarts wandelt.",
          en: "Behind the beach a boardwalk crosses the dune system — a half-hour loop with panels explaining how the sand travels inland.",
        },
        {
          nl: "De parkeerplaats is kleiner dan die van Guincho. Na tienen 's ochtends is het in het seizoen zoeken.",
          en: "The car park is smaller than Guincho's. In season, after ten in the morning it becomes a search.",
        },
        {
          nl: "Buiten de zomer is het strandtentje beperkt open. Neem water mee, en een windjack — hier waait dezelfde wind als naast de deur.",
          en: "Outside summer the beach café keeps short hours. Bring water, and a windbreaker — the wind here is the same as next door.",
        },
      ],
      bestLight: "dawn",
      busyness: 2,
      coords: { lat: 38.7215, lng: -9.468 },
      area: "Guincho",
      cover: {
        src: "https://images.unsplash.com/photo-1746253077566-ea05388c57cd?w=1600&q=80",
        alt: {
          nl: "Duinen met helmgras die aflopen naar een vrijwel leeg strand.",
          en: "Marram-covered dunes sloping down to an almost empty beach.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["duinen", "verborgen", "wandelroute", "oceaan"],
      activities: ["zwemmen", "surfen", "bodyboarden", "wandelen"],
    },

    // --------------------------------------------------------- Boca do Inferno
    {
      slug: "boca-do-inferno",
      name: "Boca do Inferno",
      kind: "vista",
      tagline: {
        nl: "Ingestorte zeegrot waar de oceaan bij ruw weer dwars door de rots slaat.",
        en: "A collapsed sea cave where rough water drives straight through the rock.",
        pt: "Uma gruta desabada onde o mar bravo entra pela rocha adentro.",
      },
      notes: [
        {
          nl: "Bij kalme zee is het vooral een groot gat in de rots. Kom als het waait of net na een storm — dan maakt de naam zichzelf waar.",
          en: "On a calm sea it is mostly a large hole in the rock. Come when it blows, or just after a storm, and the name earns itself.",
        },
        {
          nl: "Vanaf het centrum is het twintig minuten lopen langs de kust, langs de vuurtoren en de baaitjes onderweg. Met de auto sta je in het weekend te wachten op een plek.",
          en: "It is a twenty-minute walk from the centre along the coast, past the lighthouse and the small coves. By car, weekends mean queuing for a space.",
        },
        {
          nl: "De hekken staan er niet voor niets: het gesteente is glad en aan de zeekant houdt niets je tegen.",
          en: "The railings are there for a reason: the rock is slick and on the seaward side nothing stops you.",
        },
        {
          nl: "Naast de parkeerplaats staan kraampjes met kurk en tegelwerk. Voor elf uur is het er nog rustig genoeg om echt te kijken.",
          en: "Beside the car park are stalls selling cork and tilework. Before eleven it is still quiet enough to actually browse.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 3,
      coords: { lat: 38.6924, lng: -9.4358 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1639996161365-ce19fa84115f?w=1600&q=80",
        alt: {
          nl: "Steile rotskust waar water door een opening in de klif naar binnen slaat.",
          en: "A steep rocky coastline where water surges through an opening in the cliff.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: donkere rotskust met schuimend water.",
            en: "Mood shot: dark rocky coastline with foaming water.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: ruig natuurlandschap met stromend water.",
            en: "Mood shot: a rugged natural landscape with running water.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["kliffen", "uitzicht", "zonsondergang", "gratis"],
      activities: ["wandelen", "fotograferen"],
    },

    // ----------------------------------------------------------- Cabo da Roca
    {
      slug: "cabo-da-roca",
      name: "Cabo da Roca",
      kind: "vista",
      tagline: {
        nl: "Het westelijkste punt van het Europese vasteland — verderop is er alleen water.",
        en: "The westernmost point of mainland Europe — past this there is only water.",
        pt: "O ponto mais ocidental da Europa continental — depois daqui é só água.",
      },
      notes: [
        {
          nl: "Bus 403 rijdt vanaf Cascais in ongeveer veertig minuten. De laatste rit terug gaat eerder dan je denkt; check hem voordat je voor de zonsondergang blijft hangen.",
          en: "Bus 403 from Cascais takes about forty minutes. The last one back leaves earlier than you would expect — check it before you stay for sunset.",
        },
        {
          nl: "Het waait hier vrijwel altijd harder dan beneden aan de kust. Een windjack is ook in augustus geen luxe.",
          en: "It almost always blows harder up here than down on the coast. A windbreaker is not overkill, even in August.",
        },
        {
          nl: "In het bezoekerscentrum schrijven ze een certificaat uit met je naam en de datum. Kost een paar euro en is precies zo kitscherig als het klinkt.",
          en: "The visitor centre will write out a certificate with your name and the date. A few euros, and exactly as kitsch as it sounds.",
        },
        {
          nl: "Blijf achter de muurtjes. De kliffen zijn ruim honderd meter hoog en de rand brokkelt af.",
          en: "Stay behind the low walls. The cliffs run well over a hundred metres and the edge crumbles.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 4,
      coords: { lat: 38.7753, lng: -9.5006 },
      area: "Sintra",
      cover: {
        src: "https://images.unsplash.com/photo-1726061425923-6b60b5202940?w=1600&q=80",
        alt: {
          nl: "Hoge klif met een vuurtoren boven de Atlantische Oceaan.",
          en: "A high cliff with a lighthouse above the Atlantic Ocean.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: weids landschap in laag avondlicht.",
            en: "Mood shot: a wide landscape in low evening light.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: ruig natuurlandschap met stromend water.",
            en: "Mood shot: a rugged natural landscape with running water.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["kliffen", "uitzicht", "wind", "iconisch", "zonsondergang"],
      activities: ["wandelen", "fotograferen"],
    },

    // ----------------------------------------------------- Farol de Santa Marta
    {
      slug: "farol-de-santa-marta",
      name: "Farol de Santa Marta",
      kind: "culture",
      tagline: {
        nl: "Blauw-wit gestreepte vuurtoren op de rotspunt, met een klein museum erin.",
        en: "A blue-and-white striped lighthouse on the point, with a small museum inside.",
        pt: "Um farol às riscas azuis e brancas na ponta da rocha, com um pequeno museu lá dentro.",
      },
      notes: [
        {
          nl: "Het museum is klein, maar je mag de toren in. Vanaf het bordes zie je de hele baai tot aan Estoril liggen.",
          en: "The museum is small, but you can go up the tower. From the platform you see the whole bay across to Estoril.",
        },
        {
          nl: "Maandag gesloten, net als de meeste musea in Cascais. Plan je museumdag dus niet op maandag.",
          en: "Closed on Mondays, like most museums in Cascais. Do not plan your museum day for a Monday.",
        },
        {
          nl: "De platte rotsen ervoor zijn de rustigste zitplek van het centrum, en het is er ook zonder ticket goed toeven.",
          en: "The flat rocks in front are the quietest place to sit in the centre, and you need no ticket for them.",
        },
      ],
      bestLight: "midday",
      busyness: 2,
      coords: { lat: 38.6975, lng: -9.4189 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1756119356142-6822a59adacb?w=1600&q=80",
        alt: {
          nl: "Vuurtoren met blauw-witte banden op een rotspunt aan zee.",
          en: "A lighthouse with blue and white bands standing on a rocky point by the sea.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: warme lampen tijdens het blauwe uur.",
            en: "Mood shot: warm lights during the blue hour.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1520637836862-4d197d17c91a?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: avondlicht op een verlicht gebouw.",
            en: "Mood shot: evening light on a lit building.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["historisch", "uitzicht", "museum", "lokaal"],
      activities: ["museumbezoek", "fotograferen", "wandelen"],
    },

    // ------------------------------------------------------------ Casa da Guia
    {
      slug: "casa-da-guia",
      name: "Casa da Guia",
      kind: "vista",
      tagline: {
        nl: "Negentiende-eeuws landhuis op de klif, met terrassen die op de oceaan uitkijken.",
        en: "A nineteenth-century clifftop house with terraces hanging over the ocean.",
        pt: "Uma casa oitocentista na falésia, com esplanadas suspensas sobre o oceano.",
      },
      notes: [
        {
          nl: "De tuin is vrij toegankelijk. Je hoeft niets te bestellen om aan de rand van de klif te gaan zitten.",
          en: "The grounds are free to enter. You do not have to order anything to sit at the edge of the cliff.",
        },
        {
          nl: "Rond zonsondergang zijn de tafels aan de zeekant het eerst bezet. Een half uur eerder komen scheelt een rij.",
          en: "Around sunset the seaward tables go first. Turning up half an hour earlier saves you the queue.",
        },
        {
          nl: "Ligt anderhalve kilometer voorbij Boca do Inferno, dus prima te combineren in één kustwandeling.",
          en: "It sits a kilometre and a half past Boca do Inferno, so the two combine into one coastal walk.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 2,
      coords: { lat: 38.6898, lng: -9.4421 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1605136246893-3cceabd4173d?w=1600&q=80",
        alt: {
          nl: "Terras op een klif met uitzicht over de oceaan in avondlicht.",
          en: "A clifftop terrace looking out over the ocean in evening light.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["uitzicht", "zonsondergang", "romantisch", "eten"],
      activities: ["borrelen", "uit-eten", "wandelen", "fotograferen"],
    },

    // -------------------------------------------------------- Fortaleza Guincho
    {
      slug: "forte-do-guincho",
      name: "Fortaleza do Guincho",
      kind: "table",
      tagline: {
        nl: "Zeventiende-eeuws fort boven de branding, nu een hotel met een sterrenrestaurant.",
        en: "A seventeenth-century fort above the surf, now a hotel with a starred kitchen.",
        pt: "Uma fortaleza seiscentista sobre a rebentação, hoje hotel com cozinha estrelada.",
      },
      notes: [
        {
          nl: "Voor het restaurant is reserveren echt nodig, in het seizoen weken vooruit.",
          en: "For the restaurant you genuinely need to book, in season weeks ahead.",
        },
        {
          nl: "De bar en het terras zijn ook zonder diner toegankelijk. Een glas wijn bij zonsondergang is de goedkoopste manier om hier te zitten.",
          en: "The bar and terrace are open without dinner. A glass of wine at sunset is the cheapest way to sit here.",
        },
        {
          nl: "Nette kleding wordt verwacht in de eetzaal, ook al kom je rechtstreeks van het strand hiernaast.",
          en: "The dining room expects you to be dressed, even if you have walked up from the beach next door.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 1,
      coords: { lat: 38.7278, lng: -9.4736 },
      area: "Guincho",
      cover: {
        src: "https://images.unsplash.com/photo-1496144809960-342ada684885?w=1600&q=80",
        alt: {
          nl: "Historisch fort van steen op de rotskust, met de oceaan erachter.",
          en: "A historic stone fort on the rocky coast with the ocean behind it.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: ruig natuurlandschap met stromend water.",
            en: "Mood shot: a rugged natural landscape with running water.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: weids landschap in laag avondlicht.",
            en: "Mood shot: a wide landscape in low evening light.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["historisch", "reserveren", "romantisch", "zonsondergang"],
      activities: ["uit-eten", "borrelen", "fotograferen"],
    },

    // ------------------------------------------------- Miradouro Santa Catarina
    {
      slug: "miradouro-de-santa-catarina",
      name: "Miradouro de Santa Catarina",
      kind: "vista",
      tagline: {
        nl: "Klein uitkijkpunt boven de haven waar vooral buurtbewoners de zon zien zakken.",
        en: "A small viewpoint above the harbour where mostly locals watch the sun go down.",
        pt: "Um miradouro pequeno acima do porto, onde são sobretudo vizinhos a ver o pôr do sol.",
      },
      notes: [
        {
          nl: "Geen bordjes, geen terras, geen toilet. Neem zelf iets te drinken mee en ruim het weer op.",
          en: "No signs, no café, no toilet. Bring your own drink and take the empties back with you.",
        },
        {
          nl: "De bankjes kijken precies over de vissershaven uit; rond zonsondergang zakt de zon er recht achter in zee.",
          en: "The benches look straight over the fishing harbour, and around sunset the sun drops into the sea right behind it.",
        },
        {
          nl: "Vijf minuten klimmen vanaf de baai over een steile straat — met de auto sta je hier alleen maar in de weg.",
          en: "Five minutes uphill from the bay on a steep street. Driving up only puts you in the way.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 2,
      coords: { lat: 38.6957, lng: -9.4205 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1675706039686-7d7bbea200be?w=1600&q=80",
        alt: {
          nl: "Uitkijkpunt boven een haven met de oceaan in avondlicht.",
          en: "A viewpoint above a harbour with the ocean in evening light.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: weids landschap in laag avondlicht.",
            en: "Mood shot: a wide landscape in low evening light.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: ruig natuurlandschap met stromend water.",
            en: "Mood shot: a rugged natural landscape with running water.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["uitzicht", "verborgen", "lokaal", "gratis", "zonsondergang"],
      activities: ["picknicken", "fotograferen", "wandelen"],
    },

    // -------------------------------------------------------- Mercado da Vila
    {
      slug: "mercado-da-vila",
      name: "Mercado da Vila",
      kind: "market",
      tagline: {
        nl: "Overdekte markt die 's avonds in een rij eetstands verandert.",
        en: "A covered market that turns into a row of food stalls in the evening.",
        pt: "Um mercado coberto que à noite se transforma numa fila de bancas de comida.",
      },
      notes: [
        {
          nl: "Woensdag en zaterdag is het ook echte versmarkt met boeren uit de omgeving. De rest van de week draait het vooral om de eetstands.",
          en: "On Wednesdays and Saturdays it is a proper farmers' market as well. The rest of the week it is mostly about the food stalls.",
        },
        {
          nl: "De vis- en groentekant sluit rond het middaguur, precies wanneer de keukens opengaan. Kom je voor beide, kom dan rond elven.",
          en: "The fish and vegetable side shuts around noon, exactly when the kitchens open. If you want both, come around eleven.",
        },
        {
          nl: "Vrijdag- en zaterdagavond zijn de tafels in het midden gedeeld en is er geen zitplek vrij. Eten aan de bar van een stand gaat dan sneller.",
          en: "On Friday and Saturday evenings the central tables are shared and there is not a free seat. Eating at a stall's counter is quicker.",
        },
      ],
      bestLight: "midday",
      busyness: 4,
      coords: { lat: 38.6966, lng: -9.4223 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1781110966661-22ad953a1b6a?w=1600&q=80",
        alt: {
          nl: "Marktkramen onder een overkapping met verse producten en eetstands.",
          en: "Market stalls under a roof with fresh produce and food counters.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: een bord eten op een houten tafel.",
            en: "Mood shot: a plate of food on a wooden table.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: verse producten uitgestald op een marktkraam.",
            en: "Mood shot: fresh produce laid out on a market stall.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["markt", "eten", "lokaal", "druk"],
      activities: ["uit-eten", "koffie", "winkelen"],
    },

    // ----------------------------------------------------------- Marisco Vivo
    {
      slug: "marisco-vivo",
      name: "Marisco Vivo",
      kind: "table",
      tagline: {
        nl: "Schaaldieren uit het bassin, afgerekend per kilo.",
        en: "Shellfish straight out of the tank, priced by the kilo.",
        pt: "Marisco tirado do viveiro, pesado e pago ao quilo.",
      },
      notes: [
        {
          nl: "Vraag naar de vangst van de dag en laat het gewicht noemen voordat het naar de keuken gaat — marisco gaat hier per kilo en dat telt snel op.",
          en: "Ask what came in today and have them tell you the weight before it goes to the kitchen — shellfish is sold by the kilo and it adds up fast.",
        },
        {
          nl: "Voor het weekend reserveren; doordeweeks lukt lunch meestal zonder.",
          en: "Book for the weekend; on weekdays lunch usually works without.",
        },
        {
          nl: "Een gevulde krab om te delen als voorgerecht is de klassieke opening en meteen de goedkoopste manier om hier te eten.",
          en: "A stuffed crab to share is the classic opener, and the cheapest way to eat here properly.",
        },
      ],
      bestLight: "midday",
      busyness: 3,
      coords: { lat: 38.6947, lng: -9.4219 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1779517935259-f27542eaca98?w=1600&q=80",
        alt: {
          nl: "Schaal met verse zeevruchten op ijs in een visrestaurant.",
          en: "A platter of fresh shellfish on ice in a seafood restaurant.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: een bord eten op een houten tafel.",
            en: "Mood shot: a plate of food on a wooden table.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: verse producten uitgestald op een marktkraam.",
            en: "Mood shot: fresh produce laid out on a market stall.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["zeevruchten", "reserveren", "eten"],
      activities: ["uit-eten"],
    },

    // ---------------------------------------------------- Pastelaria Victoria
    {
      slug: "pastelaria-victoria",
      name: "Pastelaria Victoria",
      kind: "table",
      tagline: {
        nl: "Buurtbakkerij waar de pastéis warm uit de oven op de toonbank komen.",
        en: "A neighbourhood pastelaria where the custard tarts reach the counter still warm.",
        pt: "Uma pastelaria de bairro onde os pastéis chegam ao balcão ainda quentes.",
      },
      notes: [
        {
          nl: "Vraag of er net een bak uit de oven komt. Lauw uit de vitrine is niet hetzelfde als een pastel die je nog niet vast kunt houden.",
          en: "Ask whether a tray is about to come out. Lukewarm from the display is not the same as one you can barely hold.",
        },
        {
          nl: "Ze hebben ook travesseiros, het bladerdeegkussen met amandelcrème uit Sintra — handig als je daar niet meer komt.",
          en: "They also do travesseiros, the almond-cream pastry from Sintra — useful if you are not going up there.",
        },
        {
          nl: "Staan aan de bar is goedkoper dan zitten aan een tafeltje. Dat geldt in heel Portugal, ook hier.",
          en: "Standing at the counter costs less than sitting at a table. That holds across Portugal, and here too.",
        },
      ],
      bestLight: "dawn",
      busyness: 3,
      coords: { lat: 38.6971, lng: -9.4218 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1591107576521-87091dc07797?w=1600&q=80",
        alt: {
          nl: "Pastéis de nata met gebrand bladerdeeg op een toonbank.",
          en: "Custard tarts with caramelised pastry on a counter.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: een bord eten op een houten tafel.",
            en: "Mood shot: a plate of food on a wooden table.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: verse producten uitgestald op een marktkraam.",
            en: "Mood shot: fresh produce laid out on a market stall.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["zoet", "ontbijt", "lokaal", "goedkoop"],
      activities: ["koffie", "uit-eten"],
    },

    // --------------------------------------------------------------- Heim Café
    {
      slug: "heim-cafe",
      name: "Heim Café",
      kind: "table",
      tagline: {
        nl: "Licht hoekcafé waar half Cascais op zaterdag ontbijt.",
        en: "A bright corner café where half of Cascais has Saturday breakfast.",
        pt: "Um café de esquina cheio de luz onde meia Cascais toma o pequeno-almoço ao sábado.",
      },
      notes: [
        {
          nl: "Ze nemen geen reserveringen. Tussen tien en één sta je in de rij, om negen uur loop je zo naar binnen.",
          en: "They take no bookings. Between ten and one you queue; at nine you walk straight in.",
        },
        {
          nl: "De keuken draait de hele dag ontbijt, dus wie de drukte wil ontlopen komt om drie uur 's middags.",
          en: "The kitchen serves breakfast all day, so the way around the crowd is to come at three in the afternoon.",
        },
        {
          nl: "Vanaf hier is het twee straten naar de markt — makkelijk te combineren met een ochtendrondje door het centrum.",
          en: "It is two streets from the market — easy to fold into a morning loop through the centre.",
        },
      ],
      bestLight: "dawn",
      busyness: 4,
      coords: { lat: 38.6962, lng: -9.422 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1750572373040-f20b405d6eb2?w=1600&q=80",
        alt: {
          nl: "Ontbijttafel met koffie en brood in een licht café.",
          en: "A breakfast table with coffee and bread in a bright café.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: een bord eten op een houten tafel.",
            en: "Mood shot: a plate of food on a wooden table.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: verse producten uitgestald op een marktkraam.",
            en: "Mood shot: fresh produce laid out on a market stall.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["ontbijt", "koffie", "druk", "geen-reservering"],
      activities: ["koffie", "uit-eten"],
    },

    // ---------------------------------------------------------- Rooftop Lounge
    {
      slug: "rooftop-lounge",
      name: "Rooftop Lounge",
      kind: "afterdark",
      tagline: {
        nl: "Daktuin met cocktails en zicht over de daken naar de baai.",
        en: "A roof garden with cocktails and a view across the rooftops to the bay.",
        pt: "Um terraço com cocktails e vista por cima dos telhados até à baía.",
      },
      notes: [
        {
          nl: "Happy hour loopt van vijf tot zeven. Daarna kost dezelfde cocktail bijna het dubbele.",
          en: "Happy hour runs from five to seven. After that the same cocktail costs nearly double.",
        },
        {
          nl: "Vraag bij het reserveren om een tafel aan de reling; de rest van het terras kijkt vooral tegen de bar aan.",
          en: "When you book, ask for a table at the railing — the rest of the terrace mostly faces the bar.",
        },
        {
          nl: "Na achten geldt een dresscode. Slippers en zwemshorts komen de lift niet uit.",
          en: "After eight there is a dress code. Flip-flops and swim shorts do not get out of the lift.",
        },
      ],
      bestLight: "goldenhour",
      busyness: 3,
      coords: { lat: 38.6978, lng: -9.4215 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1578166903596-08babbbadf19?w=1600&q=80",
        alt: {
          nl: "Dakterras met loungestoelen en uitzicht over de stad bij avondlicht.",
          en: "A roof terrace with lounge seating overlooking the town in evening light.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: donkere rotskust met schuimend water.",
            en: "Mood shot: dark rocky coastline with foaming water.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: cocktailglazen op een bar in avondlicht.",
            en: "Mood shot: cocktail glasses on a bar in evening light.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["cocktails", "uitzicht", "zonsondergang", "dresscode"],
      activities: ["borrelen", "uitgaan", "fotograferen"],
    },

    // ---------------------------------------------------------- Casino Estoril
    {
      slug: "casino-estoril",
      name: "Casino Estoril",
      kind: "afterdark",
      tagline: {
        nl: "Speelzalen en avondshows in het casino dat Ian Fleming naar verluidt op een idee bracht.",
        en: "Gaming rooms and evening shows in the casino said to have given Ian Fleming his idea.",
        pt: "Salas de jogo e espetáculos no casino que terá dado a ideia a Ian Fleming.",
      },
      notes: [
        {
          nl: "Neem je paspoort of ID mee. Zonder legitimatie kom je de speelzalen niet in, ook niet om alleen te kijken.",
          en: "Bring your passport or ID. Without it you do not get into the gaming rooms, not even to look.",
        },
        {
          nl: "De expositieruimte en de tuin ervoor zijn overdag vrij toegankelijk; je hoeft niet te spelen om binnen te lopen.",
          en: "The exhibition space and the garden in front are free during the day; you do not have to gamble to walk in.",
        },
        {
          nl: "Concerten en shows zijn los van de speelzalen en vaak weken vooruit uitverkocht. Check de agenda voordat je erop rekent.",
          en: "Concerts and shows are separate from the gaming floor and often sold out weeks ahead. Check the calendar before counting on one.",
        },
      ],
      bestLight: "afterdark",
      busyness: 3,
      coords: { lat: 38.7055, lng: -9.396 },
      area: "Estoril",
      cover: {
        src: "https://images.unsplash.com/photo-1561916621-f2bab563a990?w=1600&q=80",
        alt: {
          nl: "Verlichte casinozaal met speeltafels in de avond.",
          en: "A lit casino hall with gaming tables in the evening.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: warme lampen tijdens het blauwe uur.",
            en: "Mood shot: warm lights during the blue hour.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1520637836862-4d197d17c91a?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: avondlicht op een verlicht gebouw.",
            en: "Mood shot: evening light on a lit building.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["nachtleven", "shows", "legitimatie-nodig"],
      activities: ["uitgaan", "livemuziek"],
    },

    // --------------------------------------------------------- Festival do Mar
    {
      slug: "festival-do-mar",
      name: "Festival do Mar",
      kind: "culture",
      tagline: {
        nl: "Augustusweek aan de vissershaven met gegrilde vis, muziek en vuurwerk boven het water.",
        en: "A week in August by the fishing harbour: grilled fish, music and fireworks over the water.",
        pt: "Uma semana de agosto junto à doca dos pescadores: peixe grelhado, música e fogo sobre a água.",
      },
      notes: [
        {
          nl: "Speelt zich af in augustus rond de vissershaven. De exacte dagen wisselen per jaar, dus check ze voordat je er een avond op plant.",
          en: "It runs in August around the fishing harbour. The exact dates move each year, so check them before you plan an evening around it.",
        },
        {
          nl: "De meeste optredens zijn gratis; je betaalt alleen voor eten en drinken, meestal met munten die je vooraf koopt.",
          en: "Most performances are free; you only pay for food and drink, usually with tokens bought up front.",
        },
        {
          nl: "Kom voor het donker als je bij het podium wilt staan. Daarna schuift het hele centrum die kant op.",
          en: "Come before dark if you want to stand near the stage. After that the whole centre moves that way.",
        },
        {
          nl: "Het vuurwerk is vanaf de kade druk maar vanaf het uitkijkpunt boven de haven rustiger te zien.",
          en: "The fireworks are crowded from the quay but easier to watch from the viewpoint above the harbour.",
        },
      ],
      bestLight: "afterdark",
      busyness: 5,
      coords: { lat: 38.6952, lng: -9.4198 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1779517935693-975974f1cd4d?w=1600&q=80",
        alt: {
          nl: "Verlichte eetkraampjes en publiek op een zomeravondfestival aan het water.",
          en: "Lit food stalls and a crowd at a summer evening festival by the water.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: een bord eten op een houten tafel.",
            en: "Mood shot: a plate of food on a wooden table.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: verse producten uitgestald op een marktkraam.",
            en: "Mood shot: fresh produce laid out on a market stall.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["festival", "zomer", "eten", "gratis", "druk"],
      activities: ["livemuziek", "uit-eten", "uitgaan"],
    },

    // ------------------------------------------------------- Marina de Cascais
    {
      slug: "marina-de-cascais",
      name: "Marina de Cascais",
      kind: "water",
      tagline: {
        nl: "Jachthaven met terrassen aan de kade en zeilboten die in en uit varen.",
        en: "A marina with quayside terraces and sailing boats coming and going.",
        pt: "Uma marina com esplanadas no cais e veleiros a entrar e a sair.",
      },
      notes: [
        {
          nl: "Vanaf de steigers vertrekken de boottochten langs de kust richting Guincho. Kaartjes koop je bij de hokjes aan het begin van de pier.",
          en: "Boat trips along the coast towards Guincho leave from the pontoons. Tickets come from the booths at the head of the pier.",
        },
        {
          nl: "De restaurants aan de buitenring zijn duurder dan wat je twee straten landinwaarts vindt. Kom hier voor het water, niet voor de rekening.",
          en: "The restaurants on the outer ring cost more than what you find two streets inland. Come for the water, not the bill.",
        },
        {
          nl: "Rond een uur of zes komen de boten binnen; dat is het moment om nog even op de kade te blijven hangen.",
          en: "Around six the boats come in — the moment to stay on the quay a little longer.",
        },
      ],
      bestLight: "midday",
      busyness: 3,
      coords: { lat: 38.694, lng: -9.42 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1763151428213-dc7cac7e0f5c?w=1600&q=80",
        alt: {
          nl: "Zeilboten in een jachthaven met terrassen langs de kade.",
          en: "Sailing boats in a marina with terraces along the quay.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: boten op stil water bij de kade.",
            en: "Mood shot: boats on still water beside the quay.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: reisspullen klaargelegd voor vertrek.",
            en: "Mood shot: travel gear laid out before departure.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["haven", "boten", "eten", "familie"],
      activities: ["varen", "wandelen", "uit-eten", "borrelen"],
    },

    // ------------------------------------------------ Parque Marechal Carmona
    {
      slug: "parque-marechal-carmona",
      name: "Parque Marechal Carmona",
      kind: "wild",
      tagline: {
        nl: "Stadspark met oude bomen, vijvers en pauwen die vrij rondlopen.",
        en: "A town park of old trees, ponds and peacocks wandering loose.",
        pt: "Um parque urbano de árvores antigas, lagos e pavões à solta.",
      },
      notes: [
        {
          nl: "De pauwen en kippen lopen los en zijn brutaal. Leg je picknick niet zomaar op de grond.",
          en: "The peacocks and chickens roam free and are bold. Do not leave your picnic on the ground.",
        },
        {
          nl: "Aan de zuidkant grenst het park aan het paleismuseum; die doorsteek brengt je in vijf minuten bij de baai.",
          en: "On the south side the park adjoins the palace museum; that cut-through puts you at the bay in five minutes.",
        },
        {
          nl: "Vroeg in de ochtend heb je het park zo goed als voor jezelf. 's Middags is het de schaduwplek van de buurt.",
          en: "Early in the morning the park is practically yours. By afternoon it is the neighbourhood's shade.",
        },
      ],
      bestLight: "dawn",
      busyness: 1,
      coords: { lat: 38.699, lng: -9.421 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1709570125404-e275c025dc4a?w=1600&q=80",
        alt: {
          nl: "Schaduwrijk stadspark met grote bomen en een pad tussen het gras.",
          en: "A shaded town park with large trees and a path across the grass.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: zonlicht dat door hoge bomen valt.",
            en: "Mood shot: sunlight falling through tall trees.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: open landschap met water en heuvels in de verte.",
            en: "Mood shot: open landscape with water and distant hills.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["groen", "familie", "gratis", "lokaal", "schaduw"],
      activities: ["wandelen", "picknicken", "fotograferen"],
    },

    // ------------------------------------------------------- Passeio Marítimo
    {
      slug: "passeio-maritimo",
      name: "Passeio Marítimo",
      kind: "wild",
      tagline: {
        nl: "Kustpad van Cascais naar Estoril, de hele weg vlak langs het water.",
        en: "The seafront path from Cascais to Estoril, right along the water the whole way.",
        pt: "O passeio marítimo de Cascais ao Estoril, sempre rente à água.",
      },
      notes: [
        {
          nl: "Ruim drie kilometer van de baai van Cascais tot het strand van Tamariz, vlak en zonder verkeer.",
          en: "A little over three kilometres from Cascais bay to Tamariz beach, flat and traffic-free.",
        },
        {
          nl: "In de zomer is het rond zeven uur 's avonds een file van wandelaars. Voor negenen 's ochtends heb je het pad bijna voor jezelf.",
          en: "On summer evenings around seven it is a slow river of walkers. Before nine in the morning it is nearly yours.",
        },
        {
          nl: "Onderweg liggen kleine baaien met trappen naar het water; Praia da Duquesa en Praia das Moitas zijn de rustigste.",
          en: "Small coves with steps down to the water line the route; Praia da Duquesa and Praia das Moitas are the quietest.",
        },
        {
          nl: "Bij hoge deining slaat het water over de laagste stukken heen. Dat is spectaculair om te zien en een slecht moment voor je telefoon.",
          en: "In a big swell the water washes over the lowest sections. Spectacular to watch, and a bad moment for your phone.",
        },
      ],
      bestLight: "dawn",
      busyness: 3,
      coords: { lat: 38.7015, lng: -9.415 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1673691206978-b2d4cbb3ba48?w=1600&q=80",
        alt: {
          nl: "Betonnen kustpad langs de rotsen met de oceaan ernaast.",
          en: "A concrete seafront path along the rocks with the ocean beside it.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: boten op stil water bij de kade.",
            en: "Mood shot: boats on still water beside the quay.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: reisspullen klaargelegd voor vertrek.",
            en: "Mood shot: travel gear laid out before departure.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["wandelroute", "uitzicht", "gratis", "familie"],
      activities: ["wandelen", "fietsen", "zwemmen", "fotograferen"],
    },

    // ------------------------------------------------------- Centro Histórico
    {
      slug: "centro-historico",
      name: "Centro Histórico",
      kind: "culture",
      tagline: {
        nl: "Kasseistraatjes met azulejogevels, één hoek van de drukke winkelstraat.",
        en: "Cobbled lanes and tiled façades, one corner away from the busy shopping street.",
        pt: "Ruas de calçada e fachadas de azulejo, a uma esquina da rua comercial.",
      },
      notes: [
        {
          nl: "De hoofdstraat is de drukke; één steeg naar links of rechts wordt het meteen stil. Daar zitten ook de winkels die geen souvenirs verkopen.",
          en: "The main street is the busy one; one lane left or right it goes quiet, and that is where the shops that are not selling souvenirs are.",
        },
        {
          nl: "Veel kleine zaken sluiten tussen één en drie voor de lunch, en op maandag de hele dag.",
          en: "Many small shops close between one and three for lunch, and all day on Monday.",
        },
        {
          nl: "De kasseien zijn glad, zeker na regen. Gladde zolen zijn hier geen goed idee.",
          en: "The cobbles are slippery, especially after rain. Smooth soles are a bad idea here.",
        },
      ],
      bestLight: "midday",
      busyness: 4,
      coords: { lat: 38.6971, lng: -9.4213 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1631655331115-d97e5521274a?w=1600&q=80",
        alt: {
          nl: "Smalle kasseistraat met gekleurde gevels en winkeltjes.",
          en: "A narrow cobbled street with coloured façades and small shops.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: witte huizen met terracotta daken aan de Portugese kust.",
            en: "Mood shot: white houses with terracotta roofs on the Portuguese coast.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1585247226801-bc613c441316?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: smalle straat met gekleurde gevels.",
            en: "Mood shot: a narrow street with coloured façades.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["historisch", "shoppen", "azulejos", "wandelroute"],
      activities: ["winkelen", "wandelen", "koffie", "fotograferen"],
    },

    // ---------------------------------------------------- Costa do Guincho Trail
    {
      slug: "costa-do-guincho-trail",
      name: "Costa do Guincho Trail",
      kind: "wild",
      tagline: {
        nl: "Kustpad langs kliffen en duinen richting Guincho, zonder een meter asfalt.",
        en: "A coastal path over cliffs and dunes towards Guincho, without a metre of tarmac.",
        pt: "Um trilho costeiro por falésias e dunas até ao Guincho, sem um metro de alcatrão.",
      },
      notes: [
        {
          nl: "Ongeveer zeven kilometer heen en terug. Het pad is duidelijk maar bestaat uit los zand en steen, dus geen slippers.",
          en: "Roughly seven kilometres out and back. The path is obvious but made of loose sand and stone, so no flip-flops.",
        },
        {
          nl: "Onderweg is niets: geen kraan, geen kiosk, geen schaduw. Water en een pet meenemen.",
          en: "There is nothing along the way: no tap, no kiosk, no shade. Bring water and a cap.",
        },
        {
          nl: "Loop 'm in de ochtend. 's Middags staat de noordwestenwind vol op je gezicht en loop je de laatste kilometers door het zand.",
          en: "Walk it in the morning. By afternoon the north-westerly is straight in your face and the last kilometres are sandblasted.",
        },
      ],
      bestLight: "dawn",
      busyness: 1,
      coords: { lat: 38.705, lng: -9.45 },
      area: "Guincho",
      cover: {
        src: "https://images.unsplash.com/photo-1715774425405-cba6f3bd367a?w=1600&q=80",
        alt: {
          nl: "Wandelpad over een klif langs de kust met uitzicht op de oceaan.",
          en: "A footpath across a clifftop along the coast with a view of the ocean.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: zonlicht dat door hoge bomen valt.",
            en: "Mood shot: sunlight falling through tall trees.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: open landschap met water en heuvels in de verte.",
            en: "Mood shot: open landscape with water and distant hills.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["wandelroute", "verborgen", "kliffen", "wind", "gratis"],
      activities: ["wandelen", "fotograferen"],
    },

    // ------------------------------------------------------ Guincho Surf School
    {
      slug: "guincho-surf-school",
      name: "Guincho Surf School",
      kind: "water",
      tagline: {
        nl: "Surfles op een strand waar de golven vrijwel altijd staan.",
        en: "Surf lessons on a beach that almost always has waves.",
        pt: "Aulas de surf numa praia que quase sempre tem ondas.",
      },
      notes: [
        {
          nl: "Een beginnersles duurt twee uur, board en wetsuit inbegrepen. In het hoogseizoen een paar dagen vooruit boeken.",
          en: "A beginners' lesson runs two hours, board and wetsuit included. In high season, book a few days ahead.",
        },
        {
          nl: "Bij te harde wind wijken ze uit naar een beschutter strand. Vraag ernaar bij het boeken, dan weet je waar je 's ochtends moet zijn.",
          en: "When the wind is too strong they move to a more sheltered beach. Ask when booking so you know where to turn up.",
        },
        {
          nl: "Het water vraagt hier het hele jaar om een wetsuit, ook in augustus. Neem daarna iets droogs en warms mee voor onderweg.",
          en: "The water calls for a wetsuit year-round, August included. Bring something dry and warm for afterwards.",
        },
      ],
      bestLight: "dawn",
      busyness: 2,
      coords: { lat: 38.7261, lng: -9.4762 },
      area: "Guincho",
      cover: {
        src: "https://images.unsplash.com/photo-1745594151309-6c7d9172c7c3?w=1600&q=80",
        alt: {
          nl: "Surfer met board in de branding voor een breed strand.",
          en: "A surfer carrying a board through the shore break of a wide beach.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: boten op stil water bij de kade.",
            en: "Mood shot: boats on still water beside the quay.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: reisspullen klaargelegd voor vertrek.",
            en: "Mood shot: travel gear laid out before departure.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["surf", "les", "oceaan", "reserveren"],
      activities: ["surfen", "zwemmen"],
    },

    // --------------------------------------------------------- Palácio da Pena
    {
      slug: "palacio-da-pena",
      name: "Palácio Nacional da Pena",
      kind: "culture",
      tagline: {
        nl: "Geel-rood paleis op de hoogste heuvel van Sintra, vaak net boven de mist.",
        en: "A yellow-and-red palace on Sintra's highest hill, often just above the mist.",
        pt: "Um palácio amarelo e vermelho no ponto mais alto de Sintra, muitas vezes acima do nevoeiro.",
      },
      notes: [
        {
          nl: "Koop je ticket online met tijdslot. Aan de kassa sta je in het seizoen zo een uur.",
          en: "Buy a timed ticket online. In season the box office costs you an hour.",
        },
        {
          nl: "Voor half tien binnen zijn is het verschil tussen een terras voor jezelf en schuifelen in een rij.",
          en: "Being inside before half past nine is the difference between having the terrace to yourself and shuffling in a queue.",
        },
        {
          nl: "Het park is los van het paleis en veel rustiger. Reken op twee uur extra als je naar de Cruz Alta wilt lopen.",
          en: "The park is separate from the palace and far quieter. Allow two extra hours if you want to walk up to the Cruz Alta.",
        },
        {
          nl: "Sintra is vaak een paar graden koeler en mistiger dan de kust. Een trui is hier geen overbodige luxe.",
          en: "Sintra runs a few degrees cooler and mistier than the coast. A jumper is not excessive.",
        },
      ],
      bestLight: "dawn",
      busyness: 5,
      coords: { lat: 38.7877, lng: -9.3908 },
      area: "Sintra",
      cover: {
        src: "https://images.unsplash.com/photo-1670953287971-821a96b6134a?w=1600&q=80",
        alt: {
          nl: "Kleurrijk paleis met torens op een beboste heuveltop in Sintra.",
          en: "A colourful palace with towers on a wooded hilltop in Sintra.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: witte huizen met terracotta daken aan de Portugese kust.",
            en: "Mood shot: white houses with terracotta roofs on the Portuguese coast.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1585247226801-bc613c441316?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: smalle straat met gekleurde gevels.",
            en: "Mood shot: a narrow street with coloured façades.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["historisch", "iconisch", "druk", "reserveren", "uitzicht"],
      activities: ["museumbezoek", "wandelen", "fotograferen"],
    },

    // ----------------------------------------------------- Atlantic Beach Club
    {
      slug: "atlantic-beach-club",
      name: "Atlantic Beach Club",
      kind: "beach",
      tagline: {
        nl: "Strandclub met infinity pool, cabana's en een dj die 's middags aanzet.",
        en: "A beach club with an infinity pool, cabanas and a DJ from mid-afternoon.",
        pt: "Um beach club com piscina infinita, cabanas e DJ a partir do meio da tarde.",
      },
      notes: [
        {
          nl: "Bedden reserveer je online en die zijn in het weekend snel weg. Er geldt een minimumbesteding per bed, dus reken vooraf even door wat het echt kost.",
          en: "Beds are booked online and go quickly at weekends. There is a minimum spend per bed, so work out beforehand what it actually costs.",
        },
        {
          nl: "Het restaurant is ook zonder bed toegankelijk — de goedkoopste manier om hier een middag te zitten.",
          en: "The restaurant is open without a bed — the cheapest way to spend an afternoon here.",
        },
        {
          nl: "De dj begint rond een uur of drie. Wie rust zoekt zit er beter voor die tijd.",
          en: "The DJ starts around three. If you came for quiet, come before that.",
        },
      ],
      bestLight: "midday",
      busyness: 3,
      coords: { lat: 38.6985, lng: -9.4234 },
      area: "Cascais Centro",
      cover: {
        src: "https://images.unsplash.com/photo-1753236489674-b4024d5cb1c8?w=1600&q=80",
        alt: {
          nl: "Zwembad met ligbedden en parasols aan zee bij een strandclub.",
          en: "A pool with sunbeds and parasols by the sea at a beach club.",
        },
        credit: "Unsplash",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: helder zeewater dat in banen turquoise over licht zand uitrolt.",
            en: "Mood shot: clear sea water washing over pale sand in bands of turquoise.",
          },
          credit: "Unsplash",
        },
        {
          src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
          alt: {
            nl: "Sfeerbeeld: leeg strand onder een strakblauwe hemel.",
            en: "Mood shot: an empty beach under a clear blue sky.",
          },
          credit: "Unsplash",
        },
      ],
      tags: ["zwembad", "cocktails", "reserveren", "muziek"],
      activities: ["zwemmen", "zonnebaden", "borrelen", "uit-eten"],
    },
  ],
};
