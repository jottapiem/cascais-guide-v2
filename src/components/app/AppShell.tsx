"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { BottomNav } from "./BottomNav";
import { HomeView } from "./HomeView";
import { ExploreView } from "./ExploreView";
import { CategoryView } from "./CategoryView";
import { DetailView } from "./DetailView";
import { SearchView } from "./SearchView";
import { MapView } from "./MapView";
import { PackingView } from "./PackingView";
import { FavoritesView } from "./FavoritesView";
import { RecommendedView } from "./RecommendedView";

export function AppShell() {
  const view = useAppStore((s) => s.view);
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const selectedCategory = useAppStore((s) => s.selectedCategory);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [view, selectedPlaceId, selectedCategory]);

  const showNav = view !== "detail" && view !== "search" && view !== "recommended";
  const motionKey =
    view === "detail"
      ? `detail-${selectedPlaceId}`
      : view === "category"
        ? `category-${selectedCategory}`
        : view;

  // SwiftUI-style transitie per view-type:
  // - detail/category/search: slide van rechts (push) + fade
  // - tab switches: pure cross-fade (0.18s)
  const isPushView = view === "detail" || view === "category" || view === "search" || view === "recommended";

  return (
    <div className="min-h-screen bg-neutral-200/60 dark:bg-neutral-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl-premium sm:border-x border-border/40">
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={motionKey}
              initial={isPushView ? { opacity: 0, x: 24 } : { opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={isPushView ? { opacity: 0, x: -12 } : { opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              {view === "home" && <HomeView />}
              {view === "explore" && <ExploreView />}
              {view === "category" && <CategoryView />}
              {view === "detail" && <DetailView />}
              {view === "search" && <SearchView />}
              {view === "map" && <MapView />}
              {view === "packing" && <PackingView />}
              {view === "favorites" && <FavoritesView />}
              {view === "recommended" && <RecommendedView />}
            </motion.div>
          </AnimatePresence>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
