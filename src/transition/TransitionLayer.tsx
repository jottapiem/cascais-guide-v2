"use client";

import { useTransitionStore } from "./transition-store";

export default function TransitionLayer() {
  const { state, from, progress } = useTransitionStore();

  if (!from || state === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <img
        src={from.image}
        style={{
          position: "absolute",
          top: from.rect.top,
          left: from.rect.left,
          width: from.rect.width,
          height: from.rect.height,
          transform: `scale(${1 + progress * 0.2})`,
          transition: "none",
          objectFit: "cover",
          borderRadius: "24px",
        }}
      />
    </div>
  );
}
