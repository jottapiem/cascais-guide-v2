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
import { TripsView } from "./TripsView";
import { ProfileView } from "./ProfileView";

const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

export function AppShell() {
  const view = useAppStore((s) => s.view);
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const selectedCategory = useAppStore((s) => s.selectedCategory);

  useEffect(() => { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" }); }, [view, selectedPlaceId, selectedCategory]);

  const showNav = view !== "detail" && view !== "search" && view !== "recommended";
  const motionKey = view === "detail" ? `detail-${selectedPlaceId}` : view === "category" ? `category-${selectedCategory}` : view;
  const isPushView = view === "detail" || view === "category" || view === "search" || view === "recommended";

  return (
    <div className="min-h-screen bg-neutral-200/60 dark:bg-neutral-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl-premium sm:border-x border-border/40">
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={motionKey} initial={{ opacity: 0, scale: isPushView ? 0.98 : 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: isPushView ? 0.98 : 1 }} transition={{ duration: 0.3, ease: SWIFT_EASE }}>
              {view === "home" && <HomeView />}
              {view === "explore" && <ExploreView />}
              {view === "category" && <CategoryView />}
              {view === "detail" && <DetailView />}
              {view === "search" && <SearchView />}
              {view === "map" && <MapView />}
              {view === "packing" && <PackingView />}
              {view === "favorites" && <FavoritesView />}
              {view === "recommended" && <RecommendedView />}
              {view === "trips" && <TripsView />}
              {view === "profile" && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
