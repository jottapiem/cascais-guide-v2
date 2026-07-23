import {
  ArrowUpRightIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

import { Bezel } from "@/components/ui/Bezel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Meter, type MeterTone } from "@/components/ui/Meter";
import { PillButton } from "@/components/ui/PillButton";
import { Link } from "@/i18n/navigation";
import { getAllPlaces, getPlaceBySlug } from "@/lib/content";
import { formatCoords, mapsDirectionsUrl } from "@/lib/geo";
import { resolve, type Locale } from "@/lib/schema/content";

type PlaceParams = { locale: string; slug: string };

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllPlaces().map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PlaceParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const place = getPlaceBySlug(slug);
  if (!place) return {};
  return {
    title: place.name,
    description: resolve(place.tagline, locale as Locale),
  };
}

/** Busyness reads as a virtue when low and a warning when high. */
function busynessTone(value: number): MeterTone {
  if (value >= 4) return "critical";
  if (value <= 2) return "positive";
  return "neutral";
}

export default async function PlacePage({
  params,
}: {
  params: Promise<PlaceParams>;
}): Promise<ReactElement> {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const place = getPlaceBySlug(slug);
  if (!place) notFound();

  const t = await getTranslations("place");
  const loc = locale as Locale;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:rounded-pill"
      >
        <CaretLeftIcon weight="bold" size={16} aria-hidden="true" />
        {t("backToOverview")}
      </Link>

      <Bezel
        as="figure"
        elevated
        className="mt-4"
        coreClassName="relative aspect-[4/3]"
      >
        <Image
          src={place.cover.src}
          alt={resolve(place.cover.alt, loc)}
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          priority
          className="object-cover"
        />
        <figcaption className="absolute top-4 left-4 rounded-pill bg-surface/80 px-3 py-1 text-2xs font-semibold tracking-[0.14em] text-text uppercase backdrop-blur-md backdrop-saturate-150">
          {t(`kinds.${place.kind}`)}
        </figcaption>
      </Bezel>

      <header className="mt-7">
        <Eyebrow>{place.area}</Eyebrow>
        <h1 className="mt-2 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
          {place.name}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-text-muted text-balance sm:text-xl">
          {resolve(place.tagline, loc)}
        </p>
      </header>

      <dl className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-hairline bg-surface p-5">
          <dt className="eyebrow">{t("bestLight.label")}</dt>
          <dd className="mt-2 font-display text-xl font-semibold text-text">
            {t(`bestLight.values.${place.bestLight}`)}
          </dd>
          <p className="mt-1 text-sm text-text-muted">
            {t(`bestLight.hints.${place.bestLight}`)}
          </p>
        </div>
        <div className="rounded-card border border-hairline bg-surface p-5">
          <dt className="eyebrow">{t("busyness.label")}</dt>
          <dd className="mt-3">
            <Meter
              value={place.busyness}
              label={t("busyness.label")}
              valueLabel={t(`busyness.levels.${place.busyness}`)}
              tone={busynessTone(place.busyness)}
            />
          </dd>
        </div>
      </dl>

      {place.notes.length > 0 && (
        <section className="mt-12">
          <Eyebrow rule>{t("insider.title")}</Eyebrow>
          <p className="mt-1.5 text-sm text-text-muted">
            {t("insider.subtitle")}
          </p>
          <ul className="mt-5 space-y-3">
            {place.notes.map((note, index) => (
              <li
                key={index}
                className="flex gap-3.5 rounded-card border border-hairline bg-surface p-4"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-beacon-wash"
                >
                  <span className="size-1.5 rounded-full bg-beacon" />
                </span>
                <p className="text-sm leading-relaxed text-text sm:text-base">
                  {resolve(note, loc)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {place.gallery.length > 0 && (
        <section className="mt-12">
          <Eyebrow rule>{t("gallery")}</Eyebrow>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {place.gallery.map((photo, index) => (
              <Bezel key={index} as="figure" coreClassName="relative aspect-square">
                <Image
                  src={photo.src}
                  alt={resolve(photo.alt, loc)}
                  fill
                  sizes="(min-width: 768px) 24rem, 50vw"
                  className="object-cover"
                />
              </Bezel>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <Eyebrow rule>{t("map.title")}</Eyebrow>
        <div className="mt-5 flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="tabular font-mono text-sm tracking-[0.1em] text-text">
              {formatCoords(place.coords)}
            </p>
            <p className="mt-1 text-2xs font-semibold tracking-[0.16em] text-text-faint uppercase">
              {place.area}
            </p>
          </div>
          <PillButton
            href={mapsDirectionsUrl(place.coords)}
            icon={ArrowUpRightIcon}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("map.open")}
          </PillButton>
        </div>
      </section>

      {(place.activities.length > 0 || place.tags.length > 0) && (
        <section className="mt-12 grid gap-8 sm:grid-cols-2">
          {place.activities.length > 0 && (
            <div>
              <Eyebrow rule>{t("activities")}</Eyebrow>
              <ul className="mt-4 flex flex-wrap gap-2">
                {place.activities.map((activity) => (
                  <li
                    key={activity}
                    className="rounded-pill border border-hairline bg-surface-raised px-3.5 py-1.5 text-sm text-text-muted"
                  >
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {place.tags.length > 0 && (
            <div>
              <Eyebrow rule>{t("tags")}</Eyebrow>
              <ul className="mt-4 flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-pill border border-hairline bg-surface-raised px-3.5 py-1.5 text-sm text-text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
