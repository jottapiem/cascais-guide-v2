"use client";

import { useAppStore } from "@/store/app-store";
import { BagsView, SubTabSwitcher } from "./BagsView";
import { BagDetailView } from "./BagDetailView";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function PackingView() {
  const subView = useAppStore((s) => s.packingSubView);
  const setPackingSubView = useAppStore((s) => s.setPackingSubView);

  // Bepaal welke sub-tab actief is (bags vs smart-lists)
  const activeTab = subView === "smart-lists" || subView === "smart-list-detail" ? "smart-lists" : "bags";

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={subView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {subView === "bag-detail" ? (
            <BagDetailView />
          ) : subView === "smart-lists" || subView === "smart-list-detail" ? (
            <SmartListsStub />
          ) : (
            <BagsView />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sub-tab switcher — altijd zichtbaar behalve in bag-detail */}
      {subView !== "bag-detail" && (
        <SubTabSwitcher
          active={activeTab}
          onChange={(v) => setPackingSubView(v === "bags" ? "bags" : "smart-lists")}
        />
      )}
    </div>
  );
}

// ===== Smart Lists Stub (Fase 2.4 implementatie) =====
function SmartListsStub() {
  const items = useAppStore((s) => s.packingItems);
  const bags = useAppStore((s) => s.bags);

  // Berekent counts voor elke smart view
  const unpackedCount = items.filter((it) => it.packedCount < it.qty).length;
  const needToBuyCount = items.filter((it) => it.needToBuy).length;
  const overweightCount = bags.filter((b) => {
    if (!b.weightLimit) return false;
    const weight = items.filter((it) => it.bagId === b.id).reduce((s, it) => s + (it.weight ?? 0) * it.qty, 0);
    return weight > b.weightLimit;
  }).length;

  const smartViews = [
    { id: "unpacked", label: "Niet ingepakt", icon: "📦", count: unpackedCount, color: "#0e7c7b" },
    { id: "need-to-buy", label: "Nog kopen", icon: "🛒", count: needToBuyCount, color: "#f5b400" },
    { id: "overweight", label: "Overgewicht", icon: "⚖️", count: overweightCount, color: "#dc2626" },
    { id: "recently-used", label: "Recent gebruikt", icon: "🕐", count: 0, color: "#7c5cff" },
    { id: "favorites", label: "Favorieten", icon: "⭐", count: 0, color: "#f97316" },
    { id: "worn", label: "Gedragen", icon: "👕", count: 0, color: "#525252" },
    { id: "all-items", label: "Alle items", icon: "📋", count: items.length, color: "#0e7c7b" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header (geen TopBar — custom voor smart lists) */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/95 px-4 py-3 pt-safe-lg backdrop-blur-xl">
        <h1 className="text-[22px] font-bold tracking-[-0.02em]">Slimme Lijsten</h1>
        <p className="text-[11px] text-muted-foreground">Cross-tas overzichten</p>
      </div>

      {/* Smart views grid */}
      <div className="mt-4 space-y-2 px-4">
        {smartViews.map((sv, i) => (
          <motion.button
            key={sv.id}
            type="button"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.04, 0.3) }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center gap-3 rounded-[16px] border border-border bg-card p-4 shadow-card text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${sv.color}15` }}>
              {sv.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{sv.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {sv.count} {sv.count === 1 ? "item" : "items"}
              </p>
            </div>
            {sv.count > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground">
                {sv.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Hint dat dit nog in ontwikkeling is */}
      <div className="mt-6 px-4">
        <div className="flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <p>Tap een lijst om items te zien — komt in Fase 2.4</p>
        </div>
      </div>
    </div>
  );
}
