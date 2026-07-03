import type { Bag, BagTemplate, Person } from "./types";

// ===== DEFAULT BAGS (voor migratie van bestaande items) =====
export const DEFAULT_BAGS: Bag[] = [
  {
    id: "default-carryon",
    name: "Carry-On",
    icon: "🎒",
    color: "#0e7c7b",
    type: "carry-on",
    weightLimit: 7000, // 7kg airline standaard
    weightUnit: "g",
    categories: ["Elektronica", "Documenten", "Comfort", "Kleding", "Snacks"],
    stapleItemIds: [],
    trips: [],
    pinned: true,
    lastEditedAt: Date.now(),
    createdAt: Date.now(),
  },
  {
    id: "default-toilettas",
    name: "Toilettas",
    icon: "🧴",
    color: "#f5b400",
    type: "toiletry",
    weightUnit: "g",
    categories: ["Verzorging", "Medicatie", "Parfum"],
    stapleItemIds: [],
    trips: [],
    pinned: false,
    lastEditedAt: Date.now(),
    createdAt: Date.now(),
  },
];

// ===== DEFAULT PERSON (voor migratie) =====
export const DEFAULT_PEOPLE: Person[] = [
  {
    id: "default-me",
    name: "Ik",
    avatar: "🧑",
    color: "#0e7c7b",
    createdAt: Date.now(),
  },
];

