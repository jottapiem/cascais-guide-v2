"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { BottomNav } from "./BottomNav";
import { HomeView } from "./HomeView";
import { ExploreView } from "./ExploreView";
import { CategoryView } from "./CategoryView";
import { DetailOverlay as DetailView } from "./DetailView";
import { TransitionLayer } from "./TransitionLayer";
import { SearchView } from "./SearchView";
import { MapView } from "./MapView";
import { PackingView } from "./PackingView";
import { FavoritesView } from "./FavoritesView";
import { RecommendedView } from "./RecommendedView";
import { TripsView } from "./TripsView";
import { ProfileView } from "./ProfileView";
import type { View } from "@/store/app-store";

const EASE_ENTER = [0.16, 1, 0.3, 1] as const;
const EASE_EXIT = [0.7, 0, 0.84, 0] as const;

const OVERLAY_VIEWS: View[] = ["detail", "search", "recommended"];

export function AppShell() {
  const view = useAppStore((s) => s.view);
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);
  const selectedSectionId = useAppStore((s) => s.selectedSectionId);
  const selectedCategory = useAppStore((s) => s.selectedCategory);

  const isOverlay = OVERLAY_VIEWS.includes(view);
  const lastBaseViewRef = useRef<View>("home");
  if (!isOverlay) lastBaseViewRef.current = view;
  const baseView = isOverlay ? lastBaseViewRef.current : view;

  const showNav = !isOverlay;
  const isDetail = view === "detail" && selectedPlaceId;

  return (
    <div className="min-h-screen bg-neutral-200/60 dark:bg-neutral-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl-premium sm:border-x border-border/40">
        {/* BASE VIEW */}
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={baseView === "category" ? `category-${selectedCategory}` : baseView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_ENTER }}
            >
              {baseView === "home" && <HomeView />}
              {baseView === "explore" && <ExploreView />}
              {baseView === "category" && <CategoryView />}
              {baseView === "map" && <MapView />}
              {baseView === "packing" && <PackingView />}
              {baseView === "favorites" && <FavoritesView />}
              {baseView === "trips" && <TripsView />}
              {baseView === "profile" && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>
        {showNav && <BottomNav />}

        {/* TRANSITION LAYER - Must be here to render the morphing image */}
        <TransitionLayer />

        {/* DETAIL OVERLAY */}
        <AnimatePresence mode="sync">
          {isDetail && (
            <DetailView
              key={`detail-${selectedPlaceId}`}
              placeId={selectedPlaceId}
              sectionId={selectedSectionId || "default"}
            />
          )}
        </AnimatePresence>

        {/* SEARCH / RECOMMENDED OVERLAYS */}
        <AnimatePresence>
          {view === "search" && (
            <motion.div key="search" className="fixed inset-0 z-90 mx-auto max-w-md overflow-y-auto bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE_ENTER }}>
              <SearchView />
            </motion.div>
          )}
          {view === "recommended" && (
            <motion.div key="recommended" className="fixed inset-0 z-90 mx-auto max-w-md overflow-y-auto bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE_ENTER }}>
              <RecommendedView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
