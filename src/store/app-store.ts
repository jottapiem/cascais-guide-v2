"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { defaultPackingItems, classifyItem } from "@/lib/packing-classifier";
import type { CategoryId, PackingItem, PackingCategory, Situation } from "@/lib/types";

export type View =
  | "home"
  | "explore"
  | "category"
  | "detail"
  | "search"
  | "map"
  | "packing"
  | "favorites"
  | "recommended"
  | "trips"
  | "profile";

const ROOT_VIEWS: View[] = ["home", "explore", "map", "packing", "favorites", "trips", "profile"];

interface AppState {
  view: View;
  rootView: View;
  selectedPlaceId: string | null;
  selectedSectionId: string | null;
  morphPlace: { id: string; coverImage: string; origin: { left: number; top: number; width: number; height: number } } | null;
  morphPhase: "idle" | "forward" | "reverse";
  selectedCategory: CategoryId | null;
  recommendedCat: CategoryId | "all";
  history: View[];
  packingItems: PackingItem[];
  favorites: string[];
  savedCollections: Situation[];

  goHome: () => void;
  goExplore: () => void;
  goCategory: (id: CategoryId) => void;
  goDetail: (placeId: string, sectionId?: string | null) => void;
  goSearch: () => void;
  goMap: () => void;
  goPacking: () => void;
  goFavorites: () => void;
  goRecommended: () => void;
  goTrips: () => void;
  goProfile: () => void;
  setRecommendedCat: (c: CategoryId | "all") => void;
  goBack: () => void;
  setMorphPlace: (place: { id: string; coverImage: string; origin: { left: number; top: number; width: number; height: number } }) => void;
  setMorphPhase: (phase: "idle" | "forward" | "reverse") => void;
  clearMorph: () => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  addPackingItem: (name: string, situations?: Situation[], category?: PackingCategory) => void;
  addPackingItems: (items: { name: string; situations?: Situation[]; category?: PackingCategory }[]) => void;
  removePackingItem: (id: string) => void;
  updatePackingItem: (id: string, patch: Partial<PackingItem>) => void;
  togglePacked: (id: string) => void;
  setPackedAll: (packed: boolean) => void;
  // Nieuw (Fase 1.3):
  togglePackedCount: (id: string, delta: number) => void;
  setQty: (id: string, qty: number) => void;
  setPriority: (id: string, priority: Priority) => void;
  clearPacking: () => void;

  acceptCollection: (s: Situation) => void;
}

function pushHistory(state: AppState): View[] {
  return [...state.history, state.view].slice(-30);
}

function uid(): string {
  return `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "home",
      rootView: "home",
      selectedPlaceId: null,
      selectedSectionId: null,
  morphPlace: null,
  morphPhase: "idle",
      selectedCategory: null,
      recommendedCat: "all",
      history: [],
      packingItems: defaultPackingItems(),
      favorites: [],
      savedCollections: [],

      goHome: () =>
        set({ view: "home", rootView: "home", history: pushHistory(get()) }),
      goExplore: () =>
        set({ view: "explore", rootView: "explore", history: pushHistory(get()) }),
      goMap: () =>
        set({ view: "map", rootView: "map", history: pushHistory(get()) }),
      goPacking: () =>
        set({ view: "packing", rootView: "packing", history: pushHistory(get()) }),
      goFavorites: () =>
        set({ view: "favorites", rootView: "favorites", history: pushHistory(get()) }),

      goCategory: (id) =>
        set({ view: "category", selectedCategory: id, history: pushHistory(get()) }),
      goDetail: (placeId, sectionId = null) =>
        set({ view: "detail", selectedPlaceId: placeId, selectedSectionId: sectionId, history: pushHistory(get()) }),
      goSearch: () =>
        set({ view: "search", history: pushHistory(get()) }),
      goRecommended: () =>
        set({ view: "recommended", recommendedCat: "all", history: pushHistory(get()) }),
      goTrips: () =>
        set({ view: "trips", rootView: "trips", history: pushHistory(get()) }),
      goProfile: () =>
        set({ view: "profile", rootView: "profile", history: pushHistory(get()) }),
      setRecommendedCat: (c) => set({ recommendedCat: c }),

      goBack: () => {
        const hist = get().history;
        if (hist.length === 0) {
          set({ view: "home", rootView: "home" });
          return;
        }
        const prev = hist[hist.length - 1];
        const nextRoot = ROOT_VIEWS.includes(prev) ? prev : get().rootView;
        set({ view: prev, rootView: nextRoot, history: hist.slice(0, -1) });
      },

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      addPackingItem: (name, situations = [], category?) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            { id: uid(), name, situations, packed: false, category: category ?? classifyItem(name) },
          ],
        })),

      addPackingItems: (items) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            ...items.map((it) => ({
              id: uid(),
              name: it.name,
              situations: it.situations ?? [],
              packed: false,
              category: it.category ?? classifyItem(it.name),
            })),
          ],
        })),

      removePackingItem: (id) =>
        set((state) => ({ packingItems: state.packingItems.filter((it) => it.id !== id) })),

      updatePackingItem: (id, patch) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),

      togglePacked: (id) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id ? { ...it, packed: !it.packed } : it
          ),
        })),

      setPackedAll: (packed) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) => ({ ...it, packed })),
        })),

      clearPacking: () => set({ packingItems: [] }),

      acceptCollection: (s) =>
        set((state) =>
          state.savedCollections.includes(s)
            ? state
            : { savedCollections: [...state.savedCollections, s] }
        ),

      setMorphPlace: (place) => set({ morphPlace: place, morphPhase: "forward" }),
      setMorphPhase: (phase) => set({ morphPhase: phase }),
      clearMorph: () => set({ morphPlace: null, morphPhase: "idle" }),
    }),
    {
      name: "cascais-guide-v2-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        packingItems: state.packingItems,
        savedCollections: state.savedCollections,
      }),
    }
  )
);
