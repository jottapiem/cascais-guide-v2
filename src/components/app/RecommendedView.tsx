"use client";

import { useMemo } from "react";
import { ChevronLeft, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { places } from "@/lib/places-data";
import { categories } from "@/lib/categories-data";
import { PlaceCard } from "./PlaceCard";
import type { CategoryId } from "@/lib/types";

// De originele aanrader-lijst — iconische Cascais plekken die je aan iedereen aanraadt
export const RECOMMENDED_IDS = [
  "guincho", "rainha", "tamariz", "bocainferno", "cabodaroca", "santamarta",
  "casaguia", "mercado", "marisco", "pastelaria", "casino", "festival",
  "marina", "parque", "promenade", "oldtown", "hike", "surf", "sintra",
  "forte", "miradouro", "brunch", "rooftop", "beachclub",
];

export function RecommendedView() {
  const goBack = useAppStore((s) => s.goBack);
  const goDetail = useAppStore((s) => s.goDetail);
  const recommendedCat = useAppStore((s) => s.recommendedCat);
  const setRecommendedCat = useAppStore((s) => s.setRecommendedCat);

  const recommended = useMemo(
    () => RECOMMENDED_IDS.map((id) => places.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    []
  );

  const filtered = useMemo(() => {
    if (recommendedCat === "all") return recommended;
    const cat = categories.find((c) => c.id === recommendedCat);
    if (!cat) return recommended;
    return recommended.filter(cat.filter);
  }, [recommended, recommendedCat]);

  const heroPlace = recommended[0];
  const chips: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "Alles" },
    ...categories.filter((c) => c.id !== "trending").map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className="min-h-screen pb-6">
      {/* HERO — homepage-stijl met naam van de collectie */}
      <section className="relative h-[34vh] min-h-[240px] w-full overflow-hidden">
        <img
          src={heroPlace?.coverImage}
          alt="Mijn aanraders"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

        {/* back button */}
        <button
          type="button"
          onClick={goBack}
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors hover:bg-white/40 active:scale-95 pt-safe mt-0"
          aria-label="Terug"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur"
          >
            <Star className="h-3 w-3 fill-white" /> Aanrader collectie
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-1.5 text-[28px] font-bold leading-tight text-white"
          >
            Mijn Cascais aanraders
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-0.5 flex items-center gap-1 text-xs text-white/80"
          >
            <MapPin className="h-3 w-3" /> {filtered.length} plekken die je aan iedereen moet laten zien
          </motion.p>
        </div>
      </section>

      {/* Categorie chips — sticky */}
      <div className="no-scrollbar sticky top-0 z-20 flex gap-1.5 overflow-x-auto border-b border-border/40 bg-background/85 px-4 py-2.5 backdrop-blur-xl">
        {chips.map((chip) => {
          const isActive = recommendedCat === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setRecommendedCat(chip.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Named cards grid — 3-koloms voor consistentie met explore */}
      <section className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((p, i) => (
            <PlaceCard key={p.id} place={p} variant="named" index={i} />
          ))}
        </div>
      </section>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <Star className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Geen aanraders in deze categorie</p>
        </div>
      )}

      <p className="mt-6 px-4 text-center text-xs text-muted-foreground">
        {filtered.length} aanraders · tap een plek voor details, tips en route
      </p>
    </div>
  );
}
