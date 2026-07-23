"use client";

import {
  CompassIcon,
  LighthouseIcon,
  MapTrifoldIcon,
  SuitcaseRollingIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactElement, ReactNode } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cx } from "@/lib/cx";

/**
 * AppFrame — the shared shell around every page.
 *
 * Navigation lives in a detached "fluid island": a floating pill that hovers
 * over the page instead of a bar glued to the top edge. The page underneath
 * stays one uninterrupted editorial surface and scrolls behind it, which is
 * what keeps the magazine feeling intact (SPEC §5).
 *
 * Below `md` the island splits in two — identity and settings stay at the top,
 * the three destinations drop to a thumb-reachable dock at the bottom — so the
 * pill never has to shrink its targets to fit a phone.
 *
 * Both islands are `position: fixed`, never scroll containers, so their
 * backdrop filter is composited once instead of on every frame.
 */

const CONTENT_ID = "farol-content";

type NavKey = "discover" | "plan" | "bags";

type NavItem = {
  href: string;
  key: NavKey;
  icon: Icon;
};

/** One destination per product pillar (SPEC §3). Segments stay in English so
 *  a shared URL survives a language switch. */
const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", key: "discover", icon: CompassIcon },
  { href: "/plan", key: "plan", icon: MapTrifoldIcon },
  { href: "/bags", key: "bags", icon: SuitcaseRollingIcon },
];

const ISLAND =
  "rounded-pill border border-hairline bg-surface/85 backdrop-blur-xl backdrop-saturate-150 lift";

function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppFrame({ children }: { children: ReactNode }): ReactElement {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const activeLocale = useLocale();

  return (
    <div className="min-h-dvh">
      <a
        href={`#${CONTENT_ID}`}
        className={cx(
          "sr-only rounded-pill bg-surface-raised px-5 py-3 text-sm font-medium text-text lift",
          "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus-visible:rounded-pill",
        )}
      >
        {t("skipToContent")}
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div
          className={cx(
            ISLAND,
            "pointer-events-auto flex w-full max-w-4xl items-center gap-1 p-1.5 md:w-auto md:gap-2",
          )}
        >
          <Link
            href="/"
            aria-label={t("brand.home")}
            className={cx(
              "flex h-11 shrink-0 items-center gap-2 rounded-pill pr-2 pl-3",
              "focus-visible:rounded-pill",
              "transition-[scale] duration-300 ease-farol motion-safe:active:scale-95",
            )}
          >
            <LighthouseIcon
              weight="light"
              size={22}
              aria-hidden="true"
              className="text-beacon"
            />
            <span className="font-display text-lg leading-none font-semibold tracking-tight">
              {t("brand.name")}
            </span>
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-hairline md:block"
          />

          <nav aria-label={t("label")} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, key, icon: Glyph }) => {
                const active = isActivePath(pathname, href);
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex h-11 items-center gap-2 rounded-pill px-3.5 text-sm",
                        "focus-visible:rounded-pill",
                        "transition-[color,background-color,scale] duration-300 ease-farol motion-safe:active:scale-95",
                        active
                          ? "bg-beacon-wash text-beacon"
                          : "text-text-muted hover:bg-beacon-wash/60 hover:text-text",
                      )}
                    >
                      <Glyph weight="light" size={19} aria-hidden="true" />
                      {t(key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Pushes the settings cluster to the right edge on phones, where the
              destinations have moved to the bottom dock. */}
          <span aria-hidden="true" className="flex-1 md:hidden" />

          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-hairline md:block"
          />

          <div
            role="group"
            aria-label={t("language.label")}
            className="flex shrink-0 items-center rounded-pill bg-ground/70 p-0.5"
          >
            {routing.locales.map((locale) => {
              const active = locale === activeLocale;
              return (
                <Link
                  key={locale}
                  href={pathname}
                  locale={locale}
                  hrefLang={locale}
                  aria-current={active ? "true" : undefined}
                  className={cx(
                    "flex h-10 items-center justify-center rounded-pill px-2.5",
                    "text-2xs font-semibold tracking-[0.16em] uppercase",
                    "focus-visible:rounded-pill",
                    "transition-[color,background-color] duration-300 ease-farol",
                    active
                      ? "bg-surface-raised text-text"
                      : "text-text-faint hover:text-text",
                  )}
                >
                  <span aria-hidden="true">{locale}</span>
                  <span className="sr-only">{t(`language.${locale}`)}</span>
                </Link>
              );
            })}
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Padding clears both islands; pages own their own inner rhythm. */}
      <main
        id={CONTENT_ID}
        tabIndex={-1}
        className="w-full px-4 pt-24 pb-32 focus:outline-none md:px-8 md:pt-28 md:pb-20"
      >
        {children}
      </main>

      <nav
        aria-label={t("label")}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className={cx(ISLAND, "pointer-events-auto flex items-center gap-1 p-1.5")}>
          {NAV_ITEMS.map(({ href, key, icon: Glyph }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex h-14 w-[5.25rem] flex-col items-center justify-center gap-1 rounded-pill",
                    "focus-visible:rounded-pill",
                    "transition-[color,background-color,scale] duration-300 ease-farol motion-safe:active:scale-95",
                    active
                      ? "bg-beacon-wash text-beacon"
                      : "text-text-muted active:text-text",
                  )}
                >
                  <Glyph weight="light" size={22} aria-hidden="true" />
                  <span className="text-2xs leading-none font-medium">
                    {t(key)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default AppFrame;
