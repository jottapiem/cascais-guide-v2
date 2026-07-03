// Shared map helpers (no leaflet dependency — safe for SSR)
import type { Place } from "./types";

export const TYPE_COLOR: Record<string, string> = {
  Beach: "#0e9fb8",
  Food: "#f5b400",
  Event: "#a855f7",
  Chill: "#22a06b",
  Viewpoint: "#e8597a",
  Shopping: "#d6488f",
  Activity: "#7c5cff",
  Museum: "#d97706",
};

export const TYPE_LABEL: Record<string, string> = {
  Beach: "Strand",
  Food: "Food",
  Event: "Event",
  Chill: "Chill",
  Viewpoint: "Uitzicht",
  Shopping: "Shop",
  Activity: "Actief",
  Museum: "Museum",
};

// Haversine distance
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function travelMinutes(km: number): number {
  return Math.max(2, Math.round((km / 25) * 60));
}

export function formatSaves(n: number): string {
  return n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function getPlaceColor(p: Place): string {
  return TYPE_COLOR[p.type] ?? "#0e7c7b";
}
