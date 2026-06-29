"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { getCategory, filterByCategory } from "@/lib/categories-data";
import { PlaceCard } from "./PlaceCard";

export function CategoryView() {
  const categoryId = useAppStore((s) => s.selectedCategory);
  const goBack = useAppStore((s) => s.goBack);

  const cat = categoryId ? getCategory(categoryId) : undefined;
  const list = categoryId ? filterByCategory(categoryId) : [];
  if (!cat) return null;
  const Icon = cat.icon;

  return (
    <div className="min-h-screen">
      {/* Minimal header */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass pt-safe">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 transition-colors hover:bg-secondary active:scale-95"
            aria-label="Terug"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: cat.color }}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              className="truncate text-[17px] font-bold tracking-tight"
            >
              {cat.label}
            </motion.h1>
            <p className="text-[11px] text-muted-foreground">{list.length} plekken</p>
          </div>
        </div>
      </header>

      {/* 3-koloms Instagram grid — alleen foto's */}
      <div className="grid grid-cols-3 gap-[2px]">
        {list.map((p, i) => (
          <PlaceCard key={p.id} place={p} variant="masonry" index={i} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Nog geen plekken hier</p>
        </div>
      )}
    </div>
  );
}
