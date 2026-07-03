"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/store/app-store";

const MORPH_DURATION = 420;
const GREY_DURATION = 250;
const MORPH_EASE = "cubic-bezier(0.1, 0.9, 0.2, 1)";

export function TransitionLayer() {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const goDetail = useAppStore((s) => s.goDetail);
  const goBack = useAppStore((s) => s.goBack);
  const clearMorph = useAppStore((s) => s.clearMorph);
  const setMorphPhase = useAppStore((s) => s.setMorphPhase);

  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const greyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!scrimRef.current) return;
    // Only show scrim during FORWARD morph. Reverse must not darken.
    if (morphPhase === "forward") {
      scrimRef.current.classList.add("is-active");
    } else {
      scrimRef.current.classList.remove("is-active");
    }
  }, [morphPhase]);

  useLayoutEffect(() => {
    if (!morphPlace || !imgWrapperRef.current || !greyRef.current) return;
    const origin = morphPlace.origin;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroTop = 0;
    const heroImgHeight = (heroWidth * 3) / 4;
    const greyTargetTop = heroImgHeight - 48;
    const greyTargetHeight = vh - greyTargetTop;

    if (morphPhase === "forward") {
      imgWrapperRef.current.style.transition = "none";
      imgWrapperRef.current.style.left = origin.left + "px";
      imgWrapperRef.current.style.top = origin.top + "px";
      imgWrapperRef.current.style.width = origin.width + "px";
      imgWrapperRef.current.style.height = origin.height + "px";
      imgWrapperRef.current.style.borderRadius = "16px";
      // Radius is now interpolated inside the animation frame loop
      void imgWrapperRef.current.offsetHeight;
      imgWrapperRef.current.style.transition = "left " + MORPH_DURATION + "ms " + MORPH_EASE + ", top " + MORPH_DURATION + "ms " + MORPH_EASE + ", width " + MORPH_DURATION + "ms " + MORPH_EASE + ", height " + MORPH_DURATION + "ms " + MORPH_EASE;
      imgWrapperRef.current.style.left = heroLeft + "px";
      imgWrapperRef.current.style.top = heroTop + "px";
      imgWrapperRef.current.style.width = heroWidth + "px";
      imgWrapperRef.current.style.height = heroImgHeight + "px";
      
      // Animate border-radius via rAF
      const start_time = performance.now();
      const animate_radius = () => {
        const elapsed = performance.now() - start_time;
        const t = Math.min(elapsed / MORPH_DURATION, 1);
        const r = 16 + (48 - 16) * t;
        if (imgWrapperRef.current) imgWrapperRef.current.style.borderRadius = r + "px " + r + "px 0 0";
        if (t < 1) requestAnimationFrame(animate_radius);
      };
      requestAnimationFrame(animate_radius);

      greyRef.current.style.transition = "none";
      greyRef.current.style.left = origin.left + "px";
      greyRef.current.style.top = (origin.top + origin.height - 48) + "px";
      greyRef.current.style.width = origin.width + "px";
      greyRef.current.style.height = "0px";
      void greyRef.current.offsetHeight;
      greyRef.current.style.transition = "left " + GREY_DURATION + "ms " + MORPH_EASE + ", top " + GREY_DURATION + "ms " + MORPH_EASE + ", width " + GREY_DURATION + "ms " + MORPH_EASE + ", height " + GREY_DURATION + "ms " + MORPH_EASE;
      greyRef.current.style.left = heroLeft + "px";
      greyRef.current.style.top = greyTargetTop + "px";
      greyRef.current.style.width = heroWidth + "px";
      greyRef.current.style.height = greyTargetHeight + "px";
      greyRef.current.style.borderRadius = "2rem 2rem 0 0";

      timeoutRef.current = setTimeout(() => {
        goDetail(morphPlace.id);
        setMorphPhase("idle");
      }, MORPH_DURATION);
    } else if (morphPhase === "reverse") {
      imgWrapperRef.current.style.transition = "left " + MORPH_DURATION + "ms " + MORPH_EASE + ", top " + MORPH_DURATION + "ms " + MORPH_EASE + ", width " + MORPH_DURATION + "ms " + MORPH_EASE + ", height " + MORPH_DURATION + "ms " + MORPH_EASE;
      imgWrapperRef.current.style.left = origin.left + "px";
      imgWrapperRef.current.style.top = origin.top + "px";
      imgWrapperRef.current.style.width = origin.width + "px";
      imgWrapperRef.current.style.height = origin.height + "px";
      
      // Animate border-radius via rAF (reverse)
      const start_time_rev = performance.now();
      const animate_radius_rev = () => {
        const elapsed = performance.now() - start_time_rev;
        const t = Math.min(elapsed / MORPH_DURATION, 1);
        const r = 48 + (16 - 48) * t;
        if (imgWrapperRef.current) imgWrapperRef.current.style.borderRadius = r + "px " + r + "px 0 0";
        if (t < 1) requestAnimationFrame(animate_radius_rev);
      };
      requestAnimationFrame(animate_radius_rev);

      greyRef.current.style.transition = "left " + GREY_DURATION + "ms " + MORPH_EASE + ", top " + GREY_DURATION + "ms " + MORPH_EASE + ", width " + GREY_DURATION + "ms " + MORPH_EASE + ", height " + GREY_DURATION + "ms " + MORPH_EASE;
      greyRef.current.style.left = origin.left + "px";
      greyRef.current.style.top = (origin.top + origin.height - 48) + "px";
      greyRef.current.style.width = origin.width + "px";
      greyRef.current.style.height = "0px";
      greyRef.current.style.borderRadius = "2rem 2rem 0 0";

      timeoutRef.current = setTimeout(() => { clearMorph(); goBack(); }, MORPH_DURATION);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [morphPlace, morphPhase, goDetail, goBack, clearMorph, setMorphPhase]);

  if (!morphPlace) return null;

  return createPortal(
    <>
      <div ref={scrimRef} className="morph-scrim" />
      <div
        ref={imgWrapperRef}
        style={{ position: "fixed", zIndex: 90, overflow: "hidden", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))", willChange: "left, top, width, height", opacity: morphPhase === "idle" ? 0 : 1, transition: "opacity 0ms ease" }}
      >
        <img src={morphPlace.coverImage} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div
        ref={greyRef}
        style={{
          position: "fixed",
          zIndex: 95,
          background: "#F7F6F4",
          borderRadius: "48px 48px 0 0",
          willChange: "left, top, width, height",
          opacity: morphPhase === "idle" ? 0 : 1,
          transition: "opacity 0ms ease",
          pointerEvents: "none",
        }}
      />
    </>,
    document.body
  );
}
