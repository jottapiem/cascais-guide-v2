import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@/lib/schema/content";

/**
 * Installable PWA shell (SPEC §3, cross-cutting). Colours mirror the ground
 * tokens in globals.css; the splash uses the dark ground because that is what
 * the beacon mark is drawn on.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Farol",
    short_name: "Farol",
    description:
      "Jouw gids, waar je ook heen gaat. Ontdek plekken, plan je dagen en pak slim in.",
    lang: DEFAULT_LOCALE,
    dir: "ltr",
    start_url: `/${DEFAULT_LOCALE}`,
    scope: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080f16",
    theme_color: "#080f16",
    categories: ["travel", "navigation", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // The mark is drawn inside the 80% safe zone, so the same art masks well.
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
