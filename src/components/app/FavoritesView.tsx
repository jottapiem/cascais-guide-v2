"use client";

import { Heart, ChevronLeft, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { places } from "@/lib/places-data";
import { RECOMMENDED_IDS } from "./RecommendedView";
import { MorphCard } from "./MorphCard";

export function FavoritesView() {
  const goBack = useAppStore((s) => s.goBack);
  const goExplore = useAppStore((s) => s.goExplore);
  const goRecommended = useAppStore((s) => s.goRecommended);
  const favorites = useAppStore((s) => s.favorites);

  const favPlaces = places.filter((p) => favorites.includes(p.id));

  const recommendedPlaces = RECOMMENDED_IDS.map((id) =>
    places.find((p) => p.id === id)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p)).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass pt-safe">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 transition-colors hover:bg-secondary active:scale-95"
            aria-label="Terug"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
            <Heart className="h-4 w-4 fill-white" />
          </span>
          <div className="min-w-0 flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              className="truncate text-[17px] font-bold tracking-tight"
            >
              Favorieten
            </motion.h1>
            <p className="text-[11px] text-muted-foreground">
              {favPlaces.length} opgeslagen{favPlaces.length === 1 ? " plek" : " plekken"}
            </p>
          </div>
        </div>
      </header>

      {/* Aanbevolen collectie banner */}
      <section className="px-4 pt-4">
        <motion.button
          type="button"
          onClick={goRecommended}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full overflow-hidden rounded-3xl text-left shadow-premium"
        >
          <div className="relative h-40 w-full">
            <div className="absolute inset-0 grid grid-cols-3 gap-[2px]">
              {recommendedPlaces.map((p) => (
                <img
                  key={p.id}
                  src={p.exploreImage ?? p.coverImage}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <Star className="h-3 w-3 fill-white" /> Aanrader collectie
            </span>
            <p className="mt-2 text-xl font-bold text-white">Mijn Cascais aanraders</p>
            <p className="text-xs text-white/80">
              {RECOMMENDED_IDS.length} plekken die je aan iedereen moet laten zien
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white">
              Bekijk alles <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </motion.button>
      </section>

      {/* Opgeslagen plekken */}
      <section className="mt-6">
        <h2 className="mb-2 px-4 text-[15px] font-bold tracking-tight">
          Opgeslagen plekken
        </h2>

        {favPlaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center justify-center gap-3 px-8 py-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Nog geen opgeslagen plekken</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tik het hartje op een plek om het hier te bewaren.
              </p>
            </div>
            <button
              type="button"
              onClick={goExplore}
              className="mt-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 active:scale-95"
            >
              Ontdek plekken
            </button>
          </motion.div>
        ) : (
          /* Uniforme 3-koloms grid — zelfde als ExploreView en CategoryView */
          <div className="grid grid-cols-3 gap-[2px]">
            {favPlaces.map((p, i) => (
              <MorphCard key={p.id} place={p} variant="masonry" index={i} sectionId="favorites" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
