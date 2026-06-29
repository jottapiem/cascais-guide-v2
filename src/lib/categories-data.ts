// Category views V3 — filtered views of the single "Cascais Places" database
import type { Category, CategoryId, Place } from "./types";
import { places } from "./places-data";
import {
  Waves, UtensilsCrossed, Sunset, Music, Trees, Mountain, Flame,
  Compass, Landmark,
} from "lucide-react";

const IMG = "https://sfile.chatglm.cn/images-ppt/";

export const categories: Category[] = [
  {
    id: "beaches",
    label: "Stranden",
    icon: Waves,
    image: IMG + "4eb5c6abafde.jpg",
    color: "#0e9fb8",
    description: "Zand, zee en zonsondergangen",
    filter: (p) => p.type === "Beach",
  },
  {
    id: "food",
    label: "Food & Cafés",
    icon: UtensilsCrossed,
    image: IMG + "6b0c6f9695d4.jpg",
    color: "#f5b400",
    description: "Vis, markten en specialty coffee",
    filter: (p) => p.type === "Food",
  },
  {
    id: "sunset",
    label: "Sunset Spots",
    icon: Sunset,
    image: IMG + "290ffd06747e.jpg",
    color: "#ff7a45",
    description: "Gouden uur boven de oceaan",
    filter: (p) => p.besteTijd === "Sunset",
  },
  {
    id: "events",
    label: "Events & Nacht",
    icon: Music,
    image: IMG + "d679cb4cf210.jpg",
    color: "#a855f7",
    description: "Nachtelijk leven en festivals",
    filter: (p) => p.type === "Event",
  },
  {
    id: "chill",
    label: "Chill & Parken",
    icon: Trees,
    image: IMG + "eecbad826fa6.jpg",
    color: "#22a06b",
    description: "Rust, schaduw en slow vibes",
    filter: (p) => p.vibe === "Chill" || p.type === "Chill",
  },
  {
    id: "viewpoints",
    label: "Viewpoints",
    icon: Mountain,
    image: IMG + "06cb9be15166.jpg",
    color: "#e8597a",
    description: "Uitzichten die je niet vergeet",
    filter: (p) => p.type === "Viewpoint",
  },
  {
    id: "activities",
    label: "Activiteiten",
    icon: Compass,
    image: IMG + "d3033d0fa268.jpg",
    color: "#7c5cff",
    description: "Surf, hike en fietsen",
    filter: (p) => p.type === "Activity",
  },
  {
    id: "museums",
    label: "Musea & Cultuur",
    icon: Landmark,
    image: IMG + "aa4683e7b1db.jpg",
    color: "#d97706",
    description: "Paleizen, forten en kunst",
    filter: (p) => p.type === "Museum",
  },
  {
    id: "trending",
    label: "Trending",
    icon: Flame,
    image: IMG + "8b36a1fb6074.jpg",
    color: "#ff5d5d",
    description: "Hotspots met hoogste vibe & drukte",
    filter: (p) => p.trending === true,
  },
];

export function getCategory(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function filterByCategory(id: CategoryId): Place[] {
  const cat = getCategory(id);
  if (!cat) return [];
  return places.filter(cat.filter);
}

// Explore feed: alle plekken gemengd, gesorteerd op social signals (saves + trending + rating + newness)
export function exploreFeed(): Place[] {
  return [...places].sort((a, b) => socialScore(b) - socialScore(a));
}

export function socialScore(p: Place): number {
  return (
    (p.trending ? 3 : 0) +
    p.drukte * 0.5 +
    p.rating * 0.8 +
    Math.log10(p.saves + 10) +
    (p.tags.includes("NEW" as never) ? 1.5 : 0) +
    (p.tags.includes("HIDDEN" as never) ? 0.5 : 0)
  );
}

// Map layer colors by type
export const LAYER_COLORS: Record<string, string> = {
  Beach: "#0e9fb8",
  Food: "#f5b400",
  Sunset: "#ff7a45",
  Event: "#a855f7",
  Chill: "#22a06b",
  Viewpoint: "#e8597a",
  Shopping: "#d6488f",
  Activity: "#7c5cff",
  Museum: "#d97706",
};
