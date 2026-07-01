"use client";
import { motion } from "framer-motion";
import { User, Heart, Backpack, RotateCcw, Moon, Sun, Globe, Bell, Shield } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useTheme } from "next-themes";
import { places } from "@/lib/places-data";
import { toast } from "sonner";

export function ProfileView() {
  const favorites = useAppStore((s) => s.favorites);
  const packingItems = useAppStore((s) => s.packingItems);
  const setPackedAll = useAppStore((s) => s.setPackedAll);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const favCount = favorites.length;
  const packedCount = packingItems.filter((i) => i.packed).length;
  const pct = packingItems.length ? Math.round((packedCount / packingItems.length) * 100) : 0;

  const handleReset = () => {
    if (confirm("Weet je zeker dat je alle voortgang wilt resetten?")) {
      setPackedAll(false);
      useAppStore.setState({ favorites: [] });
      toast.success("Voortgang gereset");
    }
  };

  return (
    <div className="min-h-screen pb-6">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-2xl pt-safe-lg">
        <div className="px-4 py-4"><h1 className="text-[24px] font-bold tracking-tight">Profiel</h1></div>
      </header>
      <div className="px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><User className="h-8 w-8 text-primary" /></div>
          <div><p className="text-[18px] font-bold">Cascais Explorer</p><p className="text-[13px] text-muted-foreground">Privé account</p></div>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-border/40"><Heart className="mx-auto h-5 w-5 text-accent" /><p className="mt-1 text-[20px] font-bold">{favCount}</p><p className="text-[11px] text-muted-foreground">Favorieten</p></div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-border/40"><Backpack className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-[20px] font-bold">{pct}%</p><p className="text-[11px] text-muted-foreground">Ingepakt</p></div>
      </div>
      <div className="px-4 pt-6">
        <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">Instellingen</h2>
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/40">
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className="flex w-full items-center gap-3 border-b border-border/30 p-4 hover:bg-secondary/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">{isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</div>
            <span className="flex-1 text-left text-[14px] font-medium">Donkere modus</span>
            <div className={`h-6 w-10 rounded-full ${isDark ? "bg-primary" : "bg-muted-foreground/30"}`}><div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? "translate-x-[18px] translate-y-[2px]" : "translate-x-[2px] translate-y-[2px]"}`} /></div>
          </button>
          <div className="flex items-center gap-3 border-b border-border/30 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Globe className="h-4 w-4" /></div><span className="flex-1 text-[14px] font-medium">Taal</span><span className="text-[13px] text-muted-foreground">Nederlands</span></div>
          <div className="flex items-center gap-3 border-b border-border/30 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Bell className="h-4 w-4" /></div><span className="flex-1 text-[14px] font-medium">Meldingen</span><span className="text-[13px] text-muted-foreground">Uit</span></div>
          <div className="flex items-center gap-3 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><Shield className="h-4 w-4" /></div><span className="flex-1 text-[14px] font-medium">Privacy</span><span className="text-[13px] text-muted-foreground">Privé app</span></div>
        </div>
      </div>
      <div className="px-4 pt-6">
        <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">Data</h2>
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/40">
          <button onClick={handleReset} className="flex w-full items-center gap-3 p-4 hover:bg-destructive/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10"><RotateCcw className="h-4 w-4 text-destructive" /></div>
            <span className="flex-1 text-left text-[14px] font-medium text-destructive">Reset voortgang</span>
          </button>
        </div>
      </div>
      <p className="px-4 pt-6 text-center text-[11px] text-muted-foreground">Cascais Guide V2 · {places.length} plekken<br />Gebouwd met Next.js 16</p>
    </div>
  );
}
