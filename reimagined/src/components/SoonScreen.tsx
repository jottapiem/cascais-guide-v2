import type { Icon } from "@phosphor-icons/react";
import type { ReactElement } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * SoonScreen — the honest placeholder for a pillar that is designed but not yet
 * built (SPEC §7). It stays inside the design system rather than dropping to a
 * bare "coming soon", so an unfinished tab still feels like part of the app: an
 * eyebrow, the real heading and lede for the feature, and one grounded note
 * about what is coming. No fake UI, no dead controls.
 */
export function SoonScreen({
  icon: Glyph,
  badge,
  title,
  lede,
  note,
}: {
  icon: Icon;
  badge: string;
  title: string;
  lede: string;
  note: string;
}): ReactElement {
  return (
    <div className="mx-auto w-full max-w-2xl pt-6">
      <Eyebrow>{badge}</Eyebrow>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-text-muted text-balance">
        {lede}
      </p>
      <div className="mt-8 flex items-start gap-4 rounded-card border border-hairline bg-surface p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-beacon-wash text-beacon-strong">
          <Glyph weight="light" size={22} aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-text-muted">{note}</p>
      </div>
    </div>
  );
}

export default SoonScreen;
