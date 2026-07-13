"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { createPortal, flushSync } from "react-dom";
import { useAppStore } from "@/store/app-store";

const MORPH_DURATION = 480;
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SHEET_OVERLAP = 48; // Hoeveel de sheet achter de foto begint (visuele overlap)

export function TransitionLayer() {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const goDetail = useAppStore((s) => s.goDetail);
  const goBack = useAppStore((s) => s.goBack);
  const clearMorph = useAppStore((s) => s.clearMorph);
  const setMorphPhase = useAppStore((s) => s.setMorphPhase);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!scrimRef.current) return;
    if (morphPhase === "forward") {
      scrimRef.current.classList.add("is-active");
    } else {
      scrimRef.current.classList.remove("is-active");
    }
  }, [morphPhase]);

  useLayoutEffect(() => {
    if (!morphPlace || !containerRef.current) return;
    const origin = morphPlace.origin;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroTop = 0;
    
    // Totale container hoogte = iPhone portrait frame (19.5:9)
    const heroContainerHeight = heroWidth * (19.5 / 9);
    const startContainerHeight = origin.width * (19.5 / 9);

    const el = containerRef.current;

    if (morphPhase === "forward") {
      // START STATE
      el.style.transition = "none";
      el.style.left = origin.left + "px";
      el.style.top = origin.top + "px";
      el.style.width = origin.width + "px";
      el.style.height = startContainerHeight + "px";
      el.style.borderRadius = "28px";
      void el.offsetHeight;

      // ANIMATE TO HERO STATE
      el.style.transition = `left ${MORPH_DURATION}ms ${MORPH_EASE}, top ${MORPH_DURATION}ms ${MORPH_EASE}, width ${MORPH_DURATION}ms ${MORPH_EASE}, height ${MORPH_DURATION}ms ${MORPH_EASE}`;
      el.style.left = heroLeft + "px";
      el.style.top = heroTop + "px";
      el.style.width = heroWidth + "px";
      el.style.height = heroContainerHeight + "px";
      el.style.borderRadius = "48px";

      goDetail(morphPlace.id, morphPlace.sectionId);
      timeoutRef.current = setTimeout(() => {
        setMorphPhase("idle");
      }, MORPH_DURATION);
    } else if (morphPhase === "reverse") {
      // ANIMATE BACK TO START STATE
      el.style.transition = `left ${MORPH_DURATION}ms ${MORPH_EASE}, top ${MORPH_DURATION}ms ${MORPH_EASE}, width ${MORPH_DURATION}ms ${MORPH_EASE}, height ${MORPH_DURATION}ms ${MORPH_EASE}`;
      el.style.left = origin.left + "px";
      el.style.top = origin.top + "px";
      el.style.width = origin.width + "px";
      el.style.height = startContainerHeight + "px";
      el.style.borderRadius = "28px";

      timeoutRef.current = setTimeout(() => {
        flushSync(() => { goBack(); });
        clearMorph();
      }, MORPH_DURATION);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [morphPlace, morphPhase, goDetail, goBack, clearMorph, setMorphPhase]);

  if (!morphPlace) return null;

  return createPortal(
    <>
      <div ref={scrimRef} className="morph-scrim" />
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          zIndex: 90,
          overflow: "hidden",
          willChange: "left, top, width, height",
          opacity: morphPhase === "idle" ? 0 : 1,
          transition: "opacity 0ms ease",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FOTO - Behoudt originele 4:3 ratio, vult bovenkant van container */}
        <img 
          src={morphPlace.coverImage} 
          alt="" 
          style={{ 
            width: "100%", 
            height: "auto",
            aspectRatio: "4 / 3", 
            objectFit: "cover",
            zIndex: 2,
            position: "relative"
          }} 
        />
        {/* SHEET - Vult rest van container, overlapt foto van onderen */}
        <div 
          style={{ 
            flex: 1,
            background: "#F7F6F4",
            borderRadius: "48px 48px 0 0",
            marginTop: `-${SHEET_OVERLAP}px`,
            zIndex: 3,
            opacity: morphPhase === "reverse" ? 0 : 1,
            transition: morphPhase === "reverse" 
              ? "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)" 
              : "opacity 250ms cubic-bezier(0.1, 0.9, 0.2, 1) 50ms"
          }} 
        />
      </div>
    </>,
    document.body
  );
}
