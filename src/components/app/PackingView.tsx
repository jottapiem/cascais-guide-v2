"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Check, RotateCcw, CheckCheck, Backpack,
  ClipboardPaste, Sparkles, ChevronDown, Wand2, Loader2,
  Minus, Flag, LayoutGrid, List,
  Shirt, Footprints, Plug, Sparkles as SparkIcon, Umbrella, Glasses,
  Pill, FileText, Cookie, CupSoda, SprayCan, Key,
  Dumbbell, Briefcase, Tent, Baby, PawPrint, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { TopBar } from "./TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  classifyItem, ALL_PACKING_CATEGORIES, ALL_SITUATIONS,
  SMART_COLLECTIONS, getCollection,
} from "@/lib/packing-classifier";
import type { PackingCategory, Situation, Priority, PackingItem } from "@/lib/types";

const SIT_COLOR: Record<Situation, string> = {
  Strand: "#0e9fb8", Zwembad: "#22a06b", Restaurant: "#f5b400", Uitgaan: "#a855f7",
  Shopping: "#d6488f", Stad: "#7c5cff", Hiking: "#22a06b", Roadtrip: "#ff7a45",
  Vliegtuig: "#5b6cff", Hotel: "#d97706", Festival: "#ff5d5d", Boot: "#0e7c7b",
  Sport: "#e8597a", Picknick: "#22a06b",
};

const CAT_ICON_CMP: Record<PackingCategory, LucideIcon> = {
  Kleding: Shirt, Schoenen: Footprints, Elektronica: Plug, Verzorging: SparkIcon,
  Strand: Umbrella, Accessoires: Glasses, Medicatie: Pill, Documenten: FileText,
  Snacks: Cookie, Drinken: CupSoda, Parfum: SprayCan, Essentials: Key,
  // Nieuw (Fase 1.3):
  Sport: Dumbbell, Werk: Briefcase, Camping: Tent, Baby: Baby,
  Huisdier: PawPrint, Koken: UtensilsCrossed,
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  must:     { label: "Must",      color: "#dc2626", bg: "bg-red-500/10" },
  nice:     { label: "Nice",      color: "#0e7c7b", bg: "bg-teal-500/10" },
  optional: { label: "Optioneel", color: "#94a3b8", bg: "bg-slate-500/10" },
};

const isPacked = (it: PackingItem) => it.packedCount >= it.qty;

