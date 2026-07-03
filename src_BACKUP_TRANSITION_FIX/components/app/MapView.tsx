"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Navigation, X, Star, Locate } from "lucide-react";
import type L from "leaflet";
import { useAppStore } from "@/store/app-store";
import { places } from "@/lib/places-data";
import { categories } from "@/lib/categories-data";
import { TopBar } from "./TopBar";
import { distanceKm, travelMinutes, TYPE_COLOR, TYPE_LABEL, formatSaves } from "@/lib/map-helpers";
import type { CategoryId, Place } from "@/lib/types";

// Leaflet only works client-side
const MapCanvas = dynamic(
  () => import("./MapCanvas").then((m) => m.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

export function MapView() {
  const goDetail = useAppStore((s) => s.goDetail);
  const [satellite, setSatellite] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number; nonce: number } | null>(null);
  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const mapRef = useRef<L.Map | null>(null);

  // gefilterde plekken op categorie
  const visiblePlaces = useMemo(() => {
    if (activeCat === "all") return places;
    const cat = categories.find((c) => c.id === activeCat);
    if (!cat) return places;
    return places.filter(cat.filter);
  }, [activeCat]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setUserPos([38.6979, -9.4215]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        mapRef.current?.flyTo(p, 14, { duration: 1.2 });
      },
      () => {
        setUserPos([38.6979, -9.4215]);
        mapRef.current?.flyTo([38.6979, -9.4215], 13, { duration: 1.2 });
      }
    );
  }, []);

  const distToSelected = selected && userPos ? distanceKm(userPos, [selected.lat, selected.lng]) : null;
  const travelMin = distToSelected != null ? travelMinutes(distToSelected) : null;

  // categorie chips
  const chips: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "Alles" },
    ...categories.filter((c) => c.id !== "trending").map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className="relative min-h-screen pb-6">
      <TopBar title="Kaart" subtitle={`${visiblePlaces.length} plekken`} showBack={false} />

      {/* Categorie filter chips — sticky onder topbar, hoogste z-index */}
      <div className="no-scrollbar sticky top-[57px] z-[1000] flex gap-1.5 overflow-x-auto border-b border-border/40 bg-background/95 px-4 py-2.5 backdrop-blur-xl">
        {chips.map((chip) => {
          const isActive = activeCat === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveCat(chip.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
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

      {/* Map — lage z-index, blijft onder de chips */}
      <div className="relative mx-4 mt-3 h-[55vh] min-h-[340px] overflow-hidden rounded-3xl shadow-premium ring-1 ring-border/40 z-0">
        <MapCanvas
          satellite={satellite}
          userPos={userPos}
          onSelect={setSelected}
          flyTo={flyTo}
          onMapReady={(m) => { mapRef.current = m; }}
          filterPlaces={visiblePlaces}
        />

        {/* Layer toggle */}
        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="absolute right-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-premium backdrop-blur transition-colors active:scale-95"
        >
          <Layers className="h-3.5 w-3.5" /> {satellite ? "Satelliet" : "Kaart"}
        </button>

        {/* Locate */}
        <button
          type="button"
          onClick={handleLocate}
          className="absolute right-3 bottom-3 z-[500] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-premium backdrop-blur transition-colors active:scale-95"
          aria-label="Mijn locatie"
        >
          <Locate className="h-5 w-5" />
        </button>
      </div>

      {/* Quick list — gefilterd */}
      <div className="mt-5 px-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Zichtbare plekken ({visiblePlaces.length})
        </h3>
        <div className="space-y-1.5">
          {visiblePlaces.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelected(p);
                setFlyTo({ lat: p.lat, lng: p.lng, zoom: 15, nonce: Date.now() });
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-card p-2.5 text-left shadow-premium transition-colors hover:bg-secondary/50 active:scale-[0.99]"
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: TYPE_COLOR[p.type] ?? "#0e7c7b" }} />
              <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-accent text-accent" /> {p.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground">{TYPE_LABEL[p.type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected bottom sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[600] mx-auto max-w-md rounded-t-3xl border-t border-border/50 glass-dark pb-safe"
          >
            <div className="flex items-stretch gap-3 p-3">
              <button
                type="button"
                onClick={() => goDetail(selected.id)}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl"
              >
                <img src={selected.coverImage} alt={selected.name} className="h-full w-full object-cover" />
              </button>
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[selected.type] }} />
                  <p className="truncate text-sm font-bold">{selected.name}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {TYPE_LABEL[selected.type]} · {selected.neighborhood}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {selected.rating.toFixed(1)}
                  <span className="mx-1">·</span> {formatSaves(selected.saves)} saves
                </p>
                {distToSelected != null && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                    <Navigation className="h-3 w-3" /> {distToSelected.toFixed(1)} km · ~{travelMin} min
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => goDetail(selected.id)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground active:scale-95"
                  >
                    Details
                  </button>
                  <a
                    href={selected.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground active:scale-95"
                  >
                    <Navigation className="h-3 w-3" /> Route
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="self-start rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                aria-label="Sluiten"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
