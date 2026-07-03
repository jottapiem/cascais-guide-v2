// Packing auto-classifier — lokale keyword → categorie mapping (snel, offline)
// Voor onbekende items valt de LLM import API terug op slimme classificatie.

import type { PackingCategory, Priority, Situation, SmartCollection } from "./types";

// keyword (genormaliseerd) → categorie
const RULES: { kw: string[]; cat: PackingCategory }[] = [
  // Kleding
  { kw: ["tshirt", "t-shirt", "shirt", "top", "blouse", "trui", "sweater", "hoodie", "vest", "jurk", "dress", "rok", "skirt", "short", "korte broek", "broek", "jeans", "lingerie", "onderbroek", "socks", "sokken", "bikini", "badpak", "zwemkleding", "swimwear", "linnen", "kaftan", "poncho", "jas", "jacket"], cat: "Kleding" },
  // Schoenen
  { kw: ["schoen", "sneaker", "sandalalen", "sandaal", "slipper", "flipflop", "flip-flop", "laars", "boot", "heels", "hakken", "wandelschoen", "waterschoen", "espadrille"], cat: "Schoenen" },
  // Elektronica
  { kw: ["powerbank", "lader", "oplader", "kabel", "usb", "camera", "gopro", "laptop", "tablet", "airpod", "koptelefoon", "headphone", "speaker", "adapter", "stekker", "telefoon", "iphone"], cat: "Elektronica" },
  // Verzorging
  { kw: ["zonnebrand", "sunscreen", "aftersun", "shampoo", "conditioner", "zeep", "soap", "tandpasta", "toothbrush", "tandenborstel", "deodorant", "deo", "crème", "creme", "lotion", "makeup", "mascara", "borstel", "kam", "scheermes", "razor", "baardtrimmer", "handdoek", "handdoeken"], cat: "Verzorging" },
  // Strand
  { kw: ["handdoek", "strandhanddoek", "zonnebril", "zonnehoed", "hoed", "pet", "cap", "waterschoenen", "duikbril", "snorkel", "zwemvleugel", "opblaas", "strandtent", "parasol", "strandstoel", "reef-safe"], cat: "Strand" },
  // Accessoires
  { kw: ["bril", "zonnebril", "horloge", "watch", "sieraad", "ketting", "ring", "armband", "oorbel", "tas", "rugzak", "backpack", "portemonnee", "wallet", "riem", "belt", "paraplu", "umbrella", "sjaal", "sjaaltje"], cat: "Accessoires" },
  // Medicatie
  { kw: ["paracetamol", "ibuprofen", "medicatie", "pil", "pillen", "pleister", "bandage", "reisapotheek", "apotheek", "maagtablet", "imodium", "allergie", "inhaler", "voorschrift"], cat: "Medicatie" },
  // Documenten
  { kw: ["paspoort", "id", "identiteitsbewijs", "rijbewijs", "ticket", "boarding pass", "voucher", "verzekering", "reservering", "pas", "document", "documenten", "visa"], cat: "Documenten" },
  // Snacks
  { kw: ["snack", "snacks", "chips", "koek", "koekje", "chocolade", "noot", "noten", "mueslireep", "energiereep", "fruit", "appel", "banaan", "cracker"], cat: "Snacks" },
  // Drinken
  { kw: ["water", "waterfles", "fles", "thermos", "koffie", "thee", "drank", "sap", "bier", "wijn"], cat: "Drinken" },
  // Parfum
  { kw: ["parfum", "parfume", "eau de toilette", "edt", "edp", "geur", "perfume", "cologne"], cat: "Parfum" },
  // Essentials
  { kw: ["sleutel", "sleutels", "key", "keys", "geld", "cash", "pinpas", "creditcard", "kaart", "kaarten", "masker", "mondkapje", "handgel", "desinfectie", "tasje", "zakdoek", "pen", "boek", "leesboek", "notitieboek"], cat: "Essentials" },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function classifyItem(name: string): PackingCategory {
  const n = norm(name);
  // Pass 1: exacte match (hoogste prioriteit — voorkomt "strandhanddoek" → Verzorging)
  for (const rule of RULES) {
    for (const kw of rule.kw) {
      if (n === norm(kw)) {
        return rule.cat;
      }
    }
  }
  // Pass 2: includes match (langste keyword eerst = specifiekere match wint)
  const allKeywords = RULES.flatMap((r) =>
    r.kw.map((kw) => ({ kw: norm(kw), cat: r.cat }))
  ).sort((a, b) => b.kw.length - a.kw.length);
  for (const { kw, cat } of allKeywords) {
    if (kw && n.includes(kw)) {
      return cat;
    }
  }
  // Pass 3: fuzzy fallback (closest keyword met Levenshtein)
  let best: { cat: PackingCategory; d: number } | null = null;
  for (const rule of RULES) {
    for (const kw of rule.kw) {
      const a = n;
      const b = norm(kw);
      if (a.length < 3) continue;
      const d = lev(a, b);
      const tol = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.3));
      if (d <= tol && (!best || d < best.d)) {
        best = { cat: rule.cat, d };
      }
    }
  }
  if (best) return best.cat;
  return "Essentials";
}

