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
  qty: number;              // hoeveelheid (default 1) — was impliciet 1
  packedCount: number;      // 0..qty — partial check-off (was: packed boolean)
  priority: Priority;       // default "nice"
  notes?: string;           // per-item notities ("alleen als regen")
  photo?: string;           // optioneel, voor VLM foto-herkenning later
  source?: "manual" | "import" | "collection" | "ai" | "camera";
  createdAt: number;        // sortering + "onlangs toegevoegd"
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
