"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { exploreFeed, categories } from "@/lib/categories-data";
import { PlaceCard } from "./PlaceCard";
import type { CategoryId, Place } from "@/lib/types";

const PAGE = 18;
const MAX_CYCLES = 4;

// SwiftUI-style ease curve: smooth deceleration
const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

function shuffle<T>(arr: T[], salt: number): T[] {
  const a = [...arr];
  let s = salt;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Skeleton() {
  return (
    <div className="aspect-square w-full overflow-hidden bg-muted">
      <div className="h-full w-full animate-pulse bg-gradient-to-br from-muted to-muted/50" />
    </div>
  );
}

const ALL_FEED = exploreFeed();

export function ExploreView() {
  const goSearch = useAppStore((s) => s.goSearch);

  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const [cycle, setCycle] = useState(0);
  const [visible, setVisible] = useState<Place[]>(ALL_FEED.slice(0, PAGE));
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const filteredFeed = useMemo(() => {
    if (activeCat === "all") return ALL_FEED;
    const cat = categories.find((c) => c.id === activeCat);
    if (!cat) return ALL_FEED;
    return ALL_FEED.filter(cat.filter);
  }, [activeCat]);

  useEffect(() => {
    setCycle(0);
    setVisible(filteredFeed.slice(0, PAGE));
  }, [filteredFeed]);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setVisible((v) => {
        const shownThisCycle = v.length;
        if (shownThisCycle >= filteredFeed.length && cycle < MAX_CYCLES - 1) {
          const nextCycle = cycle + 1;
          const shuffled = shuffle(filteredFeed, nextCycle * 7 + 13);
          queueMicrotask(() => setCycle(nextCycle));
          return [...v, ...shuffled];
        }
        if (shownThisCycle >= filteredFeed.length) return v;
        return filteredFeed.slice(0, shownThisCycle + PAGE);
      });
      setLoading(false);
    }, 350);
  }, [filteredFeed, cycle, loading]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, loadMore]);

  const chips: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "Alles" },
    ...categories.filter((c) => c.id !== "trending").map((c) => ({ id: c.id, label: c.label })),
  ];

  const atMaxCycles = cycle >= MAX_CYCLES - 1 && visible.length >= filteredFeed.length * (cycle + 1);

  return (
    <div className="min-h-screen">
      {/* Sticky header met zoekknop — SwiftUI navigation bar style */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass pt-safe">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <h1 className="text-[22px] font-bold tracking-[-0.02em]">Explore</h1>
          <motion.button
            type="button"
            onClick={goSearch}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15, ease: SWIFT_EASE }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-foreground"
            aria-label="Zoeken"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </motion.button>
        </div>

        {/* Categorie chips — SwiftUI segmented control style */}
        <div className="no-scrollbar mx-auto flex max-w-md gap-1.5 overflow-x-auto px-4 pb-3">
          {chips.map((chip) => {
            const isActive = activeCat === chip.id;
            return (
              <motion.button
                key={chip.id}
                type="button"
                onClick={() => setActiveCat(chip.id)}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12, ease: SWIFT_EASE }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {chip.label}
              </motion.button>
            );
          })}
        </div>
      </header>

      {/* 3-koloms grid met uniforme vierkante tiles — geen masonry (geen glitch) */}
      <div className="grid grid-cols-3 gap-[2px]">
        {visible.map((p, i) => (
          <PlaceCard key={`${p.id}-${i}`} place={p} variant="masonry" index={i} sectionId="explore" />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={`sk-${i}`} />)}
      </div>

      {/* infinite scroll sentinel */}
      <div ref={sentinel} className="h-10" />
      {atMaxCycles && (
        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
          {filteredFeed.length} unieke plekken · scroll om meer te zien
        </p>
      )}
    </div>
  );
}
