import type { ReactElement } from "react";

import { PlaceCard } from "@/components/PlaceCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Place } from "@/lib/schema/content";

/**
 * Rail — one horizontally scrolling shelf of places under a titled header.
 *
 * The header is marked with a short beacon "route stroke" rather than a boxed
 * eyebrow, so the sections read as points along a chart. Cards reveal in a
 * gentle stagger as the rail scrolls into view (capped so the last card is
 * never late). Renders nothing when the shelf is empty, so the feed collapses
 * around missing kinds instead of showing a hole.
 */
export function Rail({
  title,
  subtitle,
  places,
  priority = false,
}: {
  title: string;
  subtitle: string;
  places: readonly Place[];
  /** Eagerly load the first couple of covers — only true for the top rail. */
  priority?: boolean;
}): ReactElement | null {
  if (places.length === 0) return null;

  return (
    <section className="scroll-mt-28">
      <header className="mb-5 px-0.5">
        <span
          aria-hidden="true"
          className="mb-3 block h-px w-8 bg-beacon/55"
        />
        <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight text-text sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      </header>

      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden">
        {places.map((place, index) => (
          <Reveal
            as="li"
            key={place.slug}
            delay={Math.min(index, 5) * 60}
            className="w-[15rem] shrink-0 snap-start sm:w-[17rem]"
          >
            <PlaceCard place={place} priority={priority && index < 2} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export default Rail;
