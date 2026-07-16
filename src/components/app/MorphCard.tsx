"use client";
import { memo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { Place } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { haptics, staggerDelay } from "@/lib/premium";
import { MORPH_RADIUS_PX, CARD_WIDTH_CSS, SWIFT_EASE } from "@/lib/morph-config";
import { BlurFade } from "@/components/magicui";
import { PlaceImage } from "./PlaceImage";

// SWIFT_EASE imported from morph-config.
const CARD_SHADOW =
  "0 1px 2px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 0.5px rgba(0,0,0,0.03)";

export type MorphCardVariant =
  | "rail" // Home horizontal rail — photo + shadow + text below, 256px wide
  | "boxed-grid" // Home 2-col category-filtered grid — same rich treatment, full width
  | "masonry" // Dense edge-to-edge grid, no radius (Explore / Favorites / Category)
  | "wide" // related-places strip — rounded, photo only
  | "grid" // 2-col rounded grid, photo only (Search)
  | "square" // rounded square, photo only
  | "named" // rounded card with overlay text (Recommended)
  | "row"; // Trips — compact horizontal row with a real-sized photo

interface MorphCardProps {
  place: Place;
  variant?: MorphCardVariant;
  index?: number;
  showFav?: boolean;
  sectionId?: string;
  userCoords?: { lat: number; lng: number } | null;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 10) / 10;
}

// Variants that use the rich "photo + shadow + name/rating below" treatment.
const RICH_VARIANTS = new Set<MorphCardVariant>(["rail", "boxed-grid"]);
// Variants that render corner-to-corner with no native radius — the morph then genuinely
// interpolates 0 -> MORPH_RADIUS_PX instead of two identical constants doing nothing.
const FLAT_VARIANTS = new Set<MorphCardVariant>(["masonry", "square"]);

