"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Search, Map as MapIcon, ArrowRight, Star, Heart } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { categories, exploreFeed } from "@/lib/categories-data";
import { places } from "@/lib/places-data";
import { haptics } from "@/lib/premium";
import { BlurFade } from "@/components/magicui";
import type { Place, CategoryId } from "@/lib/types";

const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;
const MORPH_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

const CAT_BUBBLES = [
  { id: "all" as const, label: "Alles", icon: "lucide:compass", color: "#0891b2" },
  { id: "beaches" as const, label: "Stranden", icon: "lucide:waves", color: "#0e9fb8" },
  { id: "food" as const, label: "Food", icon: "lucide:utensils-crossed", color: "#f97316" },
  { id: "sunset" as const, label: "Sunset", icon: "lucide:sunset", color: "#ff7a45" },
  { id: "chill" as const, label: "Chill", icon: "lucide:trees", color: "#22a06b" },
  { id: "viewpoints" as const, label: "Uitzicht", icon: "lucide:mountain", color: "#e8597a" },
  { id: "activities" as const, label: "Actief", icon: "lucide:compass", color: "#7c5cff" },
  { id: "museums" as const, label: "Cultuur", icon: "lucide:landmark", color: "#d97706" },
  { id: "trending" as const, label: "Trending", icon: "lucide:flame", color: "#ff5d5d" },
];

