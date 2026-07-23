import { SunHorizonIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactElement } from "react";

import { Link } from "@/i18n/navigation";
import { resolve, type Locale, type Place } from "@/lib/schema/content";

/**
 * PlaceCard — the repeated unit of the Discover feed and the thing that later
 * morphs into a detail hero (SPEC §6). A tall editorial frame carrying the
 * cover photo, with the two facts that decide whether to go — what kind of
 * place it is and when its light is best — read directly off the image.
 *
 * A server component: its only interactivity is the link and CSS hover, so it
 * ships no client JavaScript. Phosphor's `/dist/ssr` entry is used because the
 * package's default export is a client module.
 *
 * No `view-transition-name` is set here on purpose: a place can appear in
 * several rails at once, and duplicate transition names are invalid. The morph
 * assigns its name at click time instead (its own track — see PROGRESS.md).
 */
export async function PlaceCard({
  place,
  priority = false,
}: {
  place: Place;
  priority?: boolean;
}): Promise<ReactElement> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("place");

  return (
    <Link
      href={`/place/${place.slug}`}
      className="group block focus-visible:rounded-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-hairline bg-surface">
        <Image
          src={place.cover.src}
          alt={resolve(place.cover.alt, locale)}
          fill
          sizes="(min-width: 640px) 17rem, 72vw"
          priority={priority}
          className="object-cover transition-transform duration-700 ease-farol motion-safe:group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10"
        />
        <span className="absolute top-3 left-3 rounded-pill bg-surface/80 px-2.5 py-1 text-2xs font-semibold tracking-[0.14em] text-text uppercase backdrop-blur-md backdrop-saturate-150">
          {t(`kinds.${place.kind}`)}
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-2xs font-medium text-white/95">
          <SunHorizonIcon
            weight="fill"
            size={14}
            aria-hidden="true"
            className="text-beacon-strong"
          />
          {t(`bestLight.values.${place.bestLight}`)}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="font-display text-lg leading-tight font-semibold tracking-tight text-text">
          {place.name}
        </h3>
        <p className="mt-1 text-2xs font-semibold tracking-[0.16em] text-text-faint uppercase">
          {place.area}
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
          {resolve(place.tagline, locale)}
        </p>
      </div>
    </Link>
  );
}

export default PlaceCard;
