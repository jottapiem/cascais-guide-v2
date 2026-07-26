"use client";

import { useRef, useLayoutEffect, useEffect, useMemo } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { ChevronLeft, Heart } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getPlace } from "@/lib/places-data";
import {
  MORPH_RADIUS_HERO_PX,
  MORPH_RADIUS_HERO_SHEET,
  MORPH_SPRING,
  MORPH_SPRING_REDUCED,
  MORPH_RADIUS_SNAP_PROGRESS,
  MORPH_CHROME_FADE_START,
  MORPH_HOLD_MS,
  MORPH_CROSSFADE_MS,
  SHEET_FADE_END,
  SCRIM_FADE_END,
  SCRIM_LIGHT_FADE_END,
  SCRIM_BLUR_PX,
  SCRIM_BLUR_LIGHT_PX,
  SHEET_OVERLAP_PX,
  BASE_VIEW_RECEDE_SCALE,
  clamp01,
  mix,
  shouldRetargetMidFlight,
  retargetGeometry,
  type MorphGeometry,
} from "@/lib/morph-config";
import { PlaceImage } from "./PlaceImage";

interface TransitionLayerProps {
  // Ref to the base-view element (AppShell's <main>) that should recede/scale during
  // the morph — see BASE_VIEW_RECEDE_SCALE in morph-config.ts for why this is a prop
  // (imperative DOM write from here) rather than AppShell animating its own element.
  baseViewRef?: React.RefObject<HTMLElement | null>;
}

