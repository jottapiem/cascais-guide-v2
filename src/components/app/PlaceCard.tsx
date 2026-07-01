"use client";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Place } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { haptics, staggerDelay } from "@/lib/premium";

const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

interface PlaceCardProps { place: Place; variant?: "masonry" | "wide" | "grid" | "square" | "named"; index?: number; showFav?: boolean; }

export const PlaceCard = memo(function PlaceCard({ place, variant = "masonry", index = 0, showFav = true }: PlaceCardProps) {
  const goDetail = useAppStore((s) => s.goDetail);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => s.favorites.includes(place.id));
  const [imgLoaded, setImgLoaded] = useState(false);

  const aspectClass = variant === "square" ? "aspect-square" : variant === "wide" ? "aspect-[4/5]" : variant === "grid" ? "aspect-[3/4]" : variant === "named" ? "aspect-[4/5]" : "aspect-square";
  const widthClass = variant === "wide" || variant === "named" ? "w-full" : "";
  const isPremium = variant !== "masonry";
  const premiumWrap = isPremium ? "rounded-2xl shadow-md ring-1 ring-black/[0.04]" : "";
  const premiumImg = isPremium ? "rounded-2xl" : "";

  return (
    <motion.button type="button" onClick={() => { goDetail(place.id); haptics.selection(); }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay: staggerDelay(index), ease: SWIFT_EASE }} whileTap={{ scale: 0.95, transition: { duration: 0.12, ease: SWIFT_EASE } }} className={`group relative block overflow-hidden bg-muted text-left ${widthClass} ${premiumWrap}`}>
      <div className={`${aspectClass} w-full overflow-hidden`}>
        <img src={variant === "masonry" ? (place.exploreImage ?? place.coverImage) : place.coverImage} alt={place.name} loading="lazy" onLoad={() => setImgLoaded(true)} className={`h-full w-full object-cover transition-all duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"} group-hover:scale-[1.05] ${premiumImg}`} />
        {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
      </div>
      {isPremium && variant !== "named" && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      {variant === "named" && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pr-9">
            <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-sm">{place.shortName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80"><span className="capitalize">{place.type.toLowerCase()}</span><span>·</span><span>{place.vibe}</span></p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70"><Heart className="h-2.5 w-2.5 fill-accent text-accent" />{place.rating.toFixed(1)}<span>·</span><span>{place.besteTijd}</span></p>
          </div>
        </>
      )}
      {showFav && (
        <motion.span role="button" tabIndex={-1} onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); haptics.light(); }} whileTap={{ scale: 0.8 }} transition={{ duration: 0.15, ease: SWIFT_EASE }} className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/15 backdrop-blur-md transition-all duration-200 ${isPremium ? "opacity-0 group-hover:opacity-100 active:opacity-100" : "opacity-0 group-hover:opacity-100 active:opacity-100"}`} aria-label={isFav ? "Verwijder favoriet" : "Voeg toe aan favorieten"}>
          <Heart className={`h-3.5 w-3.5 transition-all ${isFav ? "fill-accent text-accent" : "fill-none text-white"}`} strokeWidth={2.4} />
        </motion.span>
      )}
    </motion.button>
  );
});
