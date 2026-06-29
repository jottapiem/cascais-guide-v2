"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Moon, Sun, ArrowRight, MapPin, Map as MapIcon, Backpack,
  Sparkles, Flame, Search, Heart,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { categories, exploreFeed } from "@/lib/categories-data";
import { places, HERO_IMAGE } from "@/lib/places-data";
import { PlaceCard } from "./PlaceCard";
import type { CategoryId } from "@/lib/types";

function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-90"
      aria-label="Thema wisselen"
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" strokeWidth={2.2} />
      <Moon className="block h-[18px] w-[18px] dark:hidden" strokeWidth={2.2} />
    </button>
  );
}

export function HomeView() {
  const goCategory = useAppStore((s) => s.goCategory);
  const goExplore = useAppStore((s) => s.goExplore);
  const goMap = useAppStore((s) => s.goMap);
  const goPacking = useAppStore((s) => s.goPacking);
  const goFavorites = useAppStore((s) => s.goFavorites);
  const goSearch = useAppStore((s) => s.goSearch);

  const feed = exploreFeed();
  const preview = feed.slice(0, 10);
  const homeCategories = categories.filter((c) => c.id !== "trending");
  const trending = feed.filter((p) => p.trending).slice(0, 6);

  const quickAccess = [
    { id: "map", label: "Kaart", desc: "Alle plekken", icon: MapIcon, color: "#0e9fb8", action: goMap, image: places.find((p) => p.id === "marina")!.coverImage },
    { id: "packing", label: "Packing List", desc: "Slimme checklist", icon: Backpack, color: "#22a06b", action: goPacking, image: places.find((p) => p.id === "tamariz")!.coverImage },
    { id: "favorites", label: "Favorieten", desc: "Opgeslagen plekken", icon: Heart, color: "#ff5d5d", action: goFavorites, image: places.find((p) => p.id === "casaguia")!.coverImage },
  ] as const;

  return (
    <div className="pb-8">
      {/* HERO — premium full-bleed image met layered gradient (Apple HIG stijl) */}
      <section className="relative h-[46vh] min-h-[340px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          src={HERO_IMAGE}
          alt="Cascais"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Triple-stop gradient: top-dim → clear → bottom-dark voor premium leesbaarheid */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />
        {/* Subtiele top-scan voor native app bar feel */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-safe-lg">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-xl"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
            <span>Cascais, Portugal</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>

        {/* Search trigger — premium floating pill met soft shadow */}
        <motion.button
          type="button"
          onClick={goSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
          className="absolute inset-x-4 bottom-24 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3.5 text-left text-sm text-muted-foreground shadow-float ring-1 ring-black/5 backdrop-blur-xl"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          <span className="flex-1">Zoek strand, food, sunset, vibe…</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <ArrowRight className="h-3 w-3 text-primary" strokeWidth={2.6} />
          </span>
        </motion.button>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/75"
          >
            Travel Discovery
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 text-[46px] font-bold tracking-[-0.025em] text-white leading-[0.95]"
          >
            Cascais
          </motion.h1>
        </div>
      </section>

      {/* EXPLORE PREVIEW — fixed aspect, geen overlap */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em]">
            <Sparkles className="h-[18px] w-[18px] text-accent" strokeWidth={2.4} /> Explore
          </h2>
          <button
            type="button"
            onClick={goExplore}
            className="flex items-center gap-0.5 text-sm font-semibold text-primary press-sm"
          >
            Alles <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
          </button>
        </div>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1.5">
          {preview.map((p, i) => (
            <div key={p.id} className="w-36 shrink-0">
              <PlaceCard place={p} variant="wide" index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mt-8 px-4">
        <h2 className="mb-3 text-[20px] font-bold tracking-[-0.02em]">Categorieën</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {homeCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <CategoryTile
                key={cat.id}
                image={cat.image}
                icon={<Icon className="h-4 w-4" strokeWidth={2.4} />}
                label={cat.label}
                color={cat.color}
                onClick={() => goCategory(cat.id as CategoryId)}
                index={i}
              />
            );
          })}
        </div>
      </section>

      {/* TRENDING — fixed aspect */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em]">
            <Flame className="h-[18px] w-[18px] text-accent" strokeWidth={2.4} /> Trending nu
          </h2>
          <button type="button" onClick={() => goCategory("trending")} className="flex items-center gap-0.5 text-sm font-semibold text-primary press-sm">
            Meer <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
          </button>
        </div>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1.5">
          {trending.map((p, i) => (
            <div key={p.id} className="w-36 shrink-0">
              <PlaceCard place={p} variant="wide" index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="mt-8">
        <h2 className="mb-3 px-4 text-[20px] font-bold tracking-[-0.02em]">Snelle toegang</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1.5">
          {quickAccess.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <motion.button
                key={qa.id}
                type="button"
                onClick={qa.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                className="group relative h-44 w-44 shrink-0 overflow-hidden rounded-3xl text-left shadow-premium ring-1 ring-black/5"
              >
                <img src={qa.image} alt={qa.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md ring-1 ring-white/25" style={{ backgroundColor: qa.color }}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <p className="text-[15px] font-bold tracking-tight text-white">{qa.label}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-white/80">{qa.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <p className="mt-10 px-4 text-center text-[11px] font-medium text-muted-foreground tracking-tight">
        {places.length} plekken · Cascais · Estoril · Guincho · Sintra · Lisbon coast
      </p>
    </div>
  );
}

function CategoryTile({
  image, icon, label, color, onClick, index,
}: {
  image: string; icon: React.ReactNode; label: string; color: string; onClick: () => void; index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl text-left shadow-premium ring-1 ring-black/5"
    >
      <img src={image} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white ring-1 ring-white/25" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="text-[15px] font-bold leading-tight tracking-tight text-white">{label}</p>
      </div>
    </motion.button>
  );
}
