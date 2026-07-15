"use client";

import { Calendar, Compass } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { places } from "@/lib/places-data";
import { MorphCard } from "./MorphCard";

export function TripsView() {
  const goExplore = useAppStore((s) => s.goExplore);
  const favorites = useAppStore((s) => s.favorites);

  const favPlaces = places.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 glass-strong pt-safe-lg">
        <div className="px-4 py-4">
          <h1 className="text-[24px] font-bold tracking-tight">Trips</h1>
          <p className="text-[13px] text-muted-foreground">Jouw opgeslagen plekken</p>
        </div>
      </header>

      <div className="px-4 pt-4">
        {favPlaces.length > 0 ? (
          <>
            <h2 className="mb-3 text-[16px] font-bold">Wishlist ({favPlaces.length})</h2>
            <div className="space-y-3">
              {favPlaces.map((place, i) => (
                <MorphCard key={place.id} place={place} variant="row" index={i} sectionId="trips" showFav={false} />
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-secondary/50 p-4 text-center">
              <p className="text-[13px] text-muted-foreground">Meer plekken ontdekken?</p>
              <button onClick={goExplore} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground">
                <Compass className="h-4 w-4" /> Explore Cascais
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[16px] font-semibold">Nog geen trips gepland</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Sla plekken op met het hartje om ze hier te zien.</p>
            </div>
            <button onClick={goExplore} className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground">
              <Compass className="h-4 w-4" /> Ontdek plekken
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
