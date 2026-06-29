"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Place } from "@/lib/types";
import { useAppStore } from "@/store/app-store";

interface PlaceCardProps {
  place: Place;
  variant?: "masonry" | "wide" | "grid" | "square" | "named";
  index?: number;
  showFav?: boolean;
}

// Instagram-explore stijl: pure foto, geen rondheden, geen tekst op de kaart.
// Alleen een subtle favorieten-icoon rechtsonder dat op tab/hover verschijnt.
//
// Belangrijk: de `masonry` variant (explore/category collage) blijft EDGE-TO-EDGE
// zonder rondheden, zonder shadow, zonder ring — Instagram-style vierkante foto's.
// De `wide`, `grid` en `square` varianten (home rails, search, related) krijgen
// WEL premium rounded corners, soft shadow en ring — voor de native app feel.
export const PlaceCard = memo(function PlaceCard({
  place,
  variant = "masonry",
  index = 0,
  showFav = true,
}: PlaceCardProps) {
  const goDetail = useAppStore((s) => s.goDetail);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => s.favorites.has(place.id));

  // Uniforme vierkante tiles voor 3-koloms Instagram grid (geen masonry glitch)
  const aspectClass = (() => {
    if (variant === "square") return "aspect-square";
    if (variant === "wide") return "aspect-[4/5]";
    if (variant === "grid") return "aspect-[3/4]";
    if (variant === "named") return "aspect-[4/5]";
    // masonry = Instagram explore tile: uniform vierkant
    return "aspect-square";
  })();

  // wide + named vullen de container (geen eigen breedte — voorkomt overlap)
  const widthClass = (variant === "wide" || variant === "named") ? "w-full" : "";

  // Alleen de "premium" varianten (wide/grid/square) krijgen rondheden + shadow.
  // Masonry blijft pure edge-to-edge vierkant.
  const isPremium = variant !== "masonry";
  const premiumWrap = isPremium
    ? "rounded-2xl shadow-premium ring-1 ring-black/[0.04]"
    : "";
  const premiumImg = isPremium ? "rounded-2xl" : "";

  return (
    <motion.button
      type="button"
      onClick={() => goDetail(place.id)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.15), ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.95 }}
      className={`group relative block overflow-hidden bg-muted text-left ${widthClass} ${premiumWrap}`}
    >
      <div className={`${aspectClass} w-full overflow-hidden`}>
        <img
          src={variant === "masonry" ? (place.exploreImage ?? place.coverImage) : place.coverImage}
          alt={place.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] ${premiumImg}`}
        />
      </div>

      {/* Premium gradient overlay op wide/grid — subtiele ondergrond voor leesbaarheid heart icon */}
      {isPremium && variant !== "named" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* named variant: naam + vibe + type overlay onderaan de foto (home-stijl) */}
      {variant === "named" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pr-9">
            <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-sm">
              {place.shortName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
              <span className="capitalize">{place.type.toLowerCase()}</span>
              <span>·</span>
              <span>{place.vibe}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-accent text-accent" stroke="currentColor" strokeWidth={2}>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
              </svg>
              {place.rating.toFixed(1)}
              <span>·</span>
              <span>{place.besteTijd}</span>
            </p>
          </div>
        </>
      )}

      {/* favorieten icoon — subtiel, premium pill met ring */}
      {showFav && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(place.id);
          }}
          className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/15 backdrop-blur-md transition-all duration-200 ${
            isPremium
              ? "opacity-0 group-hover:opacity-100 active:opacity-100"
              : "opacity-0 group-hover:opacity-100 active:opacity-100"
          }`}
          aria-label={isFav ? "Verwijder favoriet" : "Voeg toe aan favorieten"}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 transition-all ${isFav ? "fill-accent text-accent" : "fill-none text-white"}`}
            stroke="currentColor"
            strokeWidth={2.4}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
          </svg>
        </span>
      )}
    </motion.button>
  );
});
