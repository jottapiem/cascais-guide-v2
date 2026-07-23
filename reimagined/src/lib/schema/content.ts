import { z } from "zod";

/**
 * Farol content contract.
 *
 * Everything the app renders — curated flagship destinations and, later,
 * open-data-derived ones — conforms to these shapes. Validation runs at load
 * time so bad content fails loudly at the seam instead of rendering as an empty
 * card three screens deep. See SPEC.md §6.
 */

export const LOCALES = ["nl", "en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
/**
 * Kept as the literal `"nl"` rather than widened to `Locale`: `nl` is the only
 * key `localizedSchema` requires, so indexing with the literal is what lets
 * `resolve` guarantee a string instead of `string | undefined`.
 */
export const DEFAULT_LOCALE = "nl" as const satisfies Locale;

/**
 * Dutch is authored first (the owner writes it); English and Portuguese are
 * optional and fall back. Requiring all three would make adding a place three
 * times the work and would guarantee stale translations.
 */
export const localizedSchema = z.object({
  nl: z.string().min(1),
  en: z.string().min(1).optional(),
  pt: z.string().min(1).optional(),
});
export type Localized = z.infer<typeof localizedSchema>;

export function resolve(value: Localized, locale: Locale): string {
  return value[locale] ?? value[DEFAULT_LOCALE];
}

/** What kind of place this is — drives iconography, filtering and map layers. */
export const PLACE_KINDS = [
  "beach",
  "table",
  "vista",
  "wild",
  "culture",
  "afterdark",
  "market",
  "water",
] as const;
export const placeKindSchema = z.enum(PLACE_KINDS);
export type PlaceKind = z.infer<typeof placeKindSchema>;

/**
 * When this place is at its best. Framed as light rather than clock time —
 * it is what actually decides whether a viewpoint or a beach is worth the trip.
 */
export const LIGHT_WINDOWS = ["dawn", "midday", "goldenhour", "afterdark"] as const;
export const lightWindowSchema = z.enum(LIGHT_WINDOWS);
export type LightWindow = z.infer<typeof lightWindowSchema>;

export const photoSchema = z.object({
  src: z.string().url(),
  alt: localizedSchema,
  credit: z.string().optional(),
});
export type Photo = z.infer<typeof photoSchema>;

export const coordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coords = z.infer<typeof coordsSchema>;

export const placeSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  /** Proper noun — stays in the local language, never translated. */
  name: z.string().min(1),
  kind: placeKindSchema,
  /** One line that sells the place. The single most important string here. */
  tagline: localizedSchema,
  /** Insider notes — the thing a guidebook cannot give you. */
  notes: z.array(localizedSchema).default([]),
  bestLight: lightWindowSchema,
  /** 1 = you'll have it to yourself, 5 = shoulder to shoulder. */
  busyness: z.number().int().min(1).max(5),
  coords: coordsSchema,
  /** Sub-area within the destination, e.g. "Guincho". */
  area: z.string().min(1),
  cover: photoSchema,
  gallery: z.array(photoSchema).default([]),
  tags: z.array(z.string()).default([]),
  /** Activities this place implies — feeds the packing suggestions (Pijler 3). */
  activities: z.array(z.string()).default([]),
});
export type Place = z.infer<typeof placeSchema>;

export const destinationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  country: z.string().min(1),
  /** ISO 3166-1 alpha-2, used for flag/locale hints. */
  countryCode: z.string().length(2),
  center: coordsSchema,
  timezone: z.string().min(1),
  intro: localizedSchema,
  /**
   * Curated means hand-written by the owner. Open-data destinations are
   * assembled at runtime and must be labelled as such in the UI (SPEC.md §9.1).
   */
  curated: z.literal(true),
  places: z.array(placeSchema).min(1),
});
export type Destination = z.infer<typeof destinationSchema>;

/** Parse + validate a curated destination, failing loudly with a readable path. */
export function parseDestination(input: unknown): Destination {
  const result = destinationSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid destination content:\n${issues}`);
  }
  return result.data;
}
