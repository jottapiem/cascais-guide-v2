"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";
import { haptics } from "@/lib/premium";
import type { PackingItem } from "@/lib/types";

const PRIORITY_COLOR: Record<string, string> = {
  must: "#dc2626", nice: "#0e7c7b", optional: "#94a3b8",
};

const isPacked = (it: PackingItem) => it.packedCount >= it.qty;

export function SmartListDetailView() {
  const smartListId = useAppStore((s) => s.selectedSmartListId);
  const items = useAppStore((s) => s.packingItems);
  const bags = useAppStore((s) => s.bags);
  const togglePacked = useAppStore((s) => s.togglePacked);
  const togglePackedCount = useAppStore((s) => s.togglePackedCount);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const setPackingSubView = useAppStore((s) => s.setPackingSubView);
  const setSelectedBagId = useAppStore((s) => s.setSelectedBagId);

  const config = useMemo(() => {
    switch (smartListId) {
      case "unpacked":
        return { label: "Niet ingepakt", icon: "📦", filter: (it: PackingItem) => !isPacked(it) };
      case "need-to-buy":
        return { label: "Nog kopen", icon: "🛒", filter: (it: PackingItem) => Boolean(it.needToBuy) };
      case "overweight":
        return { label: "Overgewicht", icon: "⚠️", filter: () => false };
      case "all-items":
        return { label: "Alle items", icon: "📋", filter: () => true };
      default:
        return { label: "Onbekend", icon: "❓", filter: () => false };
    }
  }, [smartListId]);

  const filteredItems = useMemo(() => items.filter(config.filter), [items, config]);

  const overweightBags = useMemo(() => {
    if (smartListId !== "overweight") return [];
    return bags.filter((b) => {
      if (!b.weightLimit) return false;
      const weight = items.filter((it) => it.bagId === b.id).reduce((s, it) => s + (it.weight ?? 0) * it.qty, 0);
      return weight > b.weightLimit;
    });
  }, [smartListId, bags, items]);

  const handleBagClick = (bagId: string) => {
    haptics.selection();
    setSelectedBagId(bagId);
    setPackingSubView("bag-detail");
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/40 bg-background/95 px-4 py-3 pt-safe-lg backdrop-blur-xl">
        <button
          type="button"
          onClick={() => { haptics.selection(); setPackingSubView("smart-lists"); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 transition-transform active:scale-90"
          aria-label="Terug"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight">{config.label}</p>
            <p className="text-[11px] text-muted-foreground">
              {smartListId === "overweight"
                ? `${overweightBags.length} ${overweightBags.length === 1 ? "tas" : "tassen"}`
                : `${filteredItems.length} ${filteredItems.length === 1 ? "item" : "items"}`}
            </p>
          </div>
        </div>
      </div>

      {smartListId === "overweight" && (
        <div className="mt-4 space-y-2 px-4">
          {overweightBags.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Geen tassen met overgewicht 🎉</p>
          ) : (
            overweightBags.map((bag, i) => {
              const weight = items.filter((it) => it.bagId === bag.id).reduce((s, it) => s + (it.weight ?? 0) * it.qty, 0);
              const overBy = weight - (bag.weightLimit ?? 0);
              return (
                <motion.button
                  key={bag.id}
                  type="button"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.04, 0.3) }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleBagClick(bag.id)}
                  className="flex w-full items-center gap-3 rounded-[16px] border border-destructive/30 bg-card p-4 shadow-card text-left"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${bag.color}15` }}>
                    {bag.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{bag.name}</p>
                    <p className="text-[11px] text-destructive">
                      {(weight / 1000).toFixed(2)}kg / {((bag.weightLimit ?? 0) / 1000).toFixed(1)}kg
                    </p>
                    <p className="text-[11px] font-semibold text-destructive">
                      {Math.round(overBy) >= 1000 ? `${(overBy / 1000).toFixed(2)}kg` : `${Math.round(overBy)}g`} over limiet
                    </p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      )}

      {smartListId !== "overweight" && (
        <div className="mt-4 space-y-1.5 px-4">
          {filteredItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Geen items in deze lijst</p>
          ) : (
            <AnimatePresence initial={false}>
              {filteredItems.map((item, i) => {
                const bag = bags.find((b) => b.id === item.bagId);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.02, 0.2) }}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card"
                  >
                    <div className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: PRIORITY_COLOR[item.priority] ?? "#94a3b8" }} aria-hidden />
                    <button
                      type="button"
                      onClick={() => { haptics.light(); togglePacked(item.id); }}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors active:scale-90 ${
                        isPacked(item) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent hover:border-primary"
                      }`}
                      aria-label={isPacked(item) ? "Uitvinken" : "Afvinken"}
                    >
                      {isPacked(item) && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${isPacked(item) ? "text-muted-foreground line-through" : ""}`}>
                        {item.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {bag && (
                          <span className="text-[10px] text-muted-foreground">
                            {bag.icon} {bag.name}
                          </span>
                        )}
                        {item.qty > 1 && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {item.packedCount}/{item.qty}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.qty > 1 && (
                      <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary/60 p-0.5">
                        <button
                          type="button"
                          onClick={() => { haptics.selection(); togglePackedCount(item.id, -1); }}
                          disabled={item.packedCount === 0}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground active:scale-90 disabled:opacity-30"
                          aria-label="Minder"
                        >
                          <Minus className="h-3 w-3" strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { haptics.selection(); togglePackedCount(item.id, 1); }}
                          disabled={isPacked(item)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-primary active:scale-90 disabled:opacity-30"
                          aria-label="Meer"
                        >
                          <Plus className="h-3 w-3" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { haptics.medium(); removePackingItem(item.id); toast.success("Verwijderd"); }}
                      className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
