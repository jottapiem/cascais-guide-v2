"use client";

import { MoonStarsIcon, SunIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, type ReactElement } from "react";

import { cx } from "@/lib/cx";

/**
 * ThemeToggle — flips the document between the Paper and Nautical-night
 * palettes and remembers the choice.
 *
 * Theme is stored as an explicit "light" | "dark". The *absence* of a stored
 * value means "follow the OS", which is the default and stays live: flip your
 * system to dark at sunset and the app follows, until you overrule it once.
 *
 * The rendered markup is theme-independent — which icon shows is decided in
 * CSS from the `data-theme` attribute that {@link ThemeScript} has already set
 * before first paint. So there is no flash, no `mounted` gate, and nothing for
 * hydration to reconcile.
 */

const STORAGE_KEY = "farol.theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Blocking bootstrap. Render it as the first thing inside <body>, before any
 * painted content. Kept deliberately tiny, and wrapped in try/catch because
 * Safari's private mode throws on localStorage — a theme is never worth
 * breaking the page over. Every branch ends with `data-theme` set.
 */
const BOOTSTRAP = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)});var t=(s==="light"||s==="dark")?s:(window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function ThemeScript(): ReactElement {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />;
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function storedTheme(): "light" | "dark" | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function ThemeToggle(): ReactElement {
  const t = useTranslations("nav.theme");

  // Keep following the OS for as long as no explicit choice has been made.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);

    function follow(): void {
      if (storedTheme() !== null) return;
      document.documentElement.dataset.theme = systemTheme();
    }

    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  function toggle(): void {
    const root = document.documentElement;
    const current =
      root.dataset.theme === "dark" || root.dataset.theme === "light"
        ? root.dataset.theme
        : systemTheme();
    const next = current === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the choice simply lasts for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={t("toggle")}
      aria-label={t("toggle")}
      className={cx(
        "flex size-11 shrink-0 items-center justify-center rounded-pill text-text-muted",
        "focus-visible:rounded-pill",
        "transition-[color,background-color,scale] duration-300 ease-farol",
        "hover:bg-beacon-wash hover:text-text motion-safe:active:scale-95",
      )}
    >
      {/* Each icon shows the palette you would switch *to*, so the control
          reads as an action rather than as a status light. */}
      <MoonStarsIcon
        weight="light"
        size={21}
        aria-hidden="true"
        className="[html[data-theme=dark]_&]:hidden"
      />
      <SunIcon
        weight="light"
        size={21}
        aria-hidden="true"
        className="hidden [html[data-theme=dark]_&]:block"
      />
    </button>
  );
}

export default ThemeToggle;