export function PackingView() {
  const items = useAppStore((s) => s.packingItems);
  const togglePacked = useAppStore((s) => s.togglePacked);
  const togglePackedCount = useAppStore((s) => s.togglePackedCount);
  const addPackingItem = useAppStore((s) => s.addPackingItem);
  const addPackingItems = useAppStore((s) => s.addPackingItems);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const updatePackingItem = useAppStore((s) => s.updatePackingItem);
  const setPackedAll = useAppStore((s) => s.setPackedAll);
  const savedCollections = useAppStore((s) => s.savedCollections);
  const acceptCollection = useAppStore((s) => s.acceptCollection);

  const [filter, setFilter] = useState<PackingCategory | "ALL" | "UNPACKED" | "MUST">("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addSits, setAddSits] = useState<Situation[]>([]);

  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{ name: string; category: PackingCategory; situations: Situation[]; duplicate: boolean }[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSelection, setImportSelection] = useState<Set<number>>(new Set());

  // View mode (lijst / blokjes) — persist in localStorage
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("packing-view-mode");
      if (saved === "list" || saved === "grid") return saved;
    }
    return "list";
  });
  useEffect(() => {
    localStorage.setItem("packing-view-mode", viewMode);
  }, [viewMode]);

  // Totaal (met qty meegeteld) — partial check-off support
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPacked = items.reduce((sum, i) => sum + i.packedCount, 0);
  const pct = totalQty ? Math.round((totalPacked / totalQty) * 100) : 0;
  const packedItemsCount = items.filter(isPacked).length;

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    if (filter === "UNPACKED") return items.filter((i) => !isPacked(i));
    if (filter === "MUST") return items.filter((i) => i.priority === "must");
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const map = new Map<PackingCategory, typeof filtered>();
    for (const c of ALL_PACKING_CATEGORIES) {
      const list = filtered.filter((i) => i.category === c);
      if (list.length) map.set(c, list);
    }
    return map;
  }, [filtered]);

  const handleAdd = () => {
    if (!addName.trim()) {
      toast.error("Vul een item naam in");
      return;
    }
    addPackingItem(addName.trim(), addSits);
    toast.success(`${addName.trim()} toegevoegd`);
    setAddName("");
    setAddSits([]);
    setAddOpen(false);
  };

  const toggleSituation = (s: Situation) => {
    setAddSits((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast.error("Plak een lijstje");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/packing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: importText,
          existing: items.map((i) => i.name),
        }),
      });
      const data = await res.json();
      if (data.success && data.items?.length) {
        setImportResult(data.items);
        const sel = new Set<number>();
        data.items.forEach((it: { duplicate: boolean }, i: number) => {
          if (!it.duplicate) sel.add(i);
        });
        setImportSelection(sel);
        toast.info(`${data.items.length} items herkend`);
      } else {
        toast.error("Kon lijstje niet verwerken");
      }
    } catch {
      toast.error("Import mislukt");
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = () => {
    if (!importResult) return;
    const selected = importResult.filter((_, i) => importSelection.has(i));
    if (selected.length === 0) {
      toast.error("Selecteer minimaal één item");
      return;
    }
    addPackingItems(selected.map((it) => ({ name: it.name, situations: it.situations, category: it.category })));
    toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} toegevoegd`);
    setImportText("");
    setImportResult(null);
    setImportSelection(new Set());
    setImportOpen(false);
  };

  const addCollection = (s: Situation) => {
    const col = getCollection(s);
    if (!col) return;
    const existing = new Set(items.map((i) => i.name.toLowerCase()));
    const toAdd = col.items.filter((it) => !existing.has(it.toLowerCase()));
    if (toAdd.length === 0) {
      toast.info("Alle items al aanwezig");
      return;
    }
    addPackingItems(toAdd.map((name) => ({ name, situations: [s] })));
    acceptCollection(s);
    toast.success(`${toAdd.length} items toegevoegd voor ${s}`);
  };

  const editItem = items.find((i) => i.id === editId);

  return (
    <div className="min-h-screen pb-6">
      <TopBar
        title="Packing List"
        subtitle="Slimme checklist"
        showBack={false}
        right={
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 transition-colors hover:bg-secondary active:scale-95"
              aria-label="Importeren"
            >
              <ClipboardPaste className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors active:scale-95"
              aria-label="Item toevoegen"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        }
      />

      {/* Progress card */}
      <div className="px-4 pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[#0a5d5c] p-5 text-white shadow-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">Voortgang</p>
              <p className="mt-0.5 text-3xl font-bold">
                {totalPacked}<span className="text-lg font-medium text-white/70">/{totalQty}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-white/60">{packedItemsCount} van {items.length} items compleet</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{pct}%</p>
              <p className="text-[11px] text-white/70">ingepakt</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full rounded-full bg-white" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" className="h-8 flex-1 bg-white/15 text-white hover:bg-white/25" onClick={() => { setPackedAll(true); toast.success("Alles ingepakt"); }}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Alles
            </Button>
            <Button size="sm" variant="secondary" className="h-8 flex-1 bg-white/15 text-white hover:bg-white/25" onClick={() => { setPackedAll(false); toast.info("Vinkjes gewist"); }}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Wis vinkjes
            </Button>
          </div>
        </div>
      </div>

      {/* Smart collections */}
      <section className="mt-5 px-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Slimme collecties
        </h3>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {SMART_COLLECTIONS.map((col) => {
            const accepted = savedCollections.includes(col.situation);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => addCollection(col.situation)}
                className="flex shrink-0 flex-col items-start gap-1 rounded-2xl border border-border bg-card p-3 shadow-premium transition-colors hover:bg-secondary/50 active:scale-[0.98]"
                style={{ width: 130 }}
              >
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SIT_COLOR[col.situation] }} />
                  <span className="text-xs font-bold">{col.situation}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{col.items.length} items</span>
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${accepted ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                  {accepted ? "Toegevoegd" : "+ Voeg toe"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
        <FilterChip label="Alles" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        <FilterChip label="Niet ingepakt" active={filter === "UNPACKED"} onClick={() => setFilter("UNPACKED")} />
        <FilterChip label={<span className="flex items-center gap-1"><Flag className="h-3 w-3" /> Must</span>} active={filter === "MUST"} onClick={() => setFilter("MUST")} />
        {ALL_PACKING_CATEGORIES.map((c) => {
          const Icon = CAT_ICON_CMP[c];
          return (
            <FilterChip key={c} label={<span className="flex items-center gap-1"><Icon className="h-3 w-3" /> {c}</span>} active={filter === c} onClick={() => setFilter(c)} />
          );
        })}
      </div>

      {/* View mode toggle */}
      <div className="mt-3 flex justify-end px-4">
        <div className="flex rounded-full bg-secondary p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            aria-label="Lijst weergave"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            aria-label="Blokjes weergave"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lists by category */}
      <div className="mt-4 space-y-5 px-4">
        {[...grouped.entries()].map(([cat, list]) => {
          const Icon = CAT_ICON_CMP[cat];
          const catPacked = list.filter(isPacked).length;
          return (
            <div key={cat}>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {cat}
                <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {catPacked}/{list.length}
                </span>
              </h3>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-2">
                  <AnimatePresence initial={false}>
                    {list.map((item) => (
                      <PackingGridCard
                        key={item.id}
                        item={item}
                        onToggle={() => togglePacked(item.id)}
                        onEdit={() => setEditId(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {list.map((item) => (
                      <PackingRow
                        key={item.id}
                        item={item}
                        onToggle={() => togglePacked(item.id)}
                        onInc={() => togglePackedCount(item.id, +1)}
                        onDec={() => togglePackedCount(item.id, -1)}
                        onEdit={() => setEditId(item.id)}
                        onRemove={() => removePackingItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Backpack className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Nog geen items</p>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Item toevoegen
          </Button>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Item toevoegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Bijv. Reef-safe zonnebrand"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            {addName.trim() && (
              <div className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                Categorie: <span className="font-semibold text-foreground">{classifyItem(addName)}</span> (automatisch)
              </div>
            )}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Situaties (optioneel)</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SITUATIONS.map((s) => {
                  const active = addSits.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSituation(s)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
                      style={active ? { backgroundColor: SIT_COLOR[s] } : undefined}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuleer</Button>
            <Button onClick={handleAdd}>Toevoegen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto slim-scroll">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> Lijstje importeren</DialogTitle>
          </DialogHeader>
          {!importResult ? (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground">
                Plak een lijstje (één item per regel of komma-gescheiden). Slimme herkenning bepaalt categorieën en situaties.
              </p>
              <textarea
                className="min-h-[140px] w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={"Bikini\nHanddoek\nPowerbank\nAirpods\nPaspoort\nZonnebrand"}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportOpen(false)}>Annuleer</Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verwerken</> : <><Wand2 className="mr-1 h-4 w-4" /> Herken items</>}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground">
                {importResult.length} items herkend. Selecteer wat je wilt toevoegen. Duplicaten zijn gemarkeerd en kunnen niet worden geselecteerd.
              </p>
              <div className="space-y-1.5">
                {importResult.map((it, i) => {
                  const sel = importSelection.has(i);
                  const isDup = it.duplicate;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isDup}
                      onClick={() => setImportSelection((cur) => {
                        const n = new Set(cur);
                        if (n.has(i)) n.delete(i); else n.add(i);
                        return n;
                      })}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${sel ? "border-primary bg-primary/5" : "border-border bg-card"} ${isDup ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary/30"}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                        {sel && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{it.name}</p>
                        <p className="text-[11px] text-muted-foreground">{it.category}{it.situations.length ? ` · ${it.situations.join(", ")}` : ""}</p>
                      </div>
                      {isDup && <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">dubbel</span>}
                    </button>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setImportResult(null); setImportSelection(new Set()); }}>Terug</Button>
                <Button onClick={confirmImport}>Voeg {importSelection.size} toe</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto slim-scroll">
          <DialogHeader><DialogTitle>Item bewerken</DialogTitle></DialogHeader>
          {editItem && (
            <EditForm
              key={editItem.id}
              item={editItem}
              onSave={(patch) => {
                updatePackingItem(editItem.id, patch);
                toast.success("Bijgewerkt");
                setEditId(null);
              }}
              onCancel={() => setEditId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackingRow({
  item, onToggle, onInc, onDec, onEdit, onRemove,
}: {
  item: PackingItem;
  onToggle: () => void;
  onInc: () => void;
  onDec: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const packed = isPacked(item);
  const partial = item.packedCount > 0 && !packed;
  const prio = PRIORITY_CONFIG[item.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`flex items-center gap-2 rounded-xl bg-card p-3 shadow-premium ${partial ? "ring-1 ring-primary/30" : ""}`}
    >
      {/* Prioriteit indicator */}
      <div className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: prio.color }} aria-hidden />

      {/* Checkbox / progress circle */}
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${packed ? "border-primary bg-primary text-primary-foreground" : partial ? "border-primary/60 bg-primary/15 text-primary" : "border-muted-foreground/40 text-transparent hover:border-primary"}`}
        aria-label={packed ? "Uitvinken" : "Afvinken"}
      >
        {packed ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : partial ? (
          <span className="text-[10px] font-bold">{item.packedCount}</span>
        ) : null}
      </button>

      {/* Naam + situaties + notes */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`truncate text-sm font-medium ${packed ? "text-muted-foreground line-through" : ""}`}>{item.name}</p>
          {item.qty > 1 && (
            <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {item.packedCount}/{item.qty}
            </span>
          )}
        </div>
        {item.situations.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {item.situations.map((s) => (
              <span key={s} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ backgroundColor: SIT_COLOR[s] }}>
                {s}
              </span>
            ))}
          </div>
        )}
        {item.notes && (
          <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">{item.notes}</p>
        )}
      </div>

      {/* Qty stepper (alleen als qty > 1) */}
      {item.qty > 1 && (
        <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary/60 p-0.5">
          <button
            type="button"
            onClick={onDec}
            disabled={item.packedCount === 0}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary active:scale-90 disabled:opacity-30"
            aria-label="Minder"
          >
            <Minus className="h-3 w-3" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={onInc}
            disabled={packed}
            className="flex h-6 w-6 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 active:scale-90 disabled:opacity-30"
            aria-label="Meer"
          >
            <Plus className="h-3 w-3" strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Edit + Remove */}
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Bewerken"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Verwijderen"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function PackingGridCard({
  item, onToggle, onEdit,
}: {
  item: PackingItem;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const packed = isPacked(item);
  const partial = item.packedCount > 0 && !packed;
  const prio = PRIORITY_CONFIG[item.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden rounded-xl bg-card p-2.5 shadow-premium ${packed ? "opacity-50" : ""} ${partial ? "ring-1 ring-primary/30" : ""}`}
    >
      {/* Priority stripe */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: prio.color }} />

      {/* Checkbox + qty */}
      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${packed ? "border-primary bg-primary text-primary-foreground" : partial ? "border-primary/60 bg-primary/15 text-primary" : "border-muted-foreground/40 text-transparent hover:border-primary"}`}
          aria-label={packed ? "Uitvinken" : "Afvinken"}
        >
          {packed ? <Check className="h-3 w-3" strokeWidth={3} /> : partial ? <span className="text-[9px] font-bold">{item.packedCount}</span> : null}
        </button>
        {item.qty > 1 && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {item.packedCount}/{item.qty}
          </span>
        )}
      </div>

      {/* Name */}
      <p className={`mt-1.5 line-clamp-2 text-xs font-medium leading-tight ${packed ? "text-muted-foreground line-through" : ""}`}>
        {item.name}
      </p>

      {/* Bottom: situation dots + edit */}
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex gap-0.5">
          {item.situations.slice(0, 4).map((s) => (
            <span key={s} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SIT_COLOR[s] }} />
          ))}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full p-0.5 text-muted-foreground/40 transition-colors hover:text-foreground"
          aria-label="Bewerken"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

