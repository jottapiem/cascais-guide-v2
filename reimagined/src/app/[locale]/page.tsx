import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

import { Rail } from "@/components/Rail";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillButton } from "@/components/ui/PillButton";
import {
  getDestination,
  getPlacesByKind,
  getPlacesByKinds,
  getPlacesByLight,
  getQuietPlaces,
  getSignaturePlaces,
} from "@/lib/content";
import { formatCoords } from "@/lib/geo";
import { resolve, type Locale, type Place } from "@/lib/schema/content";

type RailDef = {
  key: string;
  title: string;
  subtitle: string;
  places: readonly Place[];
};

/**
 * Discover — the front page. A typographic hero (the destination as a thesis,
 * with a chart-style bearing readout) followed by a stack of rails. Every rail
 * is a different way into the same 26 places — by light, by shoreline, by
 * quiet — so the feed never reads as one long undifferentiated list.
 */
export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const destination = getDestination();
  const intro = resolve(destination.intro, locale as Locale);

  const rails: RailDef[] = [
    {
      key: "signature",
      title: t("rails.signature.title", { destination: destination.name }),
      subtitle: t("rails.signature.subtitle"),
      places: getSignaturePlaces(6),
    },
    {
      key: "goldenHour",
      title: t("rails.goldenHour.title"),
      subtitle: t("rails.goldenHour.subtitle"),
      places: getPlacesByLight("goldenhour"),
    },
    {
      key: "shoreline",
      title: t("rails.shoreline.title"),
      subtitle: t("rails.shoreline.subtitle"),
      places: getPlacesByKinds("beach", "water"),
    },
    {
      key: "tables",
      title: t("rails.tables.title"),
      subtitle: t("rails.tables.subtitle"),
      places: getPlacesByKind("table"),
    },
    {
      key: "vistas",
      title: t("rails.vistas.title"),
      subtitle: t("rails.vistas.subtitle"),
      places: getPlacesByKind("vista"),
    },
    {
      key: "quiet",
      title: t("rails.quiet.title"),
      subtitle: t("rails.quiet.subtitle"),
      places: getQuietPlaces(2),
    },
    {
      key: "wild",
      title: t("rails.wild.title"),
      subtitle: t("rails.wild.subtitle"),
      places: getPlacesByKind("wild"),
    },
    {
      key: "culture",
      title: t("rails.culture.title"),
      subtitle: t("rails.culture.subtitle"),
      places: getPlacesByKinds("culture", "market"),
    },
    {
      key: "afterdark",
      title: t("rails.afterdark.title"),
      subtitle: t("rails.afterdark.subtitle"),
      places: getPlacesByKind("afterdark"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="pt-2 pb-4">
        <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("hero.heading", { destination: destination.name })}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
          {intro}
        </p>

        <dl className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-2xs tracking-[0.14em] text-text-faint uppercase">
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t("hero.eyebrow")}</dt>
            <dd className="tabular">{formatCoords(destination.center)}</dd>
          </div>
          <span aria-hidden="true" className="h-3 w-px bg-hairline-strong" />
          <dd>{destination.timezone.replace(/_/g, " ")}</dd>
          <span aria-hidden="true" className="h-3 w-px bg-hairline-strong" />
          <dd className="tabular">
            {t("placeCount", { count: destination.places.length })}
          </dd>
        </dl>

        <div className="mt-8">
          <PillButton href="#feed" icon={ArrowDownIcon}>
            {t("hero.action")}
          </PillButton>
        </div>
      </section>

      <div id="feed" className="mt-10 scroll-mt-24 space-y-14 sm:mt-14 sm:space-y-16">
        {rails.map((rail) => (
          <Rail
            key={rail.key}
            title={rail.title}
            subtitle={rail.subtitle}
            places={rail.places}
            priority={rail.key === "signature"}
          />
        ))}
      </div>
    </div>
  );
}
