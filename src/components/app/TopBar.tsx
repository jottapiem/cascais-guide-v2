"use client";

import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

interface TopBarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  transparent?: boolean;
}

export function TopBar({ title, subtitle, right, showBack = true, transparent = false }: TopBarProps) {
  const goBack = useAppStore((s) => s.goBack);
  return (
    <header
      className={`sticky top-0 z-30 pt-safe-lg ${transparent ? "" : "glass-strong hairline-b"}`}
    >
      <div className="mx-auto flex max-w-md items-center gap-2.5 px-4 pb-2.5 pt-2">
        {showBack ? (
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-foreground ring-1 ring-black/[0.04] transition-all hover:bg-secondary active:scale-90"
            aria-label="Terug"
          >
            <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={2.6} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="truncate text-[20px] font-bold tracking-[-0.02em]"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className="truncate text-[11px] font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
