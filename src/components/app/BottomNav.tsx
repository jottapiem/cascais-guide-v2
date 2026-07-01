"use client";
import { Compass, Heart, Map, Calendar, Backpack } from "lucide-react";
import { useAppStore, type View } from "@/store/app-store";
import { motion } from "framer-motion";
import { haptics } from "@/lib/premium";

const SWIFT_EASE = [0.22, 1, 0.36, 1] as const;

interface NavItem { view: View; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; action: () => void; }

export function BottomNav() {
  const rootView = useAppStore((s) => s.rootView);
  const goHome = useAppStore((s) => s.goHome);
  const goFavorites = useAppStore((s) => s.goFavorites);
  const goMap = useAppStore((s) => s.goMap);
  const goTrips = useAppStore((s) => s.goTrips);
  const goPacking = useAppStore((s) => s.goPacking);

  const items: NavItem[] = [
    { view: "home", label: "Explore", icon: Compass, action: goHome },
    { view: "favorites", label: "Favorieten", icon: Heart, action: goFavorites },
    { view: "map", label: "Kaart", icon: Map, action: goMap },
    { view: "trips", label: "Trips", icon: Calendar, action: goTrips },
    { view: "packing", label: "Tas", icon: Backpack, action: goPacking },
  ];

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur-2xl pb-safe" aria-label="Hoofdnavigatie">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1.5 pt-1.5">
        {items.map((item) => {
          const isActive = rootView === item.view;
          const Icon = item.icon;
          return (
            <motion.button key={item.view} type="button" onClick={() => { item.action(); haptics.selection(); }} aria-label={item.label} aria-current={isActive ? "page" : undefined} whileTap={{ scale: 0.92 }} transition={{ duration: 0.12, ease: SWIFT_EASE }} className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2">
              {isActive && <motion.span layoutId="nav-pill" className="absolute inset-x-2.5 inset-y-0.5 rounded-2xl bg-primary/10" transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.7 }} />}
              <motion.div animate={isActive ? { scale: 1.05, y: -1 } : { scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Icon className={`relative h-[22px] w-[22px] transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.6 : 2} />
              </motion.div>
              <span className={`relative text-[10px] font-semibold tracking-tight transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`} style={{ letterSpacing: "-0.01em" }}>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