export const MorphCard = memo(function MorphCard({
  place,
  variant = "masonry",
  index = 0,
  showFav = true,
  sectionId = "default",
  userCoords = null,
}: MorphCardProps) {
  const setMorphPlace = useAppStore((s) => s.setMorphPlace);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => s.favorites.includes(place.id));
  const cardInstanceId = `${sectionId}-${place.id}-${index}`;
  // Selecting a derived boolean (not the whole morphPlace object) means only the one
  // card whose morphing state actually changes re-renders — not every card in the list.
  const isMorphing = useAppStore((s) => s.morphPlace?.cardInstanceId === cardInstanceId);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cached images may already be complete when this mounts — onLoad won't fire again.
  useEffect(() => {
    if (imgRef.current?.complete) setImgLoaded(true);
  }, []);

  const distance = userCoords ? calcDistance(userCoords.lat, userCoords.lng, place.lat, place.lng) : null;
  const rich = RICH_VARIANTS.has(variant);
  const flat = FLAT_VARIANTS.has(variant);
  const radius = flat ? 0 : MORPH_RADIUS_PX;
  const imageSrc = variant === "masonry" ? (place.exploreImage ?? place.coverImage) : place.coverImage;

  const handleTap = () => {
    const wrapper = imgWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setMorphPlace({
      id: place.id,
      cardInstanceId,
      coverImage: place.coverImage,
      sectionId,
      radius,
      origin: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
    haptics.selection();
  };

  const favButton = (className: string, iconClassName: string) => (
    <span
      role="button"
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(place.id);
        haptics.light();
      }}
      className={className}
      aria-label={isFav ? "Verwijder favoriet" : "Voeg toe aan favorieten"}
    >
      <Heart className={iconClassName} strokeWidth={2.4} />
    </span>
  );

  // --- ROW: Trips — compact row with a real photo (was a 64px thumbnail; too small to
  // read as "the same photo" mid-morph, so it's now a proper card image). ---
  if (variant === "row") {
    return (
      <BlurFade delay={staggerDelay(index)}>
        <motion.button
          type="button"
          onClick={handleTap}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: SWIFT_EASE }}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left shadow-sm ring-1 ring-border/40"
        >
          <div
            ref={imgWrapperRef}
            className="relative h-24 w-24 shrink-0 overflow-hidden"
            style={{ borderRadius: MORPH_RADIUS_PX, opacity: isMorphing ? 0 : 1, transition: "opacity 0ms ease" }}
          >
            <PlaceImage
              ref={imgRef}
              src={imageSrc}
              alt={place.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`transition-opacity duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{place.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">
              {place.neighborhood} · {place.vibe}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 fill-neutral-400 text-neutral-400" /> {place.rating.toFixed(1)} · Beste tijd:{" "}
              {place.besteTijd}
            </p>
          </div>
          {showFav &&
            favButton(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/80 active:scale-90 transition-transform",
              `h-4 w-4 ${isFav ? "fill-accent text-accent" : "text-muted-foreground"}`
            )}
        </motion.button>
      </BlurFade>
    );
  }

  // --- RICH: rail (Home horizontal rails) / boxed-grid (Home category-filtered grid) ---
  if (rich) {
    const wrapperClass = variant === "rail" ? "shrink-0 cursor-pointer text-left" : "w-full cursor-pointer text-left";
    return (
      <BlurFade delay={Math.min(index * 0.04, 0.3)}>
        <motion.div onClick={handleTap} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: SWIFT_EASE }} className={wrapperClass} style={variant === "rail" ? { width: CARD_WIDTH_CSS } : undefined}>
          <div
            ref={imgWrapperRef}
            className="relative aspect-square w-full overflow-hidden"
            style={{
              boxShadow: CARD_SHADOW,
              border: "1px solid rgba(0,0,0,0.05)",
              background: "#F7F6F4",
              borderRadius: MORPH_RADIUS_PX,
              opacity: isMorphing ? 0 : 1,
              transition: "opacity 0ms ease",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <PlaceImage
                ref={imgRef}
                src={imageSrc}
                alt={place.name}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`transition-opacity duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              />
              {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
            </div>
            {showFav &&
              favButton(
                "absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/15 backdrop-blur-md transition-all active:scale-90",
                `h-4 w-4 transition-all ${isFav ? "fill-white text-white" : "text-white"}`
              )}
          </div>
          <div className="mt-1 px-0.5 leading-tight">
            <p className="truncate text-[0.875rem] font-semibold text-neutral-700">{place.shortName}</p>
            <p className="mt-0.5 text-[0.8125rem] text-neutral-400">
              {place.neighborhood}
              {distance !== null && <span className="text-neutral-300"> · {distance} km</span>}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[0.8125rem] text-neutral-400 capitalize">{place.type.toLowerCase()}</span>
              <span className="text-neutral-300">·</span>
              <Star className="h-3 w-3 fill-neutral-400 text-neutral-400" />
              <span className="text-[0.8125rem] font-normal text-neutral-400">{place.rating.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>
      </BlurFade>
    );
  }

  // --- Photo-only variants: masonry / wide / grid / square / named ---
  const aspectClass =
    variant === "square"
      ? "aspect-square"
      : variant === "wide" || variant === "named"
        ? "aspect-[4/5]"
        : variant === "grid"
          ? "aspect-[3/4]"
          : "aspect-square";
  const widthClass = variant === "wide" || variant === "named" ? "w-full" : "";
  const premiumWrap = !flat ? "shadow-md ring-1 ring-black/[0.04]" : "";

  return (
    <BlurFade delay={staggerDelay(index)}>
      <motion.button
        type="button"
        onClick={handleTap}
        whileTap={{ scale: 0.95, transition: { duration: 0.12, ease: SWIFT_EASE } }}
        className={`group relative block w-full overflow-hidden bg-muted text-left ${widthClass} ${premiumWrap}`}
      >
        <div
          ref={imgWrapperRef}
          style={{ borderRadius: radius, opacity: isMorphing ? 0 : 1, transition: "opacity 0ms ease" }}
          className={`relative ${aspectClass} w-full overflow-hidden`}
        >
          <PlaceImage
            ref={imgRef}
            src={imageSrc}
            alt={place.name}
            onLoad={() => setImgLoaded(true)}
            className={`transition-opacity duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
          {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
        </div>
        {!flat && variant !== "named" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
        )}
        {variant === "named" && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pr-9">
              <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-sm">{place.shortName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                <span className="capitalize">{place.type.toLowerCase()}</span>
                <span>·</span>
                <span>{place.vibe}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
                <Heart className="h-2.5 w-2.5 fill-accent text-accent" />
                {place.rating.toFixed(1)}
                <span>·</span>
                <span>{place.besteTijd}</span>
              </p>
            </div>
          </>
        )}
        {showFav &&
          favButton(
            "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/15 backdrop-blur-md transition-transform active:scale-90",
            `h-3.5 w-3.5 transition-all ${isFav ? "fill-accent text-accent" : "fill-none text-white"}`
          )}
      </motion.button>
    </BlurFade>
  );
});
