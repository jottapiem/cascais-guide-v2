"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pin, ChevronRight, AlertCircle,
  Backpack, Briefcase, ShoppingBag, Sparkles, Shirt, Package,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { TopBar } from "./TopBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { haptics } from "@/lib/premium";
import { STARTER_BAG_TEMPLATES } from "@/lib/bags-data";
import type { Bag, PackingItem } from "@/lib/types";

// ===== Helpers =====
const isItemPacked = (it: PackingItem) => it.packedCount >= it.qty;

function bagProgress(items: PackingItem[], bagId: string) {
  const bagItems = items.filter((it) => it.bagId === bagId);
  const total = bagItems.reduce((sum, it) => sum + it.qty, 0);
  const packed = bagItems.reduce((sum, it) => sum + it.packedCount, 0);
  return { total, packed, items: bagItems.length };
}

function bagWeight(items: PackingItem[], bagId: string) {
  return items.filter((it) => it.bagId === bagId).reduce((sum, it) => sum + (it.weight ?? 0) * it.qty, 0);
}

function formatWeight(grams: number) {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`;
  return `${Math.round(grams)}g`;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "zojuist";
  if (min < 60) return `${min}m geleden`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}u geleden`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d geleden`;
  return new Date(ts).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

// Bag type icons — Lucide (Airbnb-discipline: clear, consistent)
const BAG_TYPE_ICON: Record<string, LucideIcon> = {
  "carry-on": Backpack,
  "checked": Briefcase,
  "personal": ShoppingBag,
  "toiletry": Sparkles,
  "worn": Shirt,
  "custom": Package,
};

function getBagIcon(bag: Bag): LucideIcon {
  return BAG_TYPE_ICON[bag.type] ?? Package;
}

const FILTERS = ["Alles", "Gepind", "Recent", "Ongecategoriseerd"] as const;
type Filter = typeof FILTERS[number];

// ===== BlurFade wrapper (Explore design language) =====
function BlurFade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ===== Main Component =====
export function BagsView() {
  const bags = useAppStore((s) => s.bags);
  const items = useAppStore((s) => s.packingItems);
  const setSelectedBagId = useAppStore((s) => s.setSelectedBagId);
  const setPackingSubView = useAppStore((s) => s.setPackingSubView);
  const instantiateBagFromTemplate = useAppStore((s) => s.instantiateBagFromTemplate);
  const addBag = useAppStore((s) => s.addBag);

  const [filter, setFilter] = useState<Filter>("Alles");
  const [showNewBagSheet, setShowNewBagSheet] = useState(false);

  // Derived state
  const pinnedBags = useMemo(() => bags.filter((b) => b.pinned), [bags]);
  const recentBags = useMemo(
    () => [...bags].sort((a, b) => b.lastEditedAt - a.lastEditedAt).slice(0, 5),
    [bags]
  );

  // Today surface — Airbnb host-dashboard inspired
  const todayStats = useMemo(() => {
    const totalQty = items.reduce((s, it) => s + it.qty, 0);
    const packedQty = items.reduce((s, it) => s + it.packedCount, 0);
    const unpacked = items.filter((it) => !isItemPacked(it)).length;
    const pct = totalQty ? Math.round((packedQty / totalQty) * 100) : 0;
    const overweight = bags.filter((b) => b.weightLimit && bagWeight(items, b.id) > b.weightLimit).length;
    return { totalQty, packedQty, unpacked, pct, overweight };
  }, [items, bags]);

  const filteredBags = useMemo(() => {
    if (filter === "Alles") return bags;
    if (filter === "Gepind") return bags.filter((b) => b.pinned);
    if (filter === "Ongecategoriseerd") return bags.filter((b) => b.trips.length === 0);
    if (filter === "Recent") return recentBags;
    return bags;
  }, [bags, filter, recentBags]);

  const handleBagClick = (bagId: string) => {
    haptics.selection();
    setSelectedBagId(bagId);
    setPackingSubView("bag-detail");
  };

  const handleQuickInstantiate = (templateId: string) => {
    const newBagId = instantiateBagFromTemplate(templateId);
    if (newBagId) {
      toast.success("Tas aangemaakt vanuit template");
      haptics.light();
      setShowNewBagSheet(false);
      setSelectedBagId(newBagId);
      setPackingSubView("bag-detail");
    }
  };

  const handleCreateEmptyBag = () => {
    const newBagId = addBag({
      name: "Nieuwe tas",
      icon: "package",
      color: "#0e7c7b",
      type: "custom",
      weightUnit: "g",
      categories: [],
      stapleItemIds: [],
      trips: [],
      pinned: false,
    });
    toast.success("Lege tas aangemaakt");
    haptics.light();
    setShowNewBagSheet(false);
    setSelectedBagId(newBagId);
    setPackingSubView("bag-detail");
  };

  const showPinnedAndRecent = filter === "Alles";

  return (
    <div className="min-h-screen pb-24">
      <TopBar
        title="Tassen"
        subtitle={`${bags.length} ${bags.length === 1 ? "tas" : "tassen"}`}
        showBack={false}
        right={
          <button
            type="button"
            onClick={() => { haptics.selection(); setShowNewBagSheet(true); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
            aria-label="Nieuwe tas"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      {/* Filter chips rail — sticky onder TopBar */}
      <div className="no-scrollbar sticky top-[57px] z-20 flex gap-1.5 border-b border-border/40 bg-background/95 px-4 py-2.5 backdrop-blur-xl">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { haptics.selection(); setFilter(f); }}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors active:scale-95 ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Today surface — Airbnb host-dashboard inspired */}
      {todayStats.totalQty > 0 && (
        <section className="mt-4 px-4">
          <BlurFade>
            <TodayCard stats={todayStats} />
          </BlurFade>
        </section>
      )}

      {/* Pinned sectie — horizontale scroll */}
      {pinnedBags.length > 0 && showPinnedAndRecent && (
        <section className="mt-5 px-4">
          <h3 className="mb-3 border-b border-black/[0.04] pb-2 text-[1.125rem] font-bold tracking-tight">
            Gepind
          </h3>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {pinnedBags.map((bag, i) => (
              <BlurFade key={bag.id} delay={Math.min(i * 0.04, 0.3)}>
                <BagCardPinned bag={bag} items={items} onClick={() => handleBagClick(bag.id)} />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {/* Recent bewerkt */}
      {recentBags.length > 0 && showPinnedAndRecent && (
        <section className="mt-5 px-4">
          <h3 className="mb-3 border-b border-black/[0.04] pb-2 text-[1.125rem] font-bold tracking-tight">
            Recent bewerkt
          </h3>
          <div className="space-y-2">
            {recentBags.slice(0, 5).map((bag, i) => (
              <BlurFade key={bag.id} delay={Math.min(i * 0.04, 0.3)}>
                <BagRow bag={bag} items={items} onClick={() => handleBagClick(bag.id)} />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {/* Alle Tassen */}
      <section className="mt-5 px-4">
        <h3 className="mb-3 border-b border-black/[0.04] pb-2 text-[1.125rem] font-bold tracking-tight">
          {showPinnedAndRecent ? `Alle tassen (${filteredBags.length})` : `${filter} (${filteredBags.length})`}
        </h3>
        {filteredBags.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Geen tassen in deze filter</p>
        ) : (
          <div className="space-y-2">
            {filteredBags.map((bag, i) => (
              <BlurFade key={bag.id} delay={Math.min(i * 0.04, 0.3)}>
                <BagRow bag={bag} items={items} onClick={() => handleBagClick(bag.id)} />
              </BlurFade>
            ))}
          </div>
        )}
      </section>

      {/* Empty state */}
      {bags.length === 0 && (
        <EmptyBagsState onCreateBag={() => setShowNewBagSheet(true)} />
      )}

      {/* New bag sheet */}
      <NewBagSheet
        open={showNewBagSheet}
        onClose={() => setShowNewBagSheet(false)}
        onInstantiate={handleQuickInstantiate}
        onCreateEmpty={handleCreateEmptyBag}
      />
    </div>
  );
}

// ===== Sub-components =====

function BagCardPinned({ bag, items, onClick }: { bag: Bag; items: PackingItem[]; onClick: () => void }) {
  const Icon = getBagIcon(bag);
  const { total, packed, items: itemCount } = bagProgress(items, bag.id);
  const weight = bagWeight(items, bag.id);
  const pct = total ? Math.round((packed / total) * 100) : 0;
  const overLimit = bag.weightLimit ? weight > bag.weightLimit : false;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 cursor-pointer flex-col gap-2 rounded-[16px] border border-border bg-card p-3 shadow-premium"
      style={{ width: 140 }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${bag.color}15` }}>
          <Icon className="h-5 w-5" style={{ color: bag.color }} />
        </span>
        <Pin className="h-3 w-3 fill-primary text-primary" />
      </div>
      <div>
        <p className="truncate text-sm font-bold">{bag.name}</p>
        <p className="text-[10px] text-muted-foreground">{itemCount} items · {packed}/{total}</p>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${overLimit ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`text-[10px] font-semibold ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
          {formatWeight(weight)}{bag.weightLimit ? ` / ${formatWeight(bag.weightLimit)}` : ""}
        </p>
      </div>
    </motion.div>
  );
}

function BagRow({ bag, items, onClick }: { bag: Bag; items: PackingItem[]; onClick: () => void }) {
  const Icon = getBagIcon(bag);
  const { total, packed, items: itemCount } = bagProgress(items, bag.id);
  const weight = bagWeight(items, bag.id);
  const pct = total ? Math.round((packed / total) * 100) : 0;
  const overLimit = bag.weightLimit ? weight > bag.weightLimit : false;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-border bg-card p-3 shadow-card"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${bag.color}15` }}>
        <Icon className="h-5 w-5" style={{ color: bag.color }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{bag.name}</p>
          {bag.pinned && <Pin className="h-3 w-3 shrink-0 fill-primary text-primary" />}
          {overLimit && <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {itemCount} items · {pct}% ingepakt
          {bag.weightLimit && (
            <span className={overLimit ? "ml-1 font-semibold text-destructive" : ""}>
              {" · "}{formatWeight(weight)}/{formatWeight(bag.weightLimit)}
            </span>
          )}
        </p>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full ${overLimit ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
    </motion.div>
  );
}

function TodayCard({ stats }: {
  stats: { totalQty: number; packedQty: number; unpacked: number; pct: number; overweight: number };
}) {
  return (
    <div className="rounded-[16px] border border-border bg-card p-4 shadow-premium">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Vandaag</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight">{stats.unpacked}</p>
          <p className="text-[11px] text-muted-foreground">items nog in te pakken</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{stats.pct}%</p>
          <p className="text-[11px] text-muted-foreground">totaal ingepakt</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${stats.pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      {stats.overweight > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          <p className="text-[11px] font-semibold text-destructive">
            {stats.overweight} {stats.overweight === 1 ? "tas heeft" : "tassen hebben"} overgewicht
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyBagsState({ onCreateBag }: { onCreateBag: () => void }) {
  return (
    <BlurFade delay={0.1}>
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
        <Backpack className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
        <div>
          <p className="text-[15px] font-semibold">Waar ga je heen?</p>
          <p className="mt-1 text-sm text-muted-foreground">Begin met een template of maak er een zelf.</p>
        </div>
        <Button
          size="sm"
          onClick={onCreateBag}
          className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground"
        >
          <Plus className="mr-1 h-4 w-4" /> Nieuwe tas
        </Button>
      </div>
    </BlurFade>
  );
}

function NewBagSheet({ open, onClose, onInstantiate, onCreateEmpty }: {
  open: boolean;
  onClose: () => void;
  onInstantiate: (templateId: string) => void;
  onCreateEmpty: () => void;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <motion.div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 shadow-xl-premium slim-scroll"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-tight">Nieuwe tas</h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary" aria-label="Sluiten">
              <Plus className="h-5 w-5 rotate-45" />
            </button>
          </div>

          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Start met een template
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STARTER_BAG_TEMPLATES.map((tpl) => {
              const Icon = BAG_TYPE_ICON[tpl.type] ?? Package;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onInstantiate(tpl.id)}
                  className="flex flex-col gap-1.5 rounded-[16px] border border-border bg-card p-3 text-left shadow-card transition-transform active:scale-[0.97]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${tpl.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: tpl.color }} />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tpl.items.length} items</p>
                  </div>
                  {tpl.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{tpl.description}</p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="my-4 border-t border-border" />

          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Of</p>
          <button
            type="button"
            onClick={onCreateEmpty}
            className="flex w-full items-center gap-3 rounded-[16px] border border-dashed border-border p-4 text-left transition-transform active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Plus className="h-5 w-5 text-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold">Begin met lege tas</p>
              <p className="text-[11px] text-muted-foreground">Volledig zelf inrichten</p>
            </div>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ===== Sub-tab Switcher (exported for PackingView) =====
export function SubTabSwitcher({ active, onChange }: {
  active: "bags" | "smart-lists";
  onChange: (v: "bags" | "smart-lists") => void;
}) {
  return (
    <div className="fixed bottom-16 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4 pb-safe">
      <div className="flex rounded-full border border-border bg-background/95 p-1 shadow-premium backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onChange("bags")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold transition-colors active:scale-95 ${
            active === "bags" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Backpack className="h-3.5 w-3.5" /> Tassen
        </button>
        <button
          type="button"
          onClick={() => onChange("smart-lists")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold transition-colors active:scale-95 ${
            active === "smart-lists" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Slimme Lijsten
        </button>
      </div>
    </div>
  );
}
