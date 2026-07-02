"use client";

import { useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/store/app-store";

const MORPH_DURATION = 500;
const GREY_DURATION = 250; // Sneller dan foto
const MORPH_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function TransitionLayer() {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const goDetail = useAppStore((s) => s.goDetail);
  const goBack = useAppStore((s) => s.goBack);
  const clearMorph = useAppStore((s) => s.clearMorph);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const greyRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!morphPlace || !imgWrapperRef.current || !greyRef.current) return;
    const origin = morphPlace.origin;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroTop = 0;
    const heroImgHeight = (heroWidth * 3) / 4; // 4:3 foto hoogte op eindpositie
    const greyTargetTop = heroImgHeight;
    const greyTargetHeight = vh - greyTargetTop;

    if (morphPhase === "forward") {
      // === FOTO ===
      // START: exact op origin rect
      imgWrapperRef.current.style.transition = "none";
      imgWrapperRef.current.style.left = `${origin.left}px`;
      imgWrapperRef.current.style.top = `${origin.top}px`;
      imgWrapperRef.current.style.width = `${origin.width}px`;
      imgWrapperRef.current.style.height = `${origin.height}px`;
      imgWrapperRef.current.style.borderRadius = "16px";

      void imgWrapperRef.current.offsetHeight; // reflow

      // PLAY: foto naar hero rect (500ms)
      imgWrapperRef.current.style.transition = `left ${MORPH_DURATION}ms ${MORPH_EASE}, top ${MORPH_DURATION}ms ${MORPH_EASE}, width ${MORPH_DURATION}ms ${MORPH_EASE}, height ${MORPH_DURATION}ms ${MORPH_EASE}`;
      imgWrapperRef.current.style.left = `${heroLeft}px`;
      imgWrapperRef.current.style.top = `${heroTop}px`;
      imgWrapperRef.current.style.width = `${heroWidth}px`;
      imgWrapperRef.current.style.height = `${heroImgHeight}px`;

      // === GREY VLAK ===
      // START: height 0, op origin bottom
      greyRef.current.style.transition = "none";
      greyRef.current.style.left = `${origin.left}px`;
      greyRef.current.style.top = `${origin.top + origin.height}px`;
      greyRef.current.style.width = `${origin.width}px`;
      greyRef.current.style.height = "0px";

      void greyRef.current.offsetHeight; // reflow

      // PLAY: grey naar onderkant scherm (250ms — sneller dan foto)
      greyRef.current.style.transition = `left ${GREY_DURATION}ms ${MORPH_EASE}, top ${GREY_DURATION}ms ${MORPH_EASE}, width ${GREY_DURATION}ms ${MORPH_EASE}, height ${GREY_DURATION}ms ${MORPH_EASE}`;
      greyRef.current.style.left = `${heroLeft}px`;
      greyRef.current.style.top = `${greyTargetTop}px`;
      greyRef.current.style.width = `${heroWidth}px`;
      greyRef.current.style.height = `${greyTargetHeight}px`;

      // On complete: navigeer naar detail (na foto-tijd, niet grey-tijd)
      timeoutRef.current = setTimeout(() => {
        goDetail(morphPlace.id);
      }, MORPH_DURATION);
    } else if (morphPhase === "reverse") {
      // REVERSE foto
      imgWrapperRef.current.style.transition = `left ${MORPH_DURATION}ms ${MORPH_EASE}, top ${MORPH_DURATION}ms ${MORPH_EASE}, width ${MORPH_DURATION}ms ${MORPH_EASE}, height ${MORPH_DURATION}ms ${MORPH_EASE}`;
      imgWrapperRef.current.style.left = `${origin.left}px`;
      imgWrapperRef.current.style.top = `${origin.top}px`;
      imgWrapperRef.current.style.width = `${origin.width}px`;
      imgWrapperRef.current.style.height = `${origin.height}px`;

      // REVERSE grey (sneller terug)
      greyRef.current.style.transition = `left ${GREY_DURATION}ms ${MORPH_EASE}, top ${GREY_DURATION}ms ${MORPH_EASE}, width ${GREY_DURATION}ms ${MORPH_EASE}, height ${GREY_DURATION}ms ${MORPH_EASE}`;
      greyRef.current.style.left = `${origin.left}px`;
      greyRef.current.style.top = `${origin.top + origin.height}px`;
      greyRef.current.style.width = `${origin.width}px`;
      greyRef.current.style.height = "0px";

      timeoutRef.current = setTimeout(() => {
        clearMorph();
        goBack();
      }, MORPH_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [morphPlace, morphPhase, goDetail, goBack, clearMorph]);

  if (!morphPlace) return null;

  return createPortal(
    <>
      {/* Foto layer — animeert van kaart-rect naar hero-rect */}
      <div
        ref={imgWrapperRef}
        style={{
          position: "fixed",
          zIndex: 91,
          overflow: "hidden",
          willChange: "left, top, width, height",
        }}
      >
        <img
          src={morphPlace.coverImage}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Grey layer — snelle expand naar onderkant scherm */}
      <div
        ref={greyRef}
        style={{
          position: "fixed",
          zIndex: 90,
          background: "#E8E8E8",
          willChange: "left, top, width, height",
        }}
      />
    </>,
    document.body
  );
}