function EditForm({
  item, onSave, onCancel,
}: {
  item: PackingItem;
  onSave: (patch: Partial<PackingItem>) => void;
  onCancel: () => void;
}) {
  const [n, setN] = useState(item.name);
  const [c, setC] = useState<PackingCategory>(item.category);
  const [sits, setSits] = useState<Situation[]>(item.situations);
  const [qty, setQtyState] = useState(item.qty);
  const [priority, setPriorityState] = useState<Priority>(item.priority);
  const [notes, setNotes] = useState(item.notes ?? "");

  const handleSave = () => {
    if (!n.trim()) {
      toast.error("Naam mag niet leeg zijn");
      return;
    }
    onSave({ name: n.trim(), category: c, situations: sits, qty: Math.max(1, qty), priority, notes: notes.trim() || undefined });
  };

  return (
    <div className="space-y-3 py-2">
      <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Item naam" />

      {/* Qty */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Hoeveelheid</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setQtyState((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground active:scale-90">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-lg font-bold">{qty}</span>
          <button type="button" onClick={() => setQtyState((q) => q + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground active:scale-90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Categorie</p>
        <Select value={c} onValueChange={(v) => setC(v as PackingCategory)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALL_PACKING_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Prioriteit</p>
        <div className="flex gap-1.5">
          {(["must", "nice", "optional"] as Priority[]).map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityState(p)}
                className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${active ? "text-white" : `${cfg.bg} hover:opacity-80`}`}
                style={active ? { backgroundColor: cfg.color } : undefined}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Situations */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Situaties</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SITUATIONS.map((s) => {
            const active = sits.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSits((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
                style={active ? { backgroundColor: SIT_COLOR[s] } : undefined}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Notities (optioneel)</p>
        <textarea
          className="min-h-[60px] w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Bijv. 'Alleen als regen voorspeld' of 'In handbagage'"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Annuleer</Button>
        <Button onClick={handleSave}>Opslaan</Button>
      </DialogFooter>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
    >
      {label}
    </button>
  );
}
