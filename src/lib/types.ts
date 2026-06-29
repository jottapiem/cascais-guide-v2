export type PlaceType = "Beach" | "Food" | "Chill" | "Viewpoint" | "Shopping" | "Activity" | "Museum" | "Event";

export type Vibe = "Social" | "Chill" | "Nature" | "Luxury" | "Food";

export type BestTime = "Morning" | "Afternoon" | "Sunset" | "Night";

export type MoodTag = "Relax" | "Hype" | "Romantic" | "Active";

export type Tag = "SUNSET" | "FOOD" | "BEACH" | "SOCIAL" | "HIDDEN" | "ACTIVE" | "VIEW" | "LUXURY" | "CHILL" | "TRENDING" | "NEW";

export type Audience = "vrienden" | "familie" | "koppel" | "solo";

export type Neighborhood = "Cascais Centrum" | "Estoril" | "Guincho" | "Sintra" | "Carcavelos" | "Lisboa" | "Belém";

export type PhotoRole = "cover" | "explore" | "gallery";

export type PhotoSource = "instagram" | "own" | "pexels" | "unsplash" | "wikimedia" | "web";

export type PhotoPermission = "own" | "friend_shared" | "public_embed" | "unknown_private";

export interface Place {
  id: string;
  name: string;
  shortName: string;
  type: PlaceType;
  vibe: Vibe;
  drukte: 1 | 2 | 3 | 4 | 5; // Busy-ness rating from 1 to 5
  besteTijd: BestTime;
  moodTags: MoodTag[];
  tags: Tag[];
  vibeLine: string;
  voorWie: Audience[];
  tips: string[];
  mapLink: string;
  lat: number;
  lng: number;
  neighborhood: Neighborhood;
  saves: number;
  rating: number; // e.g., 4.8
  addedDaysAgo: number;
  trending?: boolean;
}

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

// Constant arrays for convenient UI mapping, validation, or selection options
export const PLACE_TYPES: PlaceType[] = ["Beach", "Food", "Chill", "Viewpoint", "Shopping", "Activity", "Museum", "Event"];
export const VIBES: Vibe[] = ["Social", "Chill", "Nature", "Luxury", "Food"];
export const BEST_TIMES: BestTime[] = ["Morning", "Afternoon", "Sunset", "Night"];
export const MOOD_TAGS: MoodTag[] = ["Relax", "Hype", "Romantic", "Active"];
export const TAGS: Tag[] = ["SUNSET", "FOOD", "BEACH", "SOCIAL", "HIDDEN", "ACTIVE", "VIEW", "LUXURY", "CHILL", "TRENDING", "NEW"];
export const AUDIENCES: Audience[] = ["vrienden", "familie", "koppel", "solo"];
export const NEIGHBORHOODS: Neighborhood[] = ["Cascais Centrum", "Estoril", "Guincho", "Sintra", "Carcavelos", "Lisboa", "Belém"];
export const PHOTO_ROLES: PhotoRole[] = ["cover", "explore", "gallery"];
export const PHOTO_SOURCES: PhotoSource[] = ["instagram", "own", "pexels", "unsplash", "wikimedia", "web"];
export const PHOTO_PERMISSIONS: PhotoPermission[] = ["own", "friend_shared", "public_embed", "unknown_private"];
