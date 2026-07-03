"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { defaultPackingItems, classifyItem } from "@/lib/packing-classifier";
import { DEFAULT_BAGS, DEFAULT_PEOPLE } from "@/lib/bags-data";
import type {
  CategoryId, PackingItem, PackingCategory, Priority, Situation,
  Bag, Person, BagTemplate,
} from "@/lib/types";

export type View = "home" | "explore" | "category" | "detail" | "search" | "map" | "packing" | "favorites" | "recommended" | "trips" | "profile";

export type PackingSubView = "bags" | "bag-detail" | "smart-lists" | "smart-list-detail" | "templates";

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
  bags: Bag[];
  people: Person[];
  bagTemplates: BagTemplate[];
  favorites: string[];
  savedCollections: Situation[];
  packingSubView: PackingSubView;
  selectedBagId: string | null;
  selectedSmartListId: string | null;

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

  addPackingItem: (name: string, situations?: Situation[], category?: PackingCategory, bagId?: string | null) => void;
  addPackingItems: (items: { name: string; situations?: Situation[]; category?: PackingCategory; bagId?: string | null }[]) => void;
  removePackingItem: (id: string) => void;
  updatePackingItem: (id: string, patch: Partial<PackingItem>) => void;
  togglePacked: (id: string) => void;
  togglePackedCount: (id: string, delta: number) => void;
  setQty: (id: string, qty: number) => void;
  setPriority: (id: string, priority: Priority) => void;
  setPackedAll: (packed: boolean) => void;
  moveItemToBag: (itemId: string, bagId: string | null) => void;
  assignItemToPerson: (itemId: string, personId: string | null) => void;
  clearPacking: () => void;

  addBag: (bag: Omit<Bag, "id" | "createdAt" | "lastEditedAt">) => string;
  updateBag: (id: string, patch: Partial<Bag>) => void;
  removeBag: (id: string, options?: { moveItemsTo?: string | null }) => void;
  duplicateBag: (id: string, newTripTag?: string) => string;
  togglePinBag: (id: string) => void;

  addBagTemplate: (template: Omit<BagTemplate, "id" | "createdAt">) => string;
  removeBagTemplate: (id: string) => void;
  instantiateBagFromTemplate: (templateId: string) => string | null;

  addPerson: (name: string, avatar?: string, color?: string) => string;
  removePerson: (id: string) => void;

  acceptCollection: (s: Situation) => void;
}

