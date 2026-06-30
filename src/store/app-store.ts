"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

/** Root tabs — navigeren hiernaar updaten ook rootView */
const ROOT_VIEWS: View[] = ["home", "explore", "map", "packing", "favorites"];

interface AppState {
  view: View;
  /** De actieve root-tab (wordt bijgehouden voor BottomNav-highlight) */
  rootView: View;
  selectedPlaceId: string | null;
  selectedCategory: CategoryId | null;
  recommendedCat: CategoryId | "all";
  history: View[];
  packingItems: PackingItem[];
  /** String-array i.p.v. Set — direct JSON-serialiseerbaar voor persistence */
  favorites: string[];
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

function uid(): string {
  return `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "home",
      rootView: "home",
      selectedPlaceId: null,
      selectedCategory: null,
      recommendedCat: "all",
      history: [],
      packingItems: defaultPackingItems(),
      favorites: [],
      savedCollections: [],

      // ── Root navigatie (updaten rootView) ──────────────────────────────
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

      // ── Push navigatie (rootView blijft ongewijzigd) ────────────────────
      goCategory: (id) =>
        set({ view: "category", selectedCategory: id, history: pushHistory(get()) }),
      goDetail: (placeId) =>
        set({ view: "detail", selectedPlaceId: placeId, history: pushHistory(get()) }),
      goSearch: () =>
        set({ view: "search", history: pushHistory(get()) }),
      goRecommended: () =>
        set({ view: "recommended", recommendedCat: "all", history: pushHistory(get()) }),
      setRecommendedCat: (c) => set({ recommendedCat: c }),

      goBack: () => {
        const hist = get().history;
        if (hist.length === 0) {
          set({ view: "home", rootView: "home" });
          return;
        }
        const prev = hist[hist.length - 1];
        // Als we teruggaan naar een root view, sync rootView ook
        const nextRoot = ROOT_VIEWS.includes(prev) ? prev : get().rootView;
        set({ view: prev, rootView: nextRoot, history: hist.slice(0, -1) });
      },

      // ── Favorieten ──────────────────────────────────────────────────────
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      // ── Packing list ────────────────────────────────────────────────────
      addPackingItem: (name, situations = []) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            {
              id: uid(),
              name,
              situations,
              packed: false,
              category: "Essentials" as const,
            },
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
              category: "Essentials" as const,
            })),
          ],
        })),

      removePackingItem: (id) =>
        set((state) => ({
          packingItems: state.packingItems.filter((it) => it.id !== id),
        })),

      updatePackingItem: (id, patch) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id ? { ...it, ...patch } : it
          ),
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
    }),
    {
      name: "cascais-guide-v2-store",
      storage: createJSONStorage(() => localStorage),
      // Alleen persistente data opslaan — UI-state (view, history) reset bewust
      partialize: (state) => ({
        favorites: state.favorites,
        packingItems: state.packingItems,
        savedCollections: state.savedCollections,
      }),
    }
  )
);
