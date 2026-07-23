import { cascais } from "@/content/cascais";
import {
  parseDestination,
  type Destination,
  type LightWindow,
  type Place,
  type PlaceKind,
} from "@/lib/schema/content";

/**
 * Curated content loader.
 *
 * Validation happens once, here, at module load — so a broken tagline or a
 * coordinate with a swapped sign throws during the build instead of rendering
 * as an empty card three screens deep (SPEC.md §6). Everything downstream can
 * treat this data as trustworthy.
 *
 * Only Cascais exists as a flagship for now; open-data destinations are
 * assembled at runtime by a different path and never come through here.
 */
const destination: Destination = parseDestination(cascais);

const placesBySlug: ReadonlyMap<string, Place> = new Map(
  destination.places.map((place) => [place.slug, place]),
);

/** The curated flagship destination, fully validated. */
export function getDestination(): Destination {
  return destination;
}

/** Every curated place, in authoring order. */
export function getAllPlaces(): readonly Place[] {
  return destination.places;
}

/** Look up one place; returns undefined for unknown slugs so routes can 404. */
export function getPlaceBySlug(slug: string): Place | undefined {
  return placesBySlug.get(slug);
}

/** All places of one kind, in authoring order. */
export function getPlacesByKind(kind: PlaceKind): readonly Place[] {
  return destination.places.filter((place) => place.kind === kind);
}

/** All places of any of the given kinds — for rails that merge related kinds
 *  (shoreline = beach + water, culture = culture + market). Authoring order. */
export function getPlacesByKinds(...kinds: readonly PlaceKind[]): readonly Place[] {
  const wanted = new Set(kinds);
  return destination.places.filter((place) => wanted.has(place.kind));
}

/** Places at their best in a given light window — feeds the "golden hour" rail. */
export function getPlacesByLight(light: LightWindow): readonly Place[] {
  return destination.places.filter((place) => place.bestLight === light);
}

/** The least crowded places, quietest first — the "without the crowds" rail. */
export function getQuietPlaces(maxBusyness = 2): readonly Place[] {
  return destination.places
    .filter((place) => place.busyness <= maxBusyness)
    .slice()
    .sort((a, b) => a.busyness - b.busyness);
}

/**
 * The order the "heart of the destination" rail draws from: one standout per
 * kind, so a first-time visitor with a single day sees the full range of the
 * place — a beach, a viewpoint, a table, something wild — instead of six
 * variations on the same thing.
 */
const SIGNATURE_KIND_ORDER: readonly PlaceKind[] = [
  "beach",
  "vista",
  "table",
  "wild",
  "culture",
  "afterdark",
  "water",
  "market",
];

/** The curated signature selection: the first place of each kind, capped. */
export function getSignaturePlaces(max = 6): readonly Place[] {
  const picks: Place[] = [];
  for (const kind of SIGNATURE_KIND_ORDER) {
    const first = destination.places.find((place) => place.kind === kind);
    if (first) picks.push(first);
    if (picks.length >= max) break;
  }
  return picks;
}
