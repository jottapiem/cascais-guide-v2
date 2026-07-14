"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { flushSync } from "react-dom";
import { useAppStore } from "@/store/app-store";

const MORPH_DURATION = 480;
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SHEET_OVERLAP = 48; // Hoeveel de sheet achter de foto begint (visuele overlap)
// Card radius (matches AirbnbCard's 28px frame) vs. hero radius (matches DetailView's
// "48px 48px 0 0" frame + rounded-t-[48px] sheet). The FLIP must interpolate between
// these, not stay pinned to one value, so the hand-off to/from DetailView is seamless.
const CARD_RADIUS = "28px 28px 28px 28px";
const HERO_RADIUS = "28px 28px 28px 28px";

export function TransitionLayer() {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const view = useAppStore((s) => s.view);
  const goDetail = useAppStore((s) => s.goDetail);
  const goBack = useAppStore((s) => s.goBack);
  const clearMorph = useAppStore((s) => s.clearMorph);
  const setMorphPhase = useAppStore((s) => s.setMorphPhase);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!scrimRef.current) return;
    // Scrim stays active during forward morph AND while resting in the detail
    // view (hidden behind it at z-20). It deactivates during reverse so the
    // blur gradually decreases as the image shrinks back to the card.
    const shouldShow = morphPhase === "forward" || (morphPhase === "idle" && view === "detail");
    if (shouldShow) {
      scrimRef.current.classList.add("is-active");
    } else {
      scrimRef.current.classList.remove("is-active");
    }
  }, [morphPhase, view]);

  useLayoutEffect(() => {
    if (!morphPlace || !containerRef.current) return;
    const origin = morphPlace.origin;
    const vw = window.innerWidth;
    
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroTop = 0;
    
    // Totale container hoogte = iPhone portrait frame (19.5:9)
    const heroContainerHeight = heroWidth * (19.5 / 9);
    const startContainerHeight = origin.width * (19.5 / 9);

    const el = containerRef.current;

    if (morphPhase === "forward") {
      // Calculate scale and translate for compositor-only animation
      const scaleX = origin.width / heroWidth;
      const scaleY = startContainerHeight / heroContainerHeight;
      const translateX = origin.left - heroLeft;
      const translateY = origin.top - heroTop;
      
      // START STATE (at origin)
      el.style.transition = "none";
      el.style.width = heroWidth + "px";
      el.style.height = heroContainerHeight + "px";
      el.style.left = heroLeft + "px";
      el.style.top = heroTop + "px";
      el.style.transformOrigin = "top left";
      el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
      el.style.borderRadius = CARD_RADIUS;
      void el.offsetHeight;

      // ANIMATE TO HERO STATE (compositor-only: transform + opacity).
      // Radius must interpolate from the card radius to the hero radius so it
      // hands off seamlessly to DetailView's static "48px 48px 0 0" frame.
      el.style.transition = `transform ${MORPH_DURATION}ms ${MORPH_EASE}, border-radius ${MORPH_DURATION}ms ${MORPH_EASE}`;
      el.style.transform = "translate(0px, 0px) scale(1, 1)";
      el.style.borderRadius = HERO_RADIUS;

      timeoutRef.current = setTimeout(() => {
        goDetail(morphPlace.id, morphPlace.sectionId);
        setMorphPhase("idle");
      }, MORPH_DURATION);
    } else if (morphPhase === "reverse") {
      // ANIMATE BACK TO START STATE (compositor-only)
      const scaleX_rev = origin.width / heroWidth;
      const scaleY_rev = startContainerHeight / heroContainerHeight;
      const translateX_rev = origin.left - heroLeft;
      const translateY_rev = origin.top - heroTop;
      
      // START STATE (at hero — commit via rAF so the browser paints it
      // before the end state is set, ensuring the transition fires)
      el.style.transition = "none";
      el.style.transform = "translate(0px, 0px) scale(1, 1)";
      el.style.borderRadius = HERO_RADIUS;

      requestAnimationFrame(() => {
        el.style.transition = `transform ${MORPH_DURATION}ms ${MORPH_EASE}, border-radius ${MORPH_DURATION}ms ${MORPH_EASE}`;
        el.style.transform = `translate(${translateX_rev}px, ${translateY_rev}px) scale(${scaleX_rev}, ${scaleY_rev})`;
        el.style.borderRadius = CARD_RADIUS;
        timeoutRef.current = setTimeout(() => {
          flushSync(() => { goBack(); });
          clearMorph();
        }, MORPH_DURATION);
      });
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [morphPlace, morphPhase, goDetail, goBack, clearMorph, setMorphPhase]);

  if (!morphPlace) return null;

  return (
    <>
      <div ref={scrimRef} className="morph-scrim" />
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          zIndex: 90,
          overflow: "hidden",
          borderRadius: "28px",
          willChange: "left, top, width, height",
          opacity: morphPhase === "idle" ? 0 : 1,
          transition: "opacity 0ms ease",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FOTO - Behoudt originele 4:3 ratio, vult bovenkant van container */}
        {/* eslint-disable-next-line @next/next/no-img-element -- intentional: raw img for FLIP compositor performance */}
        <img 
          src={morphPlace.coverImage} 
          alt="" 
          style={{ 
            width: "100%", 
            height: "auto",
            aspectRatio: "4 / 3", 
            objectFit: "cover",
            zIndex: 2,
            position: "relative",
            borderRadius: morphPhase === "reverse" ? "28px" : "0px",
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
              ? `opacity ${MORPH_DURATION}ms linear`
              : "opacity 250ms cubic-bezier(0.1, 0.9, 0.2, 1) 50ms"
          }} 
        />
      </div>
    </>
  );
}
