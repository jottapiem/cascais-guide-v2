"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Check, ChevronDown, Minus, Flag, MoreVertical, Pin,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { classifyItem, ALL_PACKING_CATEGORIES, ALL_SITUATIONS } from "@/lib/packing-classifier";
import type { PackingCategory, Situation, Priority, PackingItem } from "@/lib/types";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  must:     { label: "Must",      color: "#dc2626" },
  nice:     { label: "Nice",      color: "#0e7c7b" },
  optional: { label: "Optioneel", color: "#94a3b8" },
};

const SIT_COLOR: Record<Situation, string> = {
  Strand: "#0e9fb8", Zwembad: "#22a06b", Restaurant: "#f5b400", Uitgaan: "#a855f7",
  Shopping: "#d6488f", Stad: "#7c5cff", Hiking: "#22a06b", Roadtrip: "#ff7a45",
  Vliegtuig: "#5b6cff", Hotel: "#d97706", Festival: "#ff5d5d", Boot: "#0e7c7b",
  Sport: "#e8597a", Picknick: "#22a06b",
};

const isPacked = (it: PackingItem) => it.packedCount >= it.qty;

export function BagDetailView() {
  const bagId = useAppStore((s) => s.selectedBagId);
  const bags = useAppStore((s) => s.bags);
  const items = useAppStore((s) => s.packingItems);
  const togglePacked = useAppStore((s) => s.togglePacked);
  const togglePackedCount = useAppStore((s) => s.togglePackedCount);
  const addPackingItem = useAppStore((s) => s.addPackingItem);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const updatePackingItem = useAppStore((s) => s.updatePackingItem);
  const setPackingSubView = useAppStore((s) => s.setPackingSubView);
  const togglePinBag = useAppStore((s) => s.togglePinBag);

  const [addName, setAddName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const bag = bags.find((b) => b.id === bagId);
  const bagItems = useMemo(
    () => items.filter((it) => it.bagId === bagId),
    [items, bagId]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PackingItem[]>();
    // Gebruik bag.categories als primary grouping
    const cats = bag?.categories ?? [];
    for (const c of cats) {
      const list = bagItems.filter((it) => it.category === c || it.name.toLowerCase().includes(c.toLowerCase()));
      if (list.length) map.set(c, list);
    }
    // Ongecategoriseerde items
    const uncategorized = bagItems.filter((it) => !cats.includes(it.category));
    if (uncategorized.length) map.set("Ongecategoriseerd", uncategorized);
    return map;
  }, [bagItems, bag]);

  const totalQty = bagItems.reduce((s, it) => s + it.qty, 0);
  const totalPacked = bagItems.reduce((s, it) => s + it.packedCount, 0);
  const pct = totalQty ? Math.round((totalPacked / totalQty) * 100) : 0;
  const weight = bagItems.reduce((s, it) => s + (it.weight ?? 0) * it.qty, 0);
  const weightLimit = bag?.weightLimit;
  const overLimit = weightLimit ? weight > weightLimit : false;

  if (!bag) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-sm text-muted-foreground">Tas niet gevonden</p>
        <Button size="sm" onClick={() => setPackingSubView("bags")}>← Terug naar tassen</Button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!addName.trim()) return;
    addPackingItem(addName.trim(), [], undefined, bagId);
    setAddName("");
    toast.success(`${addName.trim()} toegevoegd`);
  };

  const editItem = bagItems.find((it) => it.id === editId);

  return (
    <div className="min-h-screen pb-6">
      {/* TopBar met back + tas-naam + pin */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/40 bg-background/95 px-4 py-3 pt-safe-lg backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setPackingSubView("bags")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary active:scale-95"
          aria-label="Terug"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-xl">{bag.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{bag.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {totalPacked}/{totalQty} ingepakt · {bagItems.length} items
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => togglePinBag(bag.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 ${bag.pinned ? "bg-primary/10 text-primary" : "bg-secondary/80 hover:bg-secondary"}`}
          aria-label="Pin tas"
        >
          <Pin className={`h-4 w-4 ${bag.pinned ? "fill-primary" : ""}`} />
        </button>
      </div>

      {/* Weight + progress card */}
      <div className="px-4 pt-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Voortgang</p>
              <p className="mt-0.5 text-3xl font-bold">
                {totalPacked}<span className="text-lg font-medium text-muted-foreground">/{totalQty}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{pct}%</p>
              <p className="text-[11px] text-muted-foreground">ingepakt</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={`h-full rounded-full ${overLimit ? "bg-destructive" : "bg-primary"}`}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          {weightLimit && (
            <p className={`mt-2 text-[11px] font-semibold ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
              {(weight / 1000).toFixed(2)}kg / {(weightLimit / 1000).toFixed(1)}kg {overLimit ? "⚠ Overgewicht!" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Inline add */}
      <div className="mt-4 px-4">
        <div className="flex gap-2">
          <Input
            placeholder="Item toevoegen aan deze tas..."
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={!addName.trim()} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items grouped by category */}
      <div className="mt-4 space-y-5 px-4">
        {[...grouped.entries()].map(([cat, list]) => {
          const catPacked = list.filter(isPacked).length;
          return (
            <div key={cat}>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {cat}
                <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {catPacked}/{list.length}
                </span>
              </h3>
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
            </div>
          );
        })}
      </div>

      {bagItems.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium">Deze tas is nog leeg</p>
          <p className="text-xs text-muted-foreground">Voeg hierboven je eerste item toe</p>
        </div>
      )}

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

// ===== PackingRow (zelfde als oude PackingView, met bag-context) =====
function PackingRow({
  item, onToggle, onInc, onDec, onEdit, onRemove,
}: {
  item: PackingItem;
  onToggle: () => void; onInc: () => void; onDec: () => void;
  onEdit: () => void; onRemove: () => void;
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
      <div className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: prio.color }} aria-hidden />
      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${packed ? "border-primary bg-primary text-primary-foreground" : partial ? "border-primary/60 bg-primary/15 text-primary" : "border-muted-foreground/40 text-transparent hover:border-primary"}`}
        aria-label={packed ? "Uitvinken" : "Afvinken"}
      >
        {packed ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : partial ? <span className="text-[10px] font-bold">{item.packedCount}</span> : null}
      </button>
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
        {item.notes && <p className="mt-0.5 truncate text-[10px] italic text-muted-foreground">{item.notes}</p>}
      </div>
      {item.qty > 1 && (
        <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary/60 p-0.5">
          <button type="button" onClick={onDec} disabled={item.packedCount === 0} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary active:scale-90 disabled:opacity-30" aria-label="Minder">
            <Minus className="h-3 w-3" strokeWidth={3} />
          </button>
          <button type="button" onClick={onInc} disabled={packed} className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/10 active:scale-90 disabled:opacity-30" aria-label="Meer">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </button>
        </div>
      )}
      <button type="button" onClick={onEdit} className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 hover:bg-secondary hover:text-foreground" aria-label="Bewerken">
        <ChevronDown className="h-4 w-4" />
      </button>
      <button type="button" onClick={onRemove} className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive" aria-label="Verwijderen">
        <Trash2 className="h-4 w-4" />
      </button>
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
  const [weight, setWeight] = useState(item.weight?.toString() ?? "");

  const handleSave = () => {
    if (!n.trim()) { toast.error("Naam mag niet leeg zijn"); return; }
    onSave({
      name: n.trim(), category: c, situations: sits,
      qty: Math.max(1, qty), priority,
      notes: notes.trim() || undefined,
      weight: weight ? parseInt(weight) : undefined,
    });
  };

  return (
    <div className="space-y-3 py-2">
      <Input value={n} onChange={(e) => setN(e.target.value)} placeholder="Item naam" />
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Hoeveelheid</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setQtyState((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:scale-90">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-lg font-bold">{qty}</span>
          <button type="button" onClick={() => setQtyState((q) => q + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:scale-90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
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
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Prioriteit</p>
        <div className="flex gap-1.5">
          {(["must", "nice", "optional"] as Priority[]).map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            const active = priority === p;
            return (
              <button key={p} type="button" onClick={() => setPriorityState(p)}
                className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${active ? "text-white" : "bg-secondary/60 hover:opacity-80"}`}
                style={active ? { backgroundColor: cfg.color } : undefined}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Gewicht (gram, optioneel)</p>
        <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="bijv. 200" />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Situaties</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SITUATIONS.map((s) => {
            const active = sits.includes(s);
            return (
              <button key={s} type="button"
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
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Notities</p>
        <textarea
          className="min-h-[60px] w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Bijv. 'Alleen als regen voorspeld'"
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