function mixWithBg(hex: string, opacity: number): string {
  const bg = { r: 0xE8, g: 0xE6, b: 0xE3 };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(bg.r + (r - bg.r) * opacity)}, ${Math.round(bg.g + (g - bg.g) * opacity)}, ${Math.round(bg.b + (b - bg.b) * opacity)})`;
}

const CARD_SHADOW = "0 1px 2px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 0.5px rgba(0,0,0,0.03)";
const SEARCH_SHADOW = "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 0 0.5px rgba(0,0,0,0.04)";
const PILL_RAISED = "0 1px 2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.03)";
const PILL_HOLLOW = "inset 0 3px 6px rgba(0,0,0,0.12), inset 2px 2px 4px rgba(0,0,0,0.08), inset -1px -1px 2px rgba(0,0,0,0.04), inset 0 -1px 1px rgba(255,255,255,0.3), 0 0 0 0.5px rgba(0,0,0,0.02)";

function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);
  return coords;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)) * 10) / 10;
}

function AirbnbCard({ place, index, userCoords, variant = "rail", sectionId }: {
  place: Place;
  index: number;
  userCoords: { lat: number; lng: number } | null;
  variant?: "rail" | "grid";
  sectionId: string;
}) {
  const goDetail = useAppStore((s) => s.goDetail);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => s.favorites.includes(place.id));
  const setMorphPlace = useAppStore((s) => s.setMorphPlace);
  const morphPlace = useAppStore((s) => s.morphPlace);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const cardInstanceId = `${sectionId}-${place.id}-${index}`;
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded (cached) on mount
  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, []);
  const distance = userCoords ? calcDistance(userCoords.lat, userCoords.lng, place.lat, place.lng) : null;

  const handleTap = () => {
    const wrapper = imgWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setMorphPlace({
      id: place.id,
      cardInstanceId,
      coverImage: place.coverImage,
      sectionId,
      origin: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    });
    haptics.selection();
  };

  const isMorphing = morphPlace?.cardInstanceId === cardInstanceId;

  const wrapperClass = variant === "rail"
    ? "w-64 shrink-0 cursor-pointer text-left"
    : "w-full cursor-pointer text-left";

  return (
    <BlurFade delay={Math.min(index * 0.04, 0.3)}>
      <motion.div
        onClick={handleTap}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: SWIFT_EASE }}
        className={wrapperClass}
      >
        <div
          ref={imgWrapperRef}
          className="relative aspect-[4/3] w-full overflow-hidden"
          style={{ boxShadow: CARD_SHADOW, border: "1px solid rgba(0,0,0,0.05)", background: "#F7F6F4", borderRadius: 28, opacity: isMorphing ? 0 : 1, transition: "opacity 0ms ease" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              ref={imgRef}
              src={place.coverImage}
              alt={place.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); haptics.light(); }}
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/15 backdrop-blur-md transition-all active:scale-90"
            aria-label={isFav ? "Verwijder favoriet" : "Voeg toe aan favorieten"}
          >
            <Heart className={`h-4 w-4 transition-all ${isFav ? "fill-white text-white" : "text-white"}`} strokeWidth={2.5} />
          </button>
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

function SeeAllButton({ places: seePlaces, onClick }: { places: Place[]; onClick: () => void }) {
  const top3 = seePlaces.slice(0, 3);
  return (
    <motion.button type="button" onClick={() => { onClick(); haptics.selection(); }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: SWIFT_EASE }} className="w-64 shrink-0 cursor-pointer text-left">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl" style={{ boxShadow: CARD_SHADOW, border: "1px solid rgba(0,0,0,0.05)", background: "#F7F6F4" }}>
        <div className="absolute inset-0 flex items-start justify-center pt-3">
          <div className="relative h-28 w-44">
            {top3.map((p, i) => (
              <div key={p.id} className="absolute h-24 w-20 overflow-hidden rounded-xl border-2 border-[#F7F6F4]" style={{ left: `calc(50% + ${(i - 1) * 26}px - 40px)`, top: `${i % 2 === 0 ? 0 : 6}px`, transform: `rotate(${(i - 1) * 6}deg)`, zIndex: 3 - i, boxShadow: CARD_SHADOW }}>
                <img src={p.coverImage} alt={p.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 border-t border-black/[0.04] bg-[#F7F6F4]/95 px-3 py-2.5 backdrop-blur-sm">
          <span className="text-[0.8125rem] font-semibold text-neutral-700">Bekijk alles</span>
          <ArrowRight className="h-3 w-3 text-neutral-700" strokeWidth={2.5} />
        </div>
      </div>
      <div className="h-16" aria-hidden="true" />
    </motion.button>
  );
}

function CategoryPill({ cat, isActive, onClick }: { cat: typeof CAT_BUBBLES[0]; isActive: boolean; onClick: () => void }) {
  const activeBg = isActive ? mixWithBg(cat.color, 0.12) : "#F7F6F4";
  const iconColor = isActive ? cat.color : "#374151";
  return (
    <button data-cat={cat.id} type="button" onClick={() => { onClick(); haptics.selection(); }} className="flex shrink-0 items-center active:scale-95 transition-transform">
      <motion.div transition={{ type: "spring", stiffness: 400, damping: 28 }} className="flex items-center gap-2.5 rounded-full px-5 py-2.5 transition-all duration-300" style={{ background: activeBg, boxShadow: isActive ? PILL_HOLLOW : PILL_RAISED }}>
        <Icon icon={cat.icon} className="h-5 w-5 transition-colors duration-300" style={{ color: iconColor }} strokeWidth={1} />
        <span className="text-[0.875rem] font-semibold transition-colors duration-300" style={{ color: "#374151" }}>{cat.label}</span>
      </motion.div>
    </button>
  );
}

export function HomeView() {
  const goSearch = useAppStore((s) => s.goSearch);
  const goMap = useAppStore((s) => s.goMap);
  const goCategory = useAppStore((s) => s.goCategory);
  const userCoords = useGeolocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const feed = exploreFeed();
  const trending = feed.filter((p) => p.trending);
  const topRated = [...feed].sort((a, b) => b.rating - a.rating);
  const hiddenGems = feed.filter((p) => p.tags.includes("HIDDEN" as never));
  const sunsetSpots = feed.filter((p) => p.besteTijd === "Sunset");

  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const catScrollRef = useRef<HTMLDivElement>(null);

  const filteredFeed = activeCat === "all" ? feed : (() => {
    const cat = categories.find((c) => c.id === activeCat);
    return cat ? feed.filter(cat.filter) : feed;
  })();

  useEffect(() => {
    const container = catScrollRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-cat="${activeCat}"]`) as HTMLElement;
    if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCat]);

  return (
    <div className="min-h-screen pb-4">
      <header className="sticky top-0 z-30 backdrop-blur-2xl transition-shadow duration-300" style={{ background: "rgba(247, 246, 244, 0.95)", boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none", borderBottom: scrolled ? "1px solid rgba(0,0,0,0.04)" : "1px solid transparent" }}>
        <div className="px-4 pt-safe-lg pb-3">
          <motion.button type="button" onClick={() => { goSearch(); haptics.selection(); }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15, ease: SWIFT_EASE }} className="flex w-full items-center justify-center rounded-full px-4 py-3 text-left" style={{ boxShadow: SEARCH_SHADOW, background: "#F7F6F4" }}>
            <Search className="h-[1rem] w-[1rem] text-neutral-500" strokeWidth={2.2} />
            <span className="ml-2 flex-1 text-center text-[0.875rem] text-neutral-500">Begin met ontdekken</span>
          </motion.button>
        </div>
        <div ref={catScrollRef} className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 py-2">
          {CAT_BUBBLES.map((cat) => (<CategoryPill key={cat.id} cat={cat} isActive={activeCat === cat.id} onClick={() => setActiveCat(cat.id)} />))}
        </div>
      </header>

      {activeCat !== "all" ? (
        <div className="px-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[1.125rem] font-bold tracking-tight text-neutral-700">{CAT_BUBBLES.find((c) => c.id === activeCat)?.label}</h2>
            <button type="button" onClick={() => { goMap(); haptics.selection(); }} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.75rem] font-semibold text-neutral-700" style={{ boxShadow: CARD_SHADOW, border: "1px solid rgba(0,0,0,0.05)", background: "#F7F6F4" }}><MapIcon className="h-3 w-3" /> Kaart</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredFeed.map((place, i) => (<AirbnbCard key={place.id} place={place} index={i} userCoords={userCoords} variant="grid" sectionId="filtered" />))}
          </div>
        </div>
      ) : (
        <div className="pt-3">
          <Section title="Populair in Cascais" places={topRated} onSeeAll={goMap} userCoords={userCoords} sectionId="toprated" />
          <Section title="Trending nu" places={trending} onSeeAll={() => goCategory("trending")} userCoords={userCoords} sectionId="trending" />
          <Section title="Hidden gems" places={hiddenGems} onSeeAll={() => goCategory("viewpoints")} userCoords={userCoords} sectionId="gems" />
          <Section title="Beste sunset spots" places={sunsetSpots} onSeeAll={() => goCategory("sunset")} userCoords={userCoords} sectionId="sunset" />
          <p className="px-4 pb-4 pt-6 text-center text-[0.6875rem] text-neutral-400">{places.length} plekken · Cascais · Estoril · Guincho · Sintra</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, places: sectionPlaces, onSeeAll, userCoords, sectionId }: { title: string; places: Place[]; onSeeAll: () => void; userCoords: { lat: number; lng: number } | null; sectionId: string }) {
  if (sectionPlaces.length === 0) return null;
  const seeAllPlaces = sectionPlaces.slice(0, 3);
  return (
    <section className="mb-6">
      <BlurFade>
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-[1.125rem] font-bold tracking-tight text-neutral-700 pb-2 border-b border-black/[0.04] w-full">{title}</h2>
        </div>
      </BlurFade>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {sectionPlaces.slice(0, 8).map((place, i) => (<AirbnbCard key={place.id} place={place} index={i} userCoords={userCoords} sectionId={sectionId} />))}
        <SeeAllButton places={seeAllPlaces} onClick={onSeeAll} />
      </div>
    </section>
  );
}
