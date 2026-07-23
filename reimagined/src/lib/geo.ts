import type { Coords } from "@/lib/schema/content";

/**
 * Formatting helpers for the "navigation chart" motif (SPEC §5): coordinates are
 * shown the way a chart annotates them — decimal degrees with a hemisphere
 * letter — rather than as a raw signed pair.
 */

const EM_SPACE = " ";

/** e.g. `38.6979°N␣␣9.4215°W`. The em-space keeps the two bearings from merging. */
export function formatCoords({ lat, lng }: Coords): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${ns}${EM_SPACE}${Math.abs(lng).toFixed(4)}°${ew}`;
}

/**
 * A platform-agnostic "directions to here" URL. Uses the universal Google Maps
 * directions endpoint, which every phone resolves to its own maps app — so we
 * get native routing without shipping a map SDK or a paid key (SPEC §2).
 */
export function mapsDirectionsUrl({ lat, lng }: Coords): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