function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Smart collections — automatische packs per situatie
export const SMART_COLLECTIONS: SmartCollection[] = [
  { id: "col-strand", situation: "Strand", icon: "Umbrella", items: ["Zwemkleding", "Strandhanddoek", "Zonnebrand SPF50", "Slippers", "Zonnebril", "Waterfles", "Waterschoenen"] },
  { id: "col-zwembad", situation: "Zwembad", icon: "Waves", items: ["Zwemkleding", "Handdoek", "Zonnebrand", "Zonnebril", "Slippers", "Waterfles"] },
  { id: "col-restaurant", situation: "Restaurant", icon: "UtensilsCrossed", items: ["Portemonnee", "Pinpas", "Lippenstift", "Parfum", "Telefoon"] },
  { id: "col-uitgaan", situation: "Uitgaan", icon: "Music", items: ["ID/Paspoort", "Pinpas", "Cash", "Telefoon", "Powerbank", "Parfum", "Lippenstift"] },
  { id: "col-shopping", situation: "Shopping", icon: "ShoppingBag", items: ["Portemonnee", "Pinpas", "Cash", "Powerbank", "Water", "Zonnebril", "Tas"] },
  { id: "col-stad", situation: "Stad", icon: "Building2", items: ["Telefoon", "Powerbank", "Waterfles", "Zonnebril", "Comfortabele schoenen", "Pinpas"] },
  { id: "col-hiking", situation: "Hiking", icon: "Mountain", items: ["Wandelschoenen", "Waterfles", "Zonnebrand", "Snacks", "Energie reep", "Pleisters", "Telefoon"] },
  { id: "col-roadtrip", situation: "Roadtrip", icon: "Car", items: ["Rijbewijs", "Telefoon", "Oplader", "Water", "Snacks", "Zonnebril", "Cash"] },
  { id: "col-vliegtuig", situation: "Vliegtuig", icon: "Plane", items: ["Paspoort", "Boarding pass", "Telefoon", "Oplader", "Koptelefoon", "Handdesinfectie"] },
  { id: "col-hotel", situation: "Hotel", icon: "BedDouble", items: ["Paspoort/ID", "Pinpas", "Telefoon", "Oplader", "Verzorging", "Slaapkleding"] },
  { id: "col-festival", situation: "Festival", icon: "PartyPopper", items: ["Tickets", "Powerbank", "Deodorant", "Water", "Zonnebrand", "Telefoon", "ID", "Cash"] },
  { id: "col-boot", situation: "Boot", icon: "Sailboat", items: ["Zonnebril", "Zonnebrand", "Jas", "Waterfles", "Telefoon", "Pil tegen zeeziekte"] },
  { id: "col-sport", situation: "Sport", icon: "Dumbbell", items: ["Sportkleding", "Sportschoenen", "Waterfles", "Handdoek", "Deodorant", "Snacks"] },
  { id: "col-picknick", situation: "Picknick", icon: "Basket", items: ["Picknickkleed", "Snacks", "Drinken", "Beker", "Zonnebril", "Zonnebrand", "Afvalzak"] },
];

export function getCollection(s: Situation): SmartCollection | undefined {
  return SMART_COLLECTIONS.find((c) => c.situation === s);
}

export const ALL_PACKING_CATEGORIES: PackingCategory[] = [
  "Kleding", "Schoenen", "Elektronica", "Verzorging", "Strand", "Accessoires",
  "Medicatie", "Documenten", "Snacks", "Drinken", "Parfum", "Essentials",
];

export const ALL_SITUATIONS: Situation[] = [
  "Strand", "Zwembad", "Restaurant", "Uitgaan", "Shopping", "Stad",
  "Hiking", "Roadtrip", "Vliegtuig", "Hotel", "Festival", "Boot", "Sport", "Picknick",
];

// default starter packing items (geen context/prioriteit meer)
export function defaultPackingItems() {
  const base: { name: string; situations: Situation[]; priority?: Priority; qty?: number }[] = [
    { name: "Paspoort / ID", situations: ["Vliegtuig", "Hotel"], priority: "must" },
    { name: "Pinpas + cash", situations: ["Shopping", "Uitgaan"], priority: "must" },
    { name: "Telefoon", situations: ["Stad", "Uitgaan"], priority: "must" },
    { name: "Oplader + kabel", situations: ["Hotel"], priority: "must" },
    { name: "Powerbank", situations: ["Festival", "Uitgaan"], priority: "nice" },
    { name: "Zonnebril", situations: ["Strand", "Stad"] },
    { name: "Zonnebrand SPF50", situations: ["Strand"], priority: "must" },
    { name: "Zwemkleding", situations: ["Strand", "Zwembad"] },
    { name: "Strandhanddoek", situations: ["Strand"] },
    { name: "Slippers", situations: ["Strand"] },
    { name: "Waterfles", situations: ["Strand", "Hiking", "Stad"] },
    { name: "Linnen shirts", situations: ["Stad"], qty: 3 },
    { name: "Trui voor de avond", situations: ["Uitgaan"] },
    { name: "Comfortabele sneakers", situations: ["Stad", "Hiking"] },
    { name: "Koptelefoon", situations: ["Vliegtuig"] },
    { name: "Reisapotheek", situations: ["Hotel"], priority: "must" },
  ];
  return base.map((b, i) => ({
    id: `seed-${i}`,
    name: b.name,
    category: classifyItem(b.name),
    situations: b.situations,
    qty: b.qty ?? 1,
    packedCount: 0,
    priority: b.priority ?? "nice",
    source: "manual" as const,
    createdAt: Date.now() - (base.length - i) * 1000,
  }));
}
