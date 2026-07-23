import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactElement, ReactNode } from "react";
import AppFrame from "@/components/AppFrame";
import { ThemeScript } from "@/components/ThemeToggle";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/schema/content";
import "../globals.css";

/**
 * Fraunces carries the whole editorial voice (SPEC §5). The optical-size axis
 * keeps huge place names from looking spindly and small labels from looking
 * clogged; SOFT and WONK are what stop it reading as a generic serif.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Ground colours per scheme — kept in sync with the tokens in globals.css. */
const GROUND_LIGHT = "#f1f0ec";
const GROUND_DARK = "#080f16";

export function generateStaticParams(): Array<{ locale: Locale }> {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The island nav sits in the safe areas, so we opt into the full display.
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: GROUND_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: GROUND_DARK },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const active = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale: active, namespace: "meta" });

  return {
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: "Farol",
    manifest: "/manifest.webmanifest",
    // Private by default (SPEC §2). Individual shareable pages opt back in.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    appleWebApp: {
      capable: true,
      title: "Farol",
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<ReactElement> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this subtree into static rendering for the locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      // The theme bootstrap writes data-theme before React sees the document.
      suppressHydrationWarning
      className={`${fraunces.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-dvh bg-ground font-sans text-text antialiased">
        <ThemeScript />
        <NextIntlClientProvider>
          <AppFrame>{children}</AppFrame>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
