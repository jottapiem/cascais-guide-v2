"use client";

import { create } from "zustand";
import { defaultPackingItems } from "@/lib/packing-classifier";
import type { CategoryId, PackingItem, Situation } from "@/lib/types";

export type View =
  | "home"
  | "explore"
  | "category"
  | "detail"
  | "search"
  | "map"
  | "packing"
  | "favorites"
  | "recommended";

interface AppState {
  view: View;
  selectedPlaceId: string | null;
  selectedCategory: CategoryId | null;
  recommendedCat: CategoryId | "all";
  history: View[];
  packingItems: PackingItem[];
  favorites: Set<string>;
  savedCollections: Situation[];

  goHome: () => void;
  goExplore: () => void;
  goCategory: (id: CategoryId) => void;
  goDetail: (placeId: string) => void;
  goSearch: () => void;
  goMap: () => void;
  goPacking: () => void;
  goFavorites: () => void;
  goRecommended: () => void;
  setRecommendedCat: (c: CategoryId | "all") => void;
  goBack: () => void;

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  addPackingItem: (name: string, situations?: Situation[]) => void;
  addPackingItems: (items: { name: string; situations?: Situation[] }[]) => void;
  removePackingItem: (id: string) => void;
  updatePackingItem: (id: string, patch: Partial<PackingItem>) => void;
  togglePacked: (id: string) => void;
  setPackedAll: (packed: boolean) => void;
  clearPacking: () => void;

  acceptCollection: (s: Situation) => void;
}

function pushHistory(state: AppState): View[] {
  return [...state.history, state.view].slice(-30);
}

export const useAppStore = create<AppState>((set, get) => ({
  view: "home",
  selectedPlaceId: null,
  selectedCategory: null,
  recommendedCat: "all",
  history: [],
  packingItems: defaultPackingItems(),
  favorites: new Set<string>(),
  savedCollections: [],

  goHome: () => set({ view: "home", history: pushHistory(get()) }),
  goExplore: () => set({ view: "explore", history: pushHistory(get()) }),
  goCategory: (id) => set({ view: "category", selectedCategory: id, history: pushHistory(get()) }),
  goDetail: (placeId) => set({ view: "detail", selectedPlaceId: placeId, history: pushHistory(get()) }),
  goSearch: () => set({ view: "search", history: pushHistory(get()) }),
  goMap: () => set({ view: "map", history: pushHistory(get()) }),
  goPacking: () => set({ view: "packing", history: pushHistory(get()) }),
  goFavorites: () => set({ view: "favorites", history: pushHistory(get()) }),
  goRecommended: () => set({ view: "recommended", recommendedCat: "all", history: pushHistory(get()) }),
  setRecommendedCat: (c) => set({ recommendedCat: c }),
  goBack: () => {
    const hist = get().history;
    if (hist.length === 0) {
      set({ view: "home" });
      return;
    }
    const prev = hist[hist.length - 1];
    set({ view: prev, history: hist.slice(0, -1) });
  },

  toggleFavorite: (id) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { favorites: next };
    }),
  isFavorite: (id) => get().favorites.has(id),

  addPackingItem: (name, situations = []) =>
    set((state) => ({
      packingItems: [
        ...state.packingItems,
        { id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, situations, packed: false, category: "Essentials" },
      ],
    })),
  addPackingItems: (items) =>
    set((state) => ({
      packingItems: [
        ...state.packingItems,
        ...items.map((it) => ({
          id: `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: it.name,
          situations: it.situations ?? [],
          packed: false,
          category: "Essentials",
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
      packingItems: state.packingItems.map((it) => (it.id === id ? { ...it, packed: !it.packed } : it)),
    })),
  setPackedAll: (packed) =>
    set((state) => ({ packingItems: state.packingItems.map((it) => ({ ...it, packed })) })),
  clearPacking: () => set({ packingItems: [] }),

  acceptCollection: (s) =>
    set((state) =>
      state.savedCollections.includes(s) ? state : { savedCollections: [...state.savedCollections, s] }
    ),
}));
