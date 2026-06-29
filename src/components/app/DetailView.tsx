"use client";

import { motion } from "framer-motion";
import { Star, Clock, Users, MapPin, Navigation, ChevronLeft, Lightbulb, Heart, Bookmark } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getPlace, places } from "@/lib/places-data";
import { categories, LAYER_COLORS, socialScore } from "@/lib/categories-data";
import { usePlacePhotos, usePlaceDetails } from "@/hooks/use-place-api";
import { PlaceCard } from "./PlaceCard";
import type { Audience } from "@/lib/types";

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

export function DetailView() {
  const placeId = useAppStore((s) => s.selectedPlaceId);
  const goBack = useAppStore((s) => s.goBack);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = useAppStore((s) => (placeId ? s.favorites.has(placeId) : false));

  const place = placeId ? getPlace(placeId) : undefined;
  // Haal echte foto's + details op via Google Places (indien geconfigureerd)
  const { photos: apiPhotos, source: photoSource } = usePlacePhotos(placeId);
  const { details: apiDetails } = usePlaceDetails(placeId);

  if (!place) return null;

  const cat = categories.find((c) => c.filter(place) && c.id !== "trending");
  const color = LAYER_COLORS[place.type] ?? "#0e7c7b";
  // Gebruik API foto's als beschikbaar, anders ingebouwde galerij
  const galleryImages = apiPhotos.length > 0 ? apiPhotos : place.gallery;
  const isApiPhotos = photoSource === "google-places" || photoSource === "apify";

  // gerelateerd: zelfde type of buurt, gesorteerd op social score, exclusief huidige
  const related = places
    .filter((p) => p.id !== place.id && (p.type === place.type || p.neighborhood === place.neighborhood))
    .sort((a, b) => socialScore(b) - socialScore(a))
    .slice(0, 6);

  return (
    <div className="min-h-screen pb-28">
      {/* HERO — native detail page: full-bleed image met ken-burns zoom + layered gradient */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          src={place.coverImage}
          alt={place.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Triple gradient voor premium leesbaarheid + native top bar dim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/85" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

        <button
          type="button"
          onClick={goBack}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl transition-all hover:bg-white/25 active:scale-90 pt-safe-lg"
          aria-label="Terug"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
        </button>

        {/* type chip + favorite */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 pt-safe-lg">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur-xl">
            {place.type}
          </span>
          <button
            type="button"
            onClick={() => toggleFavorite(place.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl transition-all hover:bg-white/25 active:scale-90"
            aria-label={isFav ? "Verwijder favoriet" : "Voeg toe aan favorieten"}
          >
            <motion.span
              key={isFav ? "fav" : "nofav"}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              <Heart className={`h-[18px] w-[18px] transition-colors ${isFav ? "fill-accent text-accent" : "text-white"}`} strokeWidth={2.4} />
            </motion.span>
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {place.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-white">{place.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-white/85">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} /> {place.neighborhood}
              <span className="opacity-50">·</span>
              <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={2.4} /> {place.rating.toFixed(1)}
              <span className="opacity-50">·</span>
              <Bookmark className="h-3.5 w-3.5" strokeWidth={2.4} /> {place.saves > 999 ? `${(place.saves / 1000).toFixed(1)}k` : place.saves}
            </p>
          </motion.div>
        </div>
      </div>

      {/* SHEET CONTENT — overlapt de hero met een rounded top, native detail-feel (Airbnb) */}
      <div className="sheet-overlap rounded-t-[2rem] bg-background px-4 pb-2 pt-5">
        {/* VIBE LINE */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Vibe</p>
          <p className="mt-1.5 text-[18px] font-semibold leading-snug text-balance tracking-[-0.01em]">{place.vibeLine}</p>
        </motion.div>

        {/* INFO CHIPS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }} className="mt-5 grid grid-cols-2 gap-3">
          <InfoCard icon={<Users className="h-4 w-4" strokeWidth={2.2} />} label="Drukte">
            <div className="mt-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-3.5 w-3.5 ${n <= place.drukte ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
              {place.drukte <= 2 ? "Rustig" : place.drukte === 3 ? "Gemiddeld" : "Druk"}
            </p>
          </InfoCard>

          <InfoCard icon={<Clock className="h-4 w-4" strokeWidth={2.2} />} label="Beste tijd">
            <p className="mt-1 text-[15px] font-bold tracking-tight">{TIME_LABEL[place.besteTijd]}</p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {place.besteTijd === "Sunset" ? "Gouden uur" : place.besteTijd === "Morning" ? "Vroege ochtend" : "Avond / nacht"}
            </p>
          </InfoCard>
        </motion.div>

        {/* GALERIJ — echte foto's, geen label */}
        {galleryImages.length > 1 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="mt-6">
            {isApiPhotos && (
              <div className="mb-2 px-4">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                  {photoSource === "apify" ? "Apify" : "Google Places"}
                </span>
              </div>
            )}
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative h-44 w-32 shrink-0 overflow-hidden rounded-2xl shadow-premium ring-1 ring-black/5">
                  <img src={img} alt={`${place.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* OPENINGSTIJDEN — alleen als Google Places data beschikbaar is */}
        {apiDetails?.currentOpeningHours && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }} className="mt-6 px-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Openingstijden
            </h3>
            <div className="rounded-2xl bg-card p-3 shadow-premium ring-1 ring-black/5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${apiDetails.currentOpeningHours.openNow ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm font-semibold">
                  {apiDetails.currentOpeningHours.openNow ? "Nu open" : "Nu gesloten"}
                </span>
              </div>
              {apiDetails.currentOpeningHours.weekdayDescriptions && (
                <div className="space-y-0.5">
                  {apiDetails.currentOpeningHours.weekdayDescriptions.map((day, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{day}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* VOOR WIE */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }} className="mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Voor wie</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {place.voorWie.map((a) => (
              <span key={a} className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
                {AUDIENCE_LABEL[a]}
              </span>
            ))}
          </div>
        </motion.section>

        {/* TIPS */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="mt-6">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} /> Tips
          </h3>
          <ul className="mt-2.5 space-y-2">
            {place.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-card p-3.5 text-[14px] leading-snug shadow-premium ring-1 ring-black/[0.03]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* LOCATION */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }} className="mt-6">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} /> Locatie
          </h3>
          <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-premium ring-1 ring-black/[0.03]" style={{ background: `linear-gradient(135deg, ${color}14, transparent)` }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md" style={{ backgroundColor: color }}>
              <MapPin className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold tracking-tight">{place.name}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{place.neighborhood} · {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
            </div>
          </div>
        </motion.section>

        {/* RELATED */}
        {related.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }} className="mt-7">
            <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Meer ontdekken</h3>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5 -mx-4 px-4">
              {related.map((p, i) => (
                <div key={p.id} className="w-36 shrink-0">
                  <PlaceCard place={p} variant="wide" index={i} />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* STICKY MAPS BUTTON — native iOS floating action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md glass-strong px-4 pt-3 pb-safe hairline-t">
        <a
          href={place.mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[15px] font-bold tracking-tight text-primary-foreground shadow-float transition-transform active:scale-[0.97]"
        >
          <Navigation className="h-[18px] w-[18px]" strokeWidth={2.6} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-premium ring-1 ring-black/[0.03]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      {children}
    </div>
  );
}
