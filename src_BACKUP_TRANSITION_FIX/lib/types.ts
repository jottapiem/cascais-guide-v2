// Cascais Travel Discovery App V3 — Core Types

import type { LucideIcon } from "lucide-react";

export type PlaceType =
  | "Beach"
  | "Food"
  | "Event"
  | "Chill"
  | "Viewpoint"
  | "Shopping"
  | "Activity"
  | "Museum";

export type Vibe = "Social" | "Chill" | "Nature" | "Luxury" | "Food";

export type BestTime = "Morning" | "Sunset" | "Night";

export type MoodTag = "Relax" | "Hype" | "Romantic" | "Active";

export type Audience = "vrienden" | "familie" | "chill" | "social";

export type Tag =
  | "SUNSET"
  | "FOOD"
  | "BEACH"
  | "SOCIAL"
  | "HIDDEN"
  | "ACTIVE"
  | "VIEW"
  | "LUXURY"
  | "CHILL"
  | "TRENDING"
  | "NEW";

export type Neighborhood =
  | "Cascais Centrum"
  | "Estoril"
  | "Guincho"
  | "Sintra"
  | "Carcavelos";

export interface Place {
  id: string;
  name: string;
  shortName: string;
  type: PlaceType;
  vibe: Vibe;
  drukte: number;
  besteTijd: BestTime;
  moodTags: MoodTag[];
  tags: Tag[];
  vibeLine: string;
  voorWie: Audience[];
  tips: string[];
  mapLink: string;
  coverImage: string;
  gallery: string[];
  exploreImage: string; // social media stijl foto voor explore (minder commercial)
  lat: number;
  lng: number;
  neighborhood: Neighborhood;
  // social discovery signals
  saves: number; // aantal "opgeslagen"
  rating: number; // 0-5
  addedDaysAgo: number; // voor "nieuwste"
  trending?: boolean;
}

export type CategoryId =
  | "beaches"
  | "food"
  | "sunset"
  | "events"
  | "chill"
  | "viewpoints"
  | "trending"
  | "museums"
  | "activities";

export interface Category {
  id: CategoryId;
  label: string;
  icon: LucideIcon; // lucide icon component
  image: string;
  color: string;
  description: string;
  filter: (p: Place) => boolean;
}

// ===== PACKING LIST V2 =====
export type PackingCategory =
  | "Kleding"
  | "Schoenen"
  | "Elektronica"
  | "Verzorging"
  | "Strand"
  | "Accessoires"
  | "Medicatie"
  | "Documenten"
  | "Snacks"
  | "Drinken"
  | "Parfum"
  | "Essentials"
  // Nieuw (Fase 1.3) — gebaseerd op marktonderzoek:
  | "Sport"
  | "Werk"
  | "Camping"
  | "Baby"
  | "Huisdier"
  | "Koken";

export type Situation =
  | "Strand"
  | "Zwembad"
  | "Restaurant"
  | "Uitgaan"
  | "Shopping"
  | "Stad"
  | "Hiking"
  | "Roadtrip"
  | "Vliegtuig"
  | "Hotel"
  | "Festival"
  | "Boot"
  | "Sport"
  | "Picknick";

// Prioriteit (Fase 1.3) — Must/Nice/Optional, zie PackPoint/Packing Pro
export type Priority = "must" | "nice" | "optional";

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory; // automatisch bepaald, bewerkbaar
  situations: Situation[]; // multiple choice, optioneel
  // Nieuw (Fase 1.3):
  qty: number;              // hoeveelheid (default 1)
  packedCount: number;      // 0..qty — partial check-off
  priority: Priority;       // default "nice"
  notes?: string;           // per-item notities
  photo?: string;           // optioneel, voor VLM foto-herkenning later
  source?: "manual" | "import" | "collection" | "ai" | "camera";
  createdAt: number;        // sortering + "onlangs toegevoegd"
  // Nieuw (Fase 2 — Bags-first IA):
  bagId: string | null;     // null = Unfiled/Inbox
  weight?: number;          // in gram
  value?: number;           // voor verzekering
  personId?: string;        // assignment aan persoon
  needToBuy?: boolean;      // shopping-list flag
  condition?: { age: number; expectedLife: number; current: "new" | "good" | "fair" | "poor" };
  trips: string[];          // trip tags (attribute, niet parent)
  tags: string[];           // freeform cross-cutting labels
  lastUsedAt?: number;      // voor "recent gebruikt" smart view
  updatedAt: number;        // laatste wijziging
}

export interface SmartCollection {
  id: string;
  situation: Situation;
  icon: string; // lucide name
  items: string[]; // voorgestelde item namen
}

// ===== PERFECT DAY (legacy — verwijderd in V3, vervangen door Favorieten) =====

// ===== V2 PHOTO TYPES (voor toekomstige foto metadata) =====
export type PhotoRole = "cover" | "explore" | "gallery";
export type PhotoSource = "instagram" | "own" | "pexels" | "unsplash" | "wikimedia" | "web";
export type PhotoPermission = "own" | "friend_shared" | "public_embed" | "unknown_private";

export interface PlacePhoto {
  file: string;
  role: PhotoRole;
  source: PhotoSource;
  credit?: string;
  sourceUrl?: string;
  permission: PhotoPermission;
  publicSafe: boolean;
}

export interface PlacePhotoMetadata {
  placeId: string;
  photos: PlacePhoto[];
}


// ===== FASE 2: BAGS-FIRST IA =====

export type BagType = "carry-on" | "checked" | "personal" | "toiletry" | "worn" | "custom";

export interface Bag {
  id: string;
  name: string;
  icon: string;             // emoji
  color: string;            // hex
  type: BagType;
  weightLimit?: number;     // in gram
  weightUnit: "g" | "oz" | "lb";
  ownerId?: string;
  categories: string[];     // bag-scoped categorieën (AnyList P11)
  stapleItemIds: string[];  // bag-specifieke favorites
  trips: string[];          // trip tags
  notes?: string;
  attachments?: string[];   // foto's van boarding pass etc.
  pinned: boolean;
  lastEditedAt: number;
  createdAt: number;
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;          // emoji of initial
  color: string;            // hex
  createdAt: number;
}

export interface BagItemTemplate {
  name: string;
  category?: string;
  qty?: number;
  priority?: Priority;
  situations?: Situation[];
}

export interface BagTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: BagType;
  categories: string[];
  items: BagItemTemplate[];
  description?: string;
  isStarter: boolean;       // true voor de 6 ingebouwde starters
  weightLimit?: number;
  createdAt: number;
}

export type SmartViewType =
  | "unpacked"
  | "need-to-buy"
  | "overweight"
  | "assigned-to-me"
  | "by-trip"
  | "recently-used"
  | "favorites"
  | "worn"
  | "all-items"
  | "custom";

export interface SmartListView {
  id: string;
  type: SmartViewType;
  label: string;
  icon: string;
  // Voor custom smart views: filter rules
  filter?: {
    bagIds?: string[];
    personIds?: string[];
    trips?: string[];
    priorities?: Priority[];
    packed?: boolean;
    needToBuy?: boolean;
    tags?: string[];
  };
}