// ===== STARTER BAG TEMPLATES (first-run) =====
// 6 templates voor de onboarding flow (Checked/Packing Pro style)
export const STARTER_BAG_TEMPLATES: BagTemplate[] = [
  {
    id: "tpl-carryon",
    name: "Carry-On",
    icon: "🎒",
    color: "#0e7c7b",
    type: "carry-on",
    weightLimit: 7000,
    description: "Handbagage voor de vlucht — essentials bij de hand",
    isStarter: true,
    categories: ["Elektronica", "Documenten", "Comfort", "Kleding"],
    createdAt: Date.now(),
    items: [
      { name: "Telefoon", category: "Elektronica", priority: "must" },
      { name: "Oplader + kabel", category: "Elektronica", priority: "must" },
      { name: "Powerbank", category: "Elektronica", priority: "nice" },
      { name: "Koptelefoon", category: "Elektronica", priority: "nice" },
      { name: "Paspoort / ID", category: "Documenten", priority: "must" },
      { name: "Tickets", category: "Documenten", priority: "must", qty: 2 },
      { name: "Vochtige doekjes", category: "Comfort", priority: "nice" },
      { name: "Oordopjes", category: "Comfort", priority: "optional" },
      { name: "Linnen shirts", category: "Kleding", priority: "nice", qty: 2 },
      { name: "Trui voor de avond", category: "Kleding", priority: "nice" },
    ],
  },
  {
    id: "tpl-checked",
    name: "Checked Suitcase",
    icon: "🧳",
    color: "#f97316",
    type: "checked",
    weightLimit: 23000,
    description: "Grote koffer — kleding en schoenen voor de reis",
    isStarter: true,
    categories: ["Kleding", "Schoenen", "Accessoires", "Snacks"],
    createdAt: Date.now(),
    items: [
      { name: "Linnen shirts", category: "Kleding", priority: "nice", qty: 5 },
      { name: "Korte broek", category: "Kleding", priority: "nice", qty: 2 },
      { name: "Ondergoed", category: "Kleding", priority: "must", qty: 7 },
      { name: "Sokken", category: "Kleding", priority: "must", qty: 7 },
      { name: "Comfortabele sneakers", category: "Schoenen", priority: "must" },
      { name: "Slippers", category: "Schoenen", priority: "nice" },
      { name: "Zonnebril", category: "Accessoires", priority: "nice" },
      { name: "Pet / hoed", category: "Accessoires", priority: "optional" },
      { name: "Reepen", category: "Snacks", priority: "optional", qty: 3 },
      { name: "Waterfles", category: "Snacks", priority: "nice" },
    ],
  },
  {
    id: "tpl-toilettas",
    name: "Toilettas",
    icon: "🧴",
    color: "#f5b400",
    type: "toiletry",
    description: "Verzorging en medicatie — vloeibaar in handbagage",
    isStarter: true,
    categories: ["Verzorging", "Medicatie", "Parfum"],
    createdAt: Date.now(),
    items: [
      { name: "Tandenborstel", category: "Verzorging", priority: "must" },
      { name: "Tandpasta", category: "Verzorging", priority: "must" },
      { name: "Shampoo", category: "Verzorging", priority: "nice" },
      { name: "Zonnebrand SPF50", category: "Verzorging", priority: "must" },
      { name: "Deodorant", category: "Verzorging", priority: "must" },
      { name: "Scheerspullen", category: "Verzorging", priority: "optional" },
      { name: "Reisapotheek", category: "Medicatie", priority: "must" },
      { name: "Pleisters", category: "Medicatie", priority: "nice" },
      { name: "Parfum", category: "Parfum", priority: "optional" },
    ],
  },
  {
    id: "tpl-personal",
    name: "Personal Item",
    icon: "👜",
    color: "#a855f7",
    type: "personal",
    weightLimit: 5000,
    description: "Tas onder de stoel — dagelijks bij de hand",
    isStarter: true,
    categories: ["Documenten", "Essentials", "Snacks"],
    createdAt: Date.now(),
    items: [
      { name: "Pinpas + cash", category: "Essentials", priority: "must" },
      { name: "Sleutels", category: "Essentials", priority: "must" },
      { name: "Bril / contactlenzen", category: "Essentials", priority: "must" },
      { name: "Zonnebril", category: "Essentials", priority: "nice" },
      { name: "Tissues", category: "Essentials", priority: "optional" },
      { name: "Snacks", category: "Snacks", priority: "nice" },
      { name: "Waterfles", category: "Snacks", priority: "nice" },
    ],
  },
  {
    id: "tpl-worn",
    name: "Gedragen",
    icon: "👔",
    color: "#525252",
    type: "worn",
    description: "Pseudo-bag voor kleding en accessoires op het lichaam",
    isStarter: true,
    categories: ["Kleding", "Schoenen", "Accessoires"],
    createdAt: Date.now(),
    items: [
      { name: "Jas", category: "Kleding", priority: "nice" },
      { name: "Comfortabele schoenen", category: "Schoenen", priority: "must" },
      { name: "Horloge", category: "Accessoires", priority: "optional" },
      { name: "Bril", category: "Accessoires", priority: "optional" },
    ],
  },
  {
    id: "tpl-kids",
    name: "Kindertas",
    icon: "🧒",
    color: "#ec4899",
    type: "custom",
    description: "Bag voor de kids — entertainment en verzorging",
    isStarter: true,
    categories: ["Kleding", "Verzorging", "Entertainment", "Snacks"],
    createdAt: Date.now(),
    items: [
      { name: "Favoriete knuffel", category: "Entertainment", priority: "must" },
      { name: "Kleurboek + potloden", category: "Entertainment", priority: "nice" },
      { name: "Speelgoed", category: "Entertainment", priority: "optional" },
      { name: "Luierbroekjes", category: "Verzorging", priority: "must", qty: 5 },
      { name: "Babydoekjes", category: "Verzorging", priority: "must" },
      { name: "Snacks", category: "Snacks", priority: "must", qty: 3 },
      { name: "Drinken", category: "Snacks", priority: "must" },
    ],
  },
];

// Helper: create a Bag from a BagTemplate
export function instantiateBagFromTemplate(template: BagTemplate, ownerId?: string): Bag {
  const now = Date.now();
  return {
    id: `bag-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    icon: template.icon,
    color: template.color,
    type: template.type,
    weightLimit: template.weightLimit,
    weightUnit: "g",
    ownerId,
    categories: [...template.categories],
    stapleItemIds: [],
    trips: [],
    pinned: false,
    lastEditedAt: now,
    createdAt: now,
  };
}

// Helper: create items from a BagTemplate (for instantiation)
export function createItemsFromTemplate(
  template: BagTemplate,
  bagId: string,
  classifyFn: (name: string) => import("./types").PackingCategory
) {
  const now = Date.now();
  return template.items.map((it, i) => ({
    id: `tpl-item-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    name: it.name,
    category: classifyFn(it.name),
    situations: it.situations ?? [],
    qty: it.qty ?? 1,
    packedCount: 0,
    priority: it.priority ?? ("nice" as const),
    source: "manual" as const,
    createdAt: now - i * 10,
    bagId,
    needToBuy: false,
    trips: [],
    tags: [],
    updatedAt: now,
  }));
}
