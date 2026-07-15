"use client";

import { useRef, useLayoutEffect, useEffect } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { MORPH_RADIUS_SHEET, MORPH_RADIUS_PX, MORPH_SPRING, SHEET_FADE_END, SCRIM_FADE_END, SHEET_OVERLAP_PX } from "@/lib/morph-config";

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface Geometry {
  originLeft: number; // relative to hero left
  originTop: number; // relative to hero top (0)
  scaleX: number;
  scaleY: number;
  startRadius: number;
}

// Everything the morph animates — position, scale, radius, sheet opacity, scrim
// blur — is derived from ONE spring-driven `progress` value (0 = resting at the card,
// 1 = resting at the hero), computed in applyFrame(). There's no separate "forward"
// vs "reverse" visual logic: both directions just animate the same progress value
// toward a different target, which is what makes interrupting mid-flight (fast
// re-tap, quick back-then-forward) continue smoothly from the live position instead
// of snapping — a plain re-render-driven approach can't do that without jank.
export function TransitionLayer() {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const finishMorphForward = useAppStore((s) => s.finishMorphForward);
  const finishMorphReverse = useAppStore((s) => s.finishMorphReverse);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const geometryRef = useRef<Geometry | null>(null);

  const applyFrame = (t: number) => {
    const g = geometryRef.current;
    const el = containerRef.current;
    if (!g || !el) return;

    const translateX = mix(g.originLeft, 0, t);
    const translateY = mix(g.originTop, 0, t);
    const scaleX = mix(g.scaleX, 1, t);
    const scaleY = mix(g.scaleY, 1, t);
    const radius = mix(g.startRadius, MORPH_RADIUS_PX, t);

    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    el.style.borderRadius = `${radius}px`;
    if (imgRef.current) imgRef.current.style.borderRadius = `${radius}px`;

    // Sheet: fades in/out as a function of progress, finishing shortly before the
    // transform itself arrives (SHEET_FADE_END < 1) so it reads as "attached to the
    // photo," not trailing it.
    if (sheetRef.current) sheetRef.current.style.opacity = String(clamp01(t / SHEET_FADE_END));

    // Scrim: real depth — both opacity AND blur radius ramp with movement, instead of
    // a flat dark overlay snapping in.
    if (scrimRef.current) {
      const s = clamp01(t / SCRIM_FADE_END);
      scrimRef.current.style.opacity = String(s);
      const blurPx = (s * 24).toFixed(1);
      scrimRef.current.style.backdropFilter = `blur(${blurPx}px)`;
      scrimRef.current.style.setProperty("-webkit-backdrop-filter", `blur(${blurPx}px)`);
    }
  };

  useLayoutEffect(() => {
    if (!morphPlace || !containerRef.current) return;
    if (morphPhase === "idle") return; // resting — visibility is handled by the opacity below

    const origin = morphPlace.origin;
    const vw = window.innerWidth;
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroContainerHeight = heroWidth * (19.5 / 9);
    const startContainerHeight = origin.width * (19.5 / 9);

    geometryRef.current = {
      originLeft: origin.left - heroLeft,
      originTop: origin.top,
      scaleX: origin.width / heroWidth,
      scaleY: startContainerHeight / heroContainerHeight,
      startRadius: morphPlace.radius,
    };

    const el = containerRef.current;
    el.style.width = `${heroWidth}px`;
    el.style.height = `${heroContainerHeight}px`;
    el.style.left = `${heroLeft}px`;
    el.style.top = "0px";
    el.style.transformOrigin = "top left";

    controlsRef.current?.stop();

    if (morphPhase === "forward") {
      if (progressRef.current === 0) applyFrame(0); // first open: snap to the card frame, no animation
      controlsRef.current = animate(progressRef.current, 1, {
        ...MORPH_SPRING,
        onUpdate: (v) => {
          progressRef.current = v;
          applyFrame(v);
        },
        onComplete: () => {
          progressRef.current = 1;
          applyFrame(1);
          finishMorphForward();
        },
      });
    } else if (morphPhase === "reverse") {
      controlsRef.current = animate(progressRef.current, 0, {
        ...MORPH_SPRING,
        onUpdate: (v) => {
          progressRef.current = v;
          applyFrame(v);
        },
        onComplete: () => {
          progressRef.current = 0;
          applyFrame(0);
          finishMorphReverse();
        },
      });
    }

    return () => controlsRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morphPlace, morphPhase]);

  // Reset once the morph is fully cleared so the next open starts fresh at the card.
  useEffect(() => {
    if (!morphPlace) progressRef.current = 0;
  }, [morphPlace]);

  if (!morphPlace) return null;

  return (
    <>
      <div ref={scrimRef} className="morph-scrim" style={{ opacity: 0, transition: "none" }} />
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          zIndex: 95, // above the Search/Recommended full-screen overlays (z-90) — cards
          // inside those views can trigger the morph too, and the clone must win.
          overflow: "hidden",
          willChange: "transform, border-radius",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          opacity: morphPhase === "idle" ? 0 : 1,
          transition: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- intentional: raw img for FLIP compositor performance */}
        <img
          ref={imgRef}
          src={morphPlace.coverImage}
          alt=""
          style={{
            width: "100%",
            height: "auto",
            aspectRatio: "4 / 3",
            objectFit: "cover",
            zIndex: 2,
            position: "relative",
          }}
        />
        <div
          ref={sheetRef}
          style={{
            flex: 1,
            background: "#F7F6F4",
            borderRadius: MORPH_RADIUS_SHEET,
            marginTop: `-${SHEET_OVERLAP_PX}px`,
            zIndex: 3,
            opacity: 0,
          }}
        />
      </div>
    </>
  );
}
