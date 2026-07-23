import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // This repo sits next to other lockfiles; pin the workspace root so Turbopack
  // never infers a parent directory as the root.
  turbopack: { root: import.meta.dirname },
  images: {
    // Curated content still points at remote photo URLs (see SPEC §9.3 — photo
    // overhaul is its own track). Restrict to the hosts we actually use.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default withNextIntl(nextConfig);
