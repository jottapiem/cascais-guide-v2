"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Star, Clock, Users, MapPin, Navigation,
  ChevronLeft, Lightbulb, Heart, Bookmark,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getPlace, places } from "@/lib/places-data";
import { LAYER_COLORS, socialScore } from "@/lib/categories-data";
import { PlaceCard } from "./PlaceCard";
import type { Audience } from "@/lib/types";

const MORPH_EASE = [0.16, 1, 0.3, 1] as const;
const SHEET_EASE = [0.16, 1, 0.3, 1] as const;
const MORPH_DURATION = 0.5;
const MORPH_TRANSITION = { duration: MORPH_DURATION, ease: MORPH_EASE };
const OPACITY_DELAY = 0.2;
const OPACITY_DURATION = 0.25;
// Hero is aspect-[4/3] binnen een max-w-md (28rem) container — sheet-top volgt exact
// de werkelijk gerenderde hero-hoogte i.p.v. een losse vh-gok die op smalle telefoons afwijkt.
const HERO_HEIGHT_CSS = "calc(min(28rem, 100vw) * 0.75)";  // foto hoogte = sheet top (4:3)

const AUDIENCE_LABEL: Record<Audience, string> = {
  vrienden: "Vrienden",
  familie: "Familie",
  chill: "Chill",
  social: "Social",
};

const TIME_LABEL: Record<string, string> = {
  Morning: "Ochtend",
  Sunset: "Sunset",
  Night: "Nacht",
};

