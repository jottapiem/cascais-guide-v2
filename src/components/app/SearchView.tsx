"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, ArrowLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { search, POPULAR_SEARCHES } from "@/lib/search-engine";
import { PlaceCard } from "./PlaceCard";

export function SearchView() {
  const goBack = useAppStore((s) => s.goBack);
  const goDetail = useAppStore((s) => s.goDetail);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => search(query), [query]);

  const example = "strand zonsondergang rustig";

  return (
    <div className="min-h-screen pb-6">
      {/* Search bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 glass pt-safe">
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/80 transition-colors hover:bg-secondary active:scale-95"
            aria-label="Terug"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-secondary px-4 py-2.5">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek op vibe, categorie, buurt…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Wissen">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </header>

      {!query.trim() && (
        <div className="px-4 pt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Probeer eens</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full bg-secondary px-3.5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
            <p className="text-sm font-semibold">Slim zoeken</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Combineer meerdere woorden. Bijvoorbeeld:
            </p>
            <button
              type="button"
              onClick={() => setQuery(example)}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {example} <ChevronRight className="h-3 w-3" />
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              De zoekmachine begrijpt synoniemen en typefouten.
            </p>
          </div>
        </div>
      )}

      {query.trim() && (
        <div className="px-4 pt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            {results.length} resultaat{results.length === 1 ? "" : "ten"} voor <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
          </p>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={query}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-2.5"
            >
              {results.map((r, i) => (
                <PlaceCard key={r.place.id} place={r.place} variant="grid" index={i} sectionId="search" />
              ))}
            </motion.div>
          </AnimatePresence>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <SearchIcon className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Niets gevonden</p>
              <p className="text-xs text-muted-foreground">Probeer andere zoekwoorden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