// Everything the morph animates — position, scale, per-corner radius, sheet opacity,
// chrome (title-bar chrome) opacity, scrim blur, background recede — is derived from
// ONE spring-driven `progress` value (0 = resting at the card, 1 = resting at the
// hero), computed in applyFrame(). There's no separate "forward" vs "reverse" visual
// logic: both directions just animate the same progress value toward a different
// target, which is what makes interrupting mid-flight (fast re-tap, quick
// back-then-forward) continue smoothly from the live position instead of snapping — a
// plain re-render-driven approach can't do that without jank.
//
// Sequencing model (see docs/transition-notes.md for the full write-up):
//   progress 0                          MORPH_RADIUS_SNAP_PROGRESS        progress 1     +MORPH_HOLD_MS (0)
//   |-- position/scale/opacity morph -->|-- bottom-radius snaps, chrome starts fading in -->|-- crossfade into real content -->
//
// T3 (crossfade) falls out of the architecture for free: this whole clone is ONE
// fading subtree, so "the clone leaves at the same instant the real sheet arrives"
// doesn't need separate choreography — it's one opacity transition on one container.
// The hold between T2 and T3 is now 0: there is no content to wait for, and watching
// it run showed the wait was the most conspicuous thing about the whole transition.
// See MORPH_HOLD_MS in morph-config.ts.
export function TransitionLayer({ baseViewRef }: TransitionLayerProps) {
  const morphPlace = useAppStore((s) => s.morphPlace);
  const morphPhase = useAppStore((s) => s.morphPhase);
  const finishMorphForward = useAppStore((s) => s.finishMorphForward);
  const finishMorphReverse = useAppStore((s) => s.finishMorphReverse);
  const favorites = useAppStore((s) => s.favorites);

  const place = morphPlace ? getPlace(morphPlace.id) : undefined;
  const isFav = morphPlace ? favorites.includes(morphPlace.id) : false;

  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimLightRef = useRef<HTMLDivElement>(null);
  const scrimHeavyRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const geometryRef = useRef<MorphGeometry | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardInstanceRef = useRef<string | null>(null);

  // matchMedia is read once per mount — acceptable here since a user changing their
  // OS-level motion preference mid-session is rare, and re-checking on every morph
  // would mean touching `window` in the hot path.
  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const spring = prefersReducedMotion ? MORPH_SPRING_REDUCED : MORPH_SPRING;
  const holdMs = prefersReducedMotion ? 0 : MORPH_HOLD_MS;

  const applyFrame = (t: number) => {
    const g = geometryRef.current;
    const el = containerRef.current;
    if (!g || !el) return;

    const translateX = mix(g.originLeft, 0, t);
    const translateY = mix(g.originTop, 0, t);
    const scaleX = mix(g.scaleX, 1, t);
    const scaleY = mix(g.scaleY, 1, t);

    // Per-corner radius: the top corners keep interpolating to MORPH_RADIUS_HERO_PX
    // (not frozen at the source card radius). The reference observation freezes the
    // top corners because Airbnb's hero ends up edge-to-edge, so leaving them at the
    // source rounding is what makes them land on the *device's* physical screen-corner
    // radius. This app's hero is never edge-to-edge — it rests as a rounded card inset
    // in a max-w-md column (MORPH_RADIUS_HERO_PX from morph-config.ts) — so freezing
    // the top corners here would leave them under-rounded relative to the design
    // system's own target radius. Bottom corners still get the literal described
    // behavior: hold at the source radius, then hard-snap (no easing) to 0 once the
    // shape-extension threshold passes, since the bottom edge is what tucks under the
    // sheet and 0 is structurally correct there regardless of edge-to-edge-ness.
    const topRadius = mix(g.startRadius, MORPH_RADIUS_HERO_PX, t);
    const bottomRadius = t < MORPH_RADIUS_SNAP_PROGRESS ? g.startRadius : 0;

    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    el.style.clipPath = `inset(0 round ${topRadius}px ${topRadius}px ${bottomRadius}px ${bottomRadius}px)`;

    // Sheet: fades in as a function of progress, finishing shortly before the
    // transform itself arrives (SHEET_FADE_END < 1) so it reads as "attached to the
    // photo," not trailing it.
    if (sheetRef.current) sheetRef.current.style.opacity = String(clamp01(t / SHEET_FADE_END));

    // Chrome (back button / type badge / favorite button): starts fading in once the
    // shape-extension is basically done, finishing exactly when the position/scale
    // morph lands — landing together is the point, not a coincidence.
    if (chromeRef.current) {
      chromeRef.current.style.opacity = String(clamp01((t - MORPH_CHROME_FADE_START) / (1 - MORPH_CHROME_FADE_START)));
    }

    // Scrim: two constant-blur layers cross-faded by progress fake a continuously
    // *increasing* blur without ever animating `backdrop-filter` itself (Chromium
    // interpolates that janky — see coding-standards.md).
    if (scrimLightRef.current) scrimLightRef.current.style.opacity = String(clamp01(t / SCRIM_LIGHT_FADE_END));
    if (scrimHeavyRef.current) scrimHeavyRef.current.style.opacity = String(clamp01(t / SCRIM_FADE_END));

    // Background recede (E11 — scale half): the base view scales down in the same
    // window as everything else here. See BASE_VIEW_RECEDE_SCALE in morph-config.ts
    // for why this scales <main> specifically and not an ancestor of this clone.
    if (baseViewRef?.current) {
      baseViewRef.current.style.transform = `scale(${mix(1, BASE_VIEW_RECEDE_SCALE, t)})`;
    }
  };

  useLayoutEffect(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (!morphPlace || !containerRef.current) return;
    if (morphPhase === "idle") {
      // Resting at the detail page. Nothing here should still be visible on a
      // phone-width viewport (DetailOverlay is opaque edge-to-edge), but the scrim is
      // a position:fixed, full-viewport layer — on wider (sm:) breakpoints where the
      // app shell sits in a centered max-w-md column with visible margins either side,
      // an un-cleared scrim would keep blurring those margins for as long as the
      // detail page stays open. Fade it out over the same duration as the clone's own
      // crossfade so it doesn't read as a separate, mistimed event. willChange is
      // dropped once things are static — nothing more is scheduled to change here
      // until the next forward/reverse run resets it below.
      if (scrimLightRef.current) {
        scrimLightRef.current.style.transition = `opacity ${MORPH_CROSSFADE_MS}ms ease-out`;
        scrimLightRef.current.style.opacity = "0";
      }
      if (scrimHeavyRef.current) {
        scrimHeavyRef.current.style.transition = `opacity ${MORPH_CROSSFADE_MS}ms ease-out`;
        scrimHeavyRef.current.style.opacity = "0";
      }
      if (baseViewRef?.current) baseViewRef.current.style.willChange = "auto";
      return;
    }

    controlsRef.current?.stop();

    const origin = morphPlace.origin;
    const vw = window.innerWidth;
    const heroWidth = Math.min(vw, 448);
    const heroLeft = (vw - heroWidth) / 2;
    const heroContainerHeight = heroWidth * (19.5 / 9);
    const startContainerHeight = origin.width * (19.5 / 9);

    const isFreshTarget = morphPlace.cardInstanceId !== cardInstanceRef.current;
    const prevGeometry = geometryRef.current;
    const t0 = progressRef.current;
    const restingAtHero = t0 >= 0.999;

    // Two different re-target scenarios need different handling:
    //  - Resting at the hero (t0 basically 1) and a DIFFERENT card is tapped — e.g. a
    //    related-place card from an already-open detail page. The clone should visibly
    //    fly from THAT card's real on-screen position, so geometry uses its real rect
    //    and progress resets to 0 (existing, tested behavior).
    //  - Genuinely mid-flight (0 < t0 < ~1) and a DIFFERENT card is tapped — e.g. a
    //    fast tap on two different cards in a row. Snapping to the new card's real
    //    rect here would make the clone teleport, because geometry changes but
    //    progress doesn't reset — animate(t0, 1, ...) against fresh geometry is not a
    //    no-op like the resting case, it's a jump the instant the next spring frame
    //    runs. Instead, retarget smoothly from wherever the clone currently sits —
    //    computed with the same mix() applyFrame already uses each frame — since the
    //    target (the hero) is identical either way, only the *origin* needs to change.
    //    Top-corner radius carries over continuously this way; a retarget landing
    //    after the bottom-radius snap threshold can still show a brief bottom-corner
    //    correction — a narrow, sub-300ms edge case judged an acceptable trade-off
    //    against fully modeling both corners independently through a retarget.
    const midFlightRetarget = shouldRetargetMidFlight({
      phase: morphPhase,
      isFreshTarget,
      hasPreviousGeometry: !!prevGeometry,
      progress: t0,
    });

    if (midFlightRetarget && prevGeometry) {
      geometryRef.current = retargetGeometry(prevGeometry, t0, MORPH_RADIUS_HERO_PX);
      progressRef.current = 0;
    } else {
      geometryRef.current = {
        originLeft: origin.left - heroLeft,
        originTop: origin.top,
        scaleX: origin.width / heroWidth,
        scaleY: startContainerHeight / heroContainerHeight,
        startRadius: morphPlace.radius,
      };
      if (morphPhase === "forward" && isFreshTarget && restingAtHero) {
        progressRef.current = 0;
      }
    }
    cardInstanceRef.current = morphPlace.cardInstanceId;

    // A fresh forward/reverse run is about to drive opacity per-frame via applyFrame —
    // clear any CSS transition the idle branch above may have left on the scrim so
    // those imperative writes aren't fighting a lingering 260ms fade (which would make
    // the scrim visibly lag a frame or more behind the spring).
    if (scrimLightRef.current) scrimLightRef.current.style.transition = "none";
    if (scrimHeavyRef.current) scrimHeavyRef.current.style.transition = "none";
    if (baseViewRef?.current) baseViewRef.current.style.willChange = "transform";

    const el = containerRef.current;
    el.style.width = `${heroWidth}px`;
    el.style.height = `${heroContainerHeight}px`;
    el.style.left = `${heroLeft}px`;
    el.style.top = "0px";
    el.style.transformOrigin = "top left";

    if (morphPhase === "forward") {
      if (progressRef.current === 0) applyFrame(0); // first open / retarget: snap to the start frame, no pop
      controlsRef.current = animate(progressRef.current, 1, {
        ...spring,
        onUpdate: (v) => {
          progressRef.current = v;
          applyFrame(v);
        },
        onComplete: () => {
          progressRef.current = 1;
          applyFrame(1);
          // T2 reached. Hand off to the real content. MORPH_HOLD_MS is 0, so this
          // timeout only defers to the next macrotask — the hold's code path is kept
          // intact so the pause can be reintroduced without restructuring anything.
          holdTimeoutRef.current = setTimeout(() => {
            holdTimeoutRef.current = null;
            finishMorphForward();
          }, holdMs);
        },
      });
    } else if (morphPhase === "reverse") {
      controlsRef.current = animate(progressRef.current, 0, {
        ...spring,
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

    return () => {
      controlsRef.current?.stop();
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morphPlace, morphPhase]);

  // Reset once the morph is fully cleared so the next open starts fresh at the card —
  // and so the base view can't ever be left stuck mid-recede if this unmounts (or
  // morphPlace clears) before a reverse run's onComplete had a chance to settle it.
  useEffect(() => {
    if (!morphPlace) {
      progressRef.current = 0;
      cardInstanceRef.current = null;
      if (baseViewRef?.current) {
        baseViewRef.current.style.transform = "";
        baseViewRef.current.style.willChange = "auto";
      }
    }
  }, [morphPlace, baseViewRef]);

  if (!morphPlace) return null;

  const crossfadeTransition = morphPhase === "idle" ? `opacity ${MORPH_CROSSFADE_MS}ms ease-out` : "none";

  return (
    <>
      <div ref={scrimLightRef} className="morph-scrim" style={{ opacity: 0, transition: "none", background: "transparent", backdropFilter: `blur(${SCRIM_BLUR_LIGHT_PX}px)`, WebkitBackdropFilter: `blur(${SCRIM_BLUR_LIGHT_PX}px)` }} />
      <div ref={scrimHeavyRef} className="morph-scrim" style={{ opacity: 0, transition: "none", backdropFilter: `blur(${SCRIM_BLUR_PX}px)`, WebkitBackdropFilter: `blur(${SCRIM_BLUR_PX}px)` }} />
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          zIndex: 95, // above the Search/Recommended full-screen overlays (z-90) — cards
          // inside those views can trigger the morph too, and the clone must win.
          overflow: "hidden",
          willChange: "transform, opacity",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          opacity: morphPhase === "idle" ? 0 : 1,
          transition: crossfadeTransition,
        }}
      >
        <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: `${MORPH_RADIUS_HERO_PX}px`, zIndex: 2 }}>
          <PlaceImage src={morphPlace.coverImage} alt="" />

          {/* Chrome: back button / type badge / favorite button — E6/E8.
              Deliberately the SAME markup+positioning as DetailOverlay's real header
              buttons (see DetailView.tsx) so the T3 hand-off is a pixel-aligned swap,
              not a visible pop. pointer-events: none — these are decorative during the
              morph; the real, interactive buttons take over the instant DetailOverlay
              mounts underneath. No floating title text here: this app's resting design
              has no header-bar title (the place name lives in the sheet), so E6 is
              represented by the type badge rather than inventing new title text. */}
          <div ref={chromeRef} className="pointer-events-none absolute inset-0 z-10" style={{ opacity: 0 }}>
            <div style={{ top: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }} className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl">
              <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
            </div>
            <div style={{ top: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }} className="absolute right-4 flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur-xl">
                {place?.type ?? ""}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xl">
                <Heart className={`h-[1.125rem] w-[1.125rem] ${isFav ? "fill-accent text-accent" : "text-white"}`} strokeWidth={2.4} />
              </span>
            </div>
            {/* E7 (loading spinner) deliberately absent. The reference shows one
                because it is waiting on a network fetch; this app's place data is
                bundled, so a spinner here turns over a photo that is already fully
                decoded and on screen — it reads as manufactured latency. Removing it
                also makes this chrome an exact match for DetailOverlay's real header,
                which is what keeps the T3 hand-off from popping. See MORPH_HOLD_MS. */}
          </div>
        </div>
        <div
          ref={sheetRef}
          style={{
            flex: 1,
            background: "#F7F6F4",
            borderRadius: MORPH_RADIUS_HERO_SHEET,
            boxShadow: "0px -8px 24px 0px rgba(0,0,0,0.08)",
            marginTop: `-${SHEET_OVERLAP_PX}px`,
            zIndex: 3,
            opacity: 0,
          }}
        />
      </div>
    </>
  );
}