function pushHistory(state: AppState): View[] {
  return [...state.history, state.view].slice(-30);
}
function uid(): string { return `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function bagId(): string { return `bag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function personIdGen(): string { return `person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function templateIdGen(): string { return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

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
      packingItems: defaultPackingItems().map((it) => ({
        ...it,
        bagId: "default-carryon" as string | null,
        needToBuy: false,
        trips: [] as string[],
        tags: [] as string[],
        updatedAt: Date.now(),
      })),
      bags: DEFAULT_BAGS,
      people: DEFAULT_PEOPLE,
      bagTemplates: [],
      favorites: [],
      savedCollections: [],
      packingSubView: "bags",
      selectedBagId: null,
      selectedSmartListId: null,

      goHome: () => set({ view: "home", rootView: "home", history: pushHistory(get()) }),
      goExplore: () => set({ view: "explore", rootView: "explore", history: pushHistory(get()) }),
      goMap: () => set({ view: "map", rootView: "map", history: pushHistory(get()) }),
      goPacking: () => set({ view: "packing", rootView: "packing", packingSubView: "bags", history: pushHistory(get()) }),
      goFavorites: () => set({ view: "favorites", rootView: "favorites", history: pushHistory(get()) }),
      goCategory: (id) => set({ view: "category", selectedCategory: id, history: pushHistory(get()) }),
      goDetail: (placeId, sectionId = null) => set({ view: "detail", selectedPlaceId: placeId, selectedSectionId: sectionId, history: pushHistory(get()) }),
      goSearch: () => set({ view: "search", history: pushHistory(get()) }),
      goRecommended: () => set({ view: "recommended", recommendedCat: "all", history: pushHistory(get()) }),
      goTrips: () => set({ view: "trips", rootView: "trips", history: pushHistory(get()) }),
      goProfile: () => set({ view: "profile", rootView: "profile", history: pushHistory(get()) }),
      setRecommendedCat: (c) => set({ recommendedCat: c }),
      goBack: () => {
        const hist = get().history;
        if (hist.length === 0) { set({ view: "home", rootView: "home" }); return; }
        const prev = hist[hist.length - 1];
        const nextRoot = ROOT_VIEWS.includes(prev) ? prev : get().rootView;
        set({ view: prev, rootView: nextRoot, history: hist.slice(0, -1) });
      },
      setMorphPlace: (place) => set({ morphPlace: place, morphPhase: "forward" }),
      setMorphPhase: (phase) => set({ morphPhase: phase }),
      clearMorph: () => set({ morphPlace: null, morphPhase: "idle" }),

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      addPackingItem: (name: string, situations: Situation[] = [], category?: PackingCategory, bagId: string | null = null) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            {
              id: uid(), name, situations,
              category: category ?? classifyItem(name),
              qty: 1, packedCount: 0, priority: "nice" as Priority,
              source: "manual" as const, createdAt: Date.now(),
              bagId, needToBuy: false, trips: [], tags: [], updatedAt: Date.now(),
            },
          ],
        })),

      addPackingItems: (items) =>
        set((state) => ({
          packingItems: [
            ...state.packingItems,
            ...items.map((it) => ({
              id: uid(), name: it.name,
              situations: it.situations ?? [],
              category: it.category ?? classifyItem(it.name),
              qty: 1, packedCount: 0, priority: "nice" as Priority,
              source: "import" as const, createdAt: Date.now(),
              bagId: it.bagId ?? null, needToBuy: false, trips: [], tags: [], updatedAt: Date.now(),
            })),
          ],
        })),

      removePackingItem: (id) =>
        set((state) => ({ packingItems: state.packingItems.filter((it) => it.id !== id) })),

      updatePackingItem: (id, patch) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it
          ),
        })),

      togglePacked: (id) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id
              ? { ...it, packedCount: it.packedCount >= it.qty ? 0 : it.qty, updatedAt: Date.now() }
              : it
          ),
        })),

      togglePackedCount: (id, delta) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id
              ? { ...it, packedCount: Math.max(0, Math.min(it.qty, it.packedCount + delta)), updatedAt: Date.now() }
              : it
          ),
        })),

      setQty: (id, qty) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id
              ? { ...it, qty: Math.max(1, qty), packedCount: Math.min(it.packedCount, Math.max(1, qty)), updatedAt: Date.now() }
              : it
          ),
        })),

      setPriority: (id, priority) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === id ? { ...it, priority, updatedAt: Date.now() } : it
          ),
        })),

      setPackedAll: (packed) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) => ({
            ...it, packedCount: packed ? it.qty : 0, updatedAt: Date.now(),
          })),
        })),

      moveItemToBag: (itemId, bagId) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === itemId ? { ...it, bagId, updatedAt: Date.now() } : it
          ),
        })),

      assignItemToPerson: (itemId, personId) =>
        set((state) => ({
          packingItems: state.packingItems.map((it) =>
            it.id === itemId ? { ...it, personId: personId ?? undefined, updatedAt: Date.now() } : it
          ),
        })),

      clearPacking: () => set({ packingItems: [] }),

      addBag: (bagData) => {
        const id = bagId();
        const now = Date.now();
        set((state) => ({
          bags: [...state.bags, { ...bagData, id, createdAt: now, lastEditedAt: now }],
        }));
        return id;
      },

      updateBag: (id, patch) =>
        set((state) => ({
          bags: state.bags.map((b) => (b.id === id ? { ...b, ...patch, lastEditedAt: Date.now() } : b)),
        })),

      removeBag: (id, options) =>
        set((state) => {
          const targetBagId = options?.moveItemsTo ?? null;
          return {
            bags: state.bags.filter((b) => b.id !== id),
            packingItems: state.packingItems.map((it) =>
              it.bagId === id ? { ...it, bagId: targetBagId, updatedAt: Date.now() } : it
            ),
          };
        }),

      duplicateBag: (id, newTripTag) => {
        const sourceBag = get().bags.find((b) => b.id === id);
        if (!sourceBag) return "";
        const newId = bagId();
        const now = Date.now();
        set((state) => {
          const sourceItems = state.packingItems.filter((it) => it.bagId === id);
          const newItems = sourceItems.map((it) => ({
            ...it,
            id: uid(),
            bagId: newId,
            packedCount: 0,
            trips: newTripTag ? [newTripTag] : it.trips,
            createdAt: now,
            updatedAt: now,
          }));
          return {
            bags: [...state.bags, {
              ...sourceBag, id: newId, name: `${sourceBag.name} (kopie)`,
              pinned: false, trips: newTripTag ? [newTripTag] : sourceBag.trips,
              createdAt: now, lastEditedAt: now,
            }],
            packingItems: [...state.packingItems, ...newItems],
          };
        });
        return newId;
      },

      togglePinBag: (id) =>
        set((state) => ({
          bags: state.bags.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b)),
        })),

      addBagTemplate: (templateData) => {
        const id = templateIdGen();
        set((state) => ({
          bagTemplates: [...state.bagTemplates, { ...templateData, id, createdAt: Date.now() }],
        }));
        return id;
      },

      removeBagTemplate: (id) =>
        set((state) => ({ bagTemplates: state.bagTemplates.filter((t) => t.id !== id) })),

      instantiateBagFromTemplate: (templateId) => {
        const STARTER_TEMPLATES = require("@/lib/bags-data").STARTER_BAG_TEMPLATES as BagTemplate[];
        const template = get().bagTemplates.find((t) => t.id === templateId) ?? STARTER_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return null;
        const newBagId = bagId();
        const now = Date.now();
        set((state) => {
          const newBag: Bag = {
            id: newBagId, name: template.name, icon: template.icon, color: template.color,
            type: template.type, weightLimit: template.weightLimit, weightUnit: "g",
            categories: [...template.categories], stapleItemIds: [], trips: [],
            pinned: false, lastEditedAt: now, createdAt: now,
          };
          const newItems: PackingItem[] = template.items.map((it, i) => ({
            id: uid(), name: it.name, category: classifyItem(it.name),
            situations: it.situations ?? [], qty: it.qty ?? 1, packedCount: 0,
            priority: it.priority ?? ("nice" as Priority), source: "manual" as const,
            createdAt: now - i * 10, bagId: newBagId, needToBuy: false,
            trips: [], tags: [], updatedAt: now,
          }));
          return { bags: [...state.bags, newBag], packingItems: [...state.packingItems, ...newItems] };
        });
        return newBagId;
      },

      addPerson: (name, avatar = "🧑", color = "#0e7c7b") => {
        const id = personIdGen();
        set((state) => ({
          people: [...state.people, { id, name, avatar, color, createdAt: Date.now() }],
        }));
        return id;
      },

      removePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
          packingItems: state.packingItems.map((it) =>
            it.personId === id ? { ...it, personId: undefined, updatedAt: Date.now() } : it
          ),
        })),

      acceptCollection: (s) =>
        set((state) =>
          state.savedCollections.includes(s)
            ? {}
            : { savedCollections: [...state.savedCollections, s] }
        ),
    }),
    {
      name: "cascais-guide-v2-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const s = (persistedState ?? {}) as {
          packingItems?: any[];
          bags?: any[];
          people?: any[];
          bagTemplates?: any[];
          favorites?: string[];
          savedCollections?: Situation[];
        };
        if (version < 2 && Array.isArray(s.packingItems)) {
          s.packingItems = s.packingItems.map((it: any) => ({
            ...it,
            packedCount: it.packedCount ?? (it.packed ? 1 : 0),
            qty: it.qty ?? 1,
            priority: it.priority ?? "nice",
            source: it.source ?? "manual",
            createdAt: it.createdAt ?? Date.now(),
            bagId: it.bagId ?? null,
            weight: it.weight,
            value: it.value,
            personId: it.personId,
            needToBuy: it.needToBuy ?? false,
            trips: it.trips ?? [],
            tags: it.tags ?? [],
            lastUsedAt: it.lastUsedAt,
            updatedAt: it.updatedAt ?? Date.now(),
          }));
        }
        if (!Array.isArray(s.bags) || s.bags.length === 0) s.bags = DEFAULT_BAGS;
        if (!Array.isArray(s.people) || s.people.length === 0) s.people = DEFAULT_PEOPLE;
        if (!Array.isArray(s.bagTemplates)) s.bagTemplates = [];
        return s;
      },
      partialize: (state) => ({
        favorites: state.favorites,
        packingItems: state.packingItems,
        bags: state.bags,
        people: state.people,
        bagTemplates: state.bagTemplates,
        savedCollections: state.savedCollections,
      }),
    }
  )
);