// ── DetailOverlay — Shared Layout Shell ──
// FRAME (layoutId) morft van kaart → hero; content-img krijgt bare `layout` zodat
// Framer's projection engine 'm automatisch corrigeert tegen de FRAME-scale (geen vervorming).
// Sheet is apart, slide-up met y: 100% → 0. Overlay/buttons fade in na morph.
export function DetailOverlay({ placeId, sectionId }: { placeId: string; sectionId: string }) {
  useEffect(() => {
    // Lock body scroll tijdens detail view
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  const place = getPlace(placeId);
  const goBack = useAppStore((s) => s.goBack);
  const [exiting, setExiting] = useState(false);
  const clearMorph = useAppStore((s) => s.clearMorph);
  const setMorphPhase = useAppStore((s) => s.setMorphPhase);
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  useEffect(() => { if (morphPhase === "reverse") setExiting(true); }, [morphPhase]);

  // Back = trigger reverse morph (TransitionLayer animeert terug)
  const handleBack = () => {
    if (morphPlace) {
      setMorphPhase("reverse");
    } else {
      goBack();
    }
  };
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => s.favorites.includes(placeId));
  const sheetRef = useRef<HTMLDivElement>(null);

  // Parallax: bij scrollen in sheet, eerst sheet omhoog, dan foto mee
  const { scrollY } = useScroll({ container: sheetRef });
  const fotoY = useTransform(scrollY, [150, 500], [0, -150]);
  const fotoScale = useTransform(scrollY, [150, 500], [1, 0.92]);

  if (!place) return null;

  const color = LAYER_COLORS[place.type] ?? "#0e7c7b";

  const related = places
    .filter((p) => p.id !== place.id && (p.type === place.type || p.neighborhood === place.neighborhood))
    .sort((a, b) => socialScore(b) - socialScore(a))
    .slice(0, 6);

  return (
    <>
      {/* ── FOTO HERO — parallax-container (geen layoutId hier, alleen scroll-transform) ── */}
      <motion.div
        style={{}}
        className="fixed inset-x-0 top-0 z-30 mx-auto max-w-md origin-top"
      >
        {/* FRAME — layoutId morph target, clipt naar 4:3, zelfde key als de kaart-frame */}
        <div
          style={{ borderRadius: "48px 48px 0 0", opacity: exiting ? 0 : (!morphPlace || morphPhase === "idle" ? 1 : 0), transition: "opacity 0ms ease" }}
          className="relative aspect-[4/3] w-full overflow-hidden"
        >
          <img
            src={place.coverImage}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

      </motion.div>

      {/* Shadow overlay — sibling (z-35), boven foto (z-30), onder sheet (z-40) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: exiting ? 0 : OPACITY_DURATION, delay: exiting ? 0 : (morphPlace ? OPACITY_DELAY : 0), ease: "linear" }}
        className="fixed inset-x-0 top-0 z-35 mx-auto max-w-md pointer-events-none overflow-hidden"
        style={{ borderRadius: "48px 48px 0 0", height: HERO_HEIGHT_CSS, opacity: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/85" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
      </motion.div>

      {/* ── SHEET — snelle fade-in (150ms, geen delay) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: exiting ? 0 : OPACITY_DURATION, delay: exiting ? 0 : (morphPlace ? OPACITY_DELAY : 0), ease: "linear" }}
        style={{ top: "calc(" + HERO_HEIGHT_CSS + " - 3rem)" }}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-[#F7F6F4] rounded-t-[48px] overflow-hidden shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      >
        <div ref={sheetRef} className="h-full overflow-y-auto overflow-x-hidden">
          {/* Content — fade in na morph */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: exiting ? 0 : OPACITY_DURATION, delay: exiting ? 0 : (morphPlace ? OPACITY_DELAY : 0), ease: "linear" }}
            className="px-4 pb-28 pt-6"
          >
            {/* TITEL — bovenaan, gecentreerd (NIET op foto) */}
            <div className="text-center">
              <h1 className="text-[1.875rem] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">{place.name}</h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.8125rem] font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
                {place.neighborhood}
                <span className="opacity-50">·</span>
                <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={2.4} />
                {place.rating.toFixed(1)}
                <span className="opacity-50">·</span>
                <Bookmark className="h-3.5 w-3.5" strokeWidth={2.4} />
                {place.saves > 999 ? `${(place.saves / 1000).toFixed(1)}k` : place.saves}
              </p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {place.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-secondary-foreground">{t}</span>
                ))}
              </div>
            </div>

            {/* VIBE */}
            <div className="mt-6">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-accent">Vibe</p>
              <p className="mt-1.5 text-[1.125rem] font-semibold leading-snug text-balance tracking-[-0.01em]">{place.vibeLine}</p>
            </div>

            {/* INFO CARDS */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoCard icon={<Users className="h-4 w-4" strokeWidth={2.2} />} label="Drukte">
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= place.drukte ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="mt-1.5 text-[0.6875rem] font-medium text-muted-foreground">{place.drukte <= 2 ? "Rustig" : place.drukte === 3 ? "Gemiddeld" : "Druk"}</p>
              </InfoCard>
              <InfoCard icon={<Clock className="h-4 w-4" strokeWidth={2.2} />} label="Beste tijd">
                <p className="mt-1 text-[0.9375rem] font-bold tracking-tight">{TIME_LABEL[place.besteTijd] ?? place.besteTijd}</p>
                <p className="text-[0.6875rem] font-medium text-muted-foreground">{place.besteTijd === "Sunset" ? "Gouden uur" : place.besteTijd === "Morning" ? "Vroege ochtend" : "Avond / nacht"}</p>
              </InfoCard>
            </div>

            {/* GALERIJ */}
            {place.gallery.length > 1 && (
              <div className="mt-6">
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4">
                  {place.gallery.map((img, i) => (
                    <div key={i} className="relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted shadow-premium ring-1 ring-black/5">
                      <img src={img} alt={`${place.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VOOR WIE */}
            <div className="mt-6">
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Voor wie</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {place.voorWie.map((a) => (
                  <span key={a} className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">{AUDIENCE_LABEL[a] ?? a}</span>
                ))}
              </div>
            </div>

            {/* TIPS */}
            <div className="mt-6">
              <h3 className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} /> Tips
              </h3>
              <ul className="mt-2.5 space-y-2">
                {place.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-card p-3.5 text-[0.875rem] leading-snug shadow-premium ring-1 ring-black/[0.03]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.6875rem] font-bold text-primary">{i + 1}</span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* LOCATIE */}
            <div className="mt-6">
              <h3 className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} /> Locatie
              </h3>
              <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-premium ring-1 ring-black/[0.03]" style={{ background: `linear-gradient(135deg, ${color}14, transparent)` }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md" style={{ backgroundColor: color }}>
                  <MapPin className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9375rem] font-bold tracking-tight">{place.name}</p>
                  <p className="text-[0.6875rem] font-medium text-muted-foreground">{place.neighborhood} · {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
                </div>
              </div>
            </div>

            {/* GERELATEERD */}
            {related.length > 0 && (
              <div className="mt-7">
                <h3 className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Meer ontdekken</h3>
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4">
                  {related.map((p, i) => (
                    <div key={p.id} className="w-36 shrink-0">
                      <PlaceCard place={p} variant="wide" index={i} sectionId="related" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── BUTTONS — fade in na morph ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: exiting ? 0 : OPACITY_DURATION, delay: exiting ? 0 : (morphPlace ? OPACITY_DELAY : 0), ease: "linear" }}
        className="fixed inset-x-0 top-0 z-70 mx-auto max-w-md pt-safe-lg pointer-events-none"
      >
        <button
          type="button"
          onClick={handleBack}
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }} className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl transition-all hover:bg-white/25 active:scale-90 pointer-events-auto"
          aria-label="Terug"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
        </button>
        <div style={{ top: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }} className="absolute right-4 z-10 flex items-center gap-2 pointer-events-auto">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur-xl">
            {place.type}
          </span>
          <button
            type="button"
            onClick={() => toggleFavorite(place.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl transition-all hover:bg-white/25 active:scale-90"
            aria-label={isFav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          >
            <motion.span
              key={isFav ? "fav" : "nofav"}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              <Heart
                className={`h-[1.125rem] w-[1.125rem] transition-colors ${isFav ? "fill-accent text-accent" : "text-white"}`}
                strokeWidth={2.4}
              />
            </motion.span>
          </button>
        </div>
      </motion.div>

      {/* ── STICKY MAPS BUTTON ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: exiting ? 0 : OPACITY_DURATION, delay: exiting ? 0 : (morphPlace ? OPACITY_DELAY : 0), ease: "linear" }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md glass-strong px-4 pt-3 pb-safe hairline-t"
      >
        <a href={place.mapLink} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[0.9375rem] font-bold tracking-tight text-primary-foreground shadow-float transition-transform active:scale-[0.97]">
          <Navigation className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.6} />
          Open in Google Maps
        </a>
      </motion.div>
    </>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-premium ring-1 ring-black/[0.03]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      {children}
    </div>
  );
}
