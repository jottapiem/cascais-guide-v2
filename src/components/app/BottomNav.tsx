"use client";

import { Home, Compass, Map, Backpack, Heart } from "lucide-react";
import { useAppStore, type View } from "@/store/app-store";
import { motion } from "framer-motion";

interface NavItem {
  view: View;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action: () => void;
}

export function BottomNav() {
  const rootView = useAppStore((s) => s.rootView);
  const goHome = useAppStore((s) => s.goHome);
  const goExplore = useAppStore((s) => s.goExplore);
  const goMap = useAppStore((s) => s.goMap);
  const goPacking = useAppStore((s) => s.goPacking);
  const goFavorites = useAppStore((s) => s.goFavorites);

  const items: NavItem[] = [
    { view: "home",      label: "Home",       icon: Home,    action: goHome },
    { view: "explore",   label: "Explore",    icon: Compass, action: goExplore },
    { view: "map",       label: "Kaart",      icon: Map,     action: goMap },
    { view: "packing",   label: "Tas",        icon: Backpack, action: goPacking },
    { view: "favorites", label: "Favorieten", icon: Heart,   action: goFavorites },
  ];

  return (
    <nav
      className="sticky bottom-0 z-40 glass-strong pb-safe hairline-t"
      aria-label="Hoofdnavigatie"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1.5 pt-1.5">
        {items.map((item) => {
          const isActive = rootView === item.view;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.view}
              type="button"
              onClick={item.action}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2"
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-2.5 inset-y-1 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.7 }}
                />
              )}
              <Icon
                className={`relative transition-all duration-200 h-[23px] w-[23px] ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground scale-100"
                }`}
                strokeWidth={isActive ? 2.6 : 2}
              />
              <span
                className={`relative text-[10px] font-semibold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
