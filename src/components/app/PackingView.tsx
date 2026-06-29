"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Check, RotateCcw, CheckCheck, Backpack,
  ClipboardPaste, Sparkles, ChevronDown, X, Wand2, Loader2,
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
import type { PackingCategory, Situation } from "@/lib/types";

const CAT_ICON: Record<PackingCategory, string> = {
  Kleding: "Shirt", Schoenen: "Footprints", Elektronica: "Plug", Verzorging: "Sparkles",
  Strand: "Umbrella", Accessoires: "Glasses", Medicatie: "Pill", Documenten: "FileText",
  Snacks: "Cookie", Drinken: "CupSoda", Parfum: "SprayCan", Essentials: "Key",
};

const SIT_COLOR: Record<Situation, string> = {
  Strand: "#0e9fb8", Zwembad: "#22a06b", Restaurant: "#f5b400", Uitgaan: "#a855f7",
  Shopping: "#d6488f", Stad: "#7c5cff", Hiking: "#22a06b", Roadtrip: "#ff7a45",
  Vliegtuig: "#5b6cff", Hotel: "#d97706", Festival: "#ff5d5d", Boot: "#0e7c7b",
  Sport: "#e8597a", Picknick: "#22a06b",
};

import {
  Shirt, Footprints, Plug, Sparkles as SparkIcon, Umbrella, Glasses,
  Pill, FileText, Cookie, CupSoda, SprayCan, Key, type LucideIcon,
} from "lucide-react";

const CAT_ICON_CMP: Record<PackingCategory, LucideIcon> = {
  Kleding: Shirt, Schoenen: Footprints, Elektronica: Plug, Verzorging: SparkIcon,
  Strand: Umbrella, Accessoires: Glasses, Medicatie: Pill, Documenten: FileText,
  Snacks: Cookie, Drinken: CupSoda, Parfum: SprayCan, Essentials: Key,
};

export function PackingView() {
  const items = useAppStore((s) => s.packingItems);
  const togglePacked = useAppStore((s) => s.togglePacked);
  const addPackingItem = useAppStore((s) => s.addPackingItem);
  const addPackingItems = useAppStore((s) => s.addPackingItems);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const updatePackingItem = useAppStore((s) => s.updatePackingItem);
  const setPackedAll = useAppStore((s) => s.setPackedAll);
  const savedCollections = useAppStore((s) => s.savedCollections);
  const acceptCollection = useAppStore((s) => s.acceptCollection);

  const [filter, setFilter] = useState<PackingCategory | "ALL">("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addSits, setAddSits] = useState<Situation[]>([]);

  // import state
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{ name: string; category: PackingCategory; situations: Situation[]; duplicate: boolean }[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSelection, setImportSelection] = useState<Set<number>>(new Set());

  const packedCount = items.filter((i) => i.packed).length;
  const pct = items.length ? Math.round((packedCount / items.length) * 100) : 0;

  const filtered = useMemo(
    () => (filter === "ALL" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

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
        // selecteer alle niet-duplicaten standaard
        const sel = new Set<number>();
        data.items.forEach((it: { duplicate: boolean }, i: number) => {
          if (!it.duplicate) sel.add(i);
        });
        setImportSelection(sel);
        if (data.usedLLM) toast.success(`${data.items.length} items herkend met AI`);
        else toast.info(`${data.items.length} items herkend`);
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
    addPackingItems(selected.map((it) => ({ name: it.name, situations: it.situations })));
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
                {packedCount}<span className="text-lg font-medium text-white/70">/{items.length}</span>
              </p>
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
            <Button size="sm" variant="secondary" className="h-8 flex-1 bg-white/15 text-white hover:bg-white/25" onClick={() => { setPackedAll(false); toast.info("Checklist gereset"); }}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
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
        {ALL_PACKING_CATEGORIES.map((c) => {
          const Icon = CAT_ICON_CMP[c];
          return (
            <FilterChip key={c} label={<span className="flex items-center gap-1"><Icon className="h-3 w-3" /> {c}</span>} active={filter === c} onClick={() => setFilter(c)} />
          );
        })}
      </div>

      {/* Lists by category */}
      <div className="mt-4 space-y-5 px-4">
        {[...grouped.entries()].map(([cat, list]) => {
          const Icon = CAT_ICON_CMP[cat];
          return (
            <div key={cat}>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {cat}
                <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {list.filter((i) => i.packed).length}/{list.length}
                </span>
              </h3>
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {list.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-premium"
                    >
                      <button
                        type="button"
                        onClick={() => togglePacked(item.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          item.packed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-transparent hover:border-primary"
                        }`}
                        aria-label={item.packed ? "Uitvinken" : "Afvinken"}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${item.packed ? "text-muted-foreground line-through" : ""}`}>{item.name}</p>
                        {item.situations.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {item.situations.map((s) => (
                              <span key={s} className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ backgroundColor: SIT_COLOR[s] }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditId(item.id)}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Bewerken"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePackingItem(item.id)}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
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
                Plak een lijstje (één item per regel of komma-gescheiden). De AI herkent items, bepaalt categorieën en stelt collecties voor.
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
                {importResult.length} items herkend. Selecteer wat je wilt toevoegen. Duplicaten zijn gemarkeerd.
              </p>
              <div className="space-y-1.5">
                {importResult.map((it, i) => {
                  const sel = importSelection.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImportSelection((cur) => {
                        const n = new Set(cur);
                        if (n.has(i)) n.delete(i); else n.add(i);
                        return n;
                      })}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${sel ? "border-primary bg-primary/5" : "border-border bg-card opacity-60"}`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                        {sel && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{it.name}</p>
                        <p className="text-[11px] text-muted-foreground">{it.category}{it.situations.length ? ` · ${it.situations.join(", ")}` : ""}</p>
                      </div>
                      {it.duplicate && <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">dubbel</span>}
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Item bewerken</DialogTitle></DialogHeader>
          {editItem && (
            <EditForm
              key={editItem.id}
              name={editItem.name}
              category={editItem.category}
              situations={editItem.situations}
              onSave={(name, category, situations) => {
                updatePackingItem(editItem.id, { name, category, situations });
                toast.success("Bijgewerkt");
                setEditId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditForm({
  name, category, situations, onSave,
}: {
  name: string; category: PackingCategory; situations: Situation[];
  onSave: (name: string, category: PackingCategory, situations: Situation[]) => void;
}) {
  const [n, setN] = useState(name);
  const [c, setC] = useState<PackingCategory>(category);
  const [sits, setSits] = useState<Situation[]>(situations);
  return (
    <div className="space-y-3 py-2">
      <Input value={n} onChange={(e) => setN(e.target.value)} />
      <Select value={c} onValueChange={(v) => setC(v as PackingCategory)}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ALL_PACKING_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
      <DialogFooter>
        <Button onClick={() => onSave(n, c, sits)}>Opslaan</Button>
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
