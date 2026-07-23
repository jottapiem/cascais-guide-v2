import type { ReactElement } from "react";

import { cx } from "@/lib/cx";

/**
 * Meter — a compact 1..5 gauge. Used for a place's busyness now, and for bag
 * weight against its limit later (SPEC §3, Pijler 3).
 *
 * The value is encoded three times over, so it never depends on colour alone:
 * the segments *rise* left to right (a 5 is a tall staircase, a 1 is a single
 * low tick), the filled count is countable, and a written label spells it out.
 * That is what keeps it readable for colour-blind users, in bright sunlight on
 * a beach, and to a screen reader — which gets `role="meter"` with a
 * `aria-valuetext` in words rather than a bare number.
 *
 * Copy is passed in, never held here — the kit stays free of hardcoded strings.
 *
 * @example
 * const t = useTranslations("place.busyness");
 * <Meter
 *   value={place.busyness}
 *   label={t("label")}
 *   valueLabel={t(`levels.${place.busyness}`)}
 *   tone={place.busyness >= 4 ? "critical" : "neutral"}
 * />
 */

export type MeterTone = "neutral" | "positive" | "critical";

export type MeterProps = {
  /** Current level, clamped into 1..max. */
  value: number;
  /** Number of segments. Defaults to 5, the scale used by `busyness`. */
  max?: number;
  /** Accessible name for the whole meter, e.g. "Drukte". Translated by caller. */
  label: string;
  /** The value in words, e.g. "Rustig". Shown next to the bars and announced. */
  valueLabel?: string;
  /** Colour of the filled segments. Derive it from the value at the call site. */
  tone?: MeterTone;
  /** Keep the written value for assistive tech only (tight card footers). */
  hideValueLabel?: boolean;
  className?: string;
};

const FILL_TONE: Record<MeterTone, string> = {
  neutral: "bg-text",
  positive: "bg-positive",
  critical: "bg-critical",
};

const LABEL_TONE: Record<MeterTone, string> = {
  neutral: "text-text-muted",
  positive: "text-positive",
  critical: "text-critical",
};

/** Segment heights in px — a rising staircase, so level reads as silhouette. */
function segmentHeight(index: number): number {
  return 6 + index * 2;
}

export function Meter({
  value,
  max = 5,
  label,
  valueLabel,
  tone = "neutral",
  hideValueLabel = false,
  className,
}: MeterProps): ReactElement {
  const steps = Math.max(1, Math.round(max));
  const level = Math.min(steps, Math.max(1, Math.round(value)));
  const readout = valueLabel ?? `${level}/${steps}`;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={steps}
      aria-valuenow={level}
      aria-valuetext={readout}
      className={cx("inline-flex items-center gap-2", className)}
    >
      <span aria-hidden="true" className="flex items-end gap-[3px]">
        {Array.from({ length: steps }, (_, index) => (
          <span
            key={index}
            style={{ height: `${segmentHeight(index)}px` }}
            className={cx(
              "w-1 rounded-full",
              index < level ? FILL_TONE[tone] : "bg-hairline-strong",
            )}
          />
        ))}
      </span>
      {hideValueLabel ? null : (
        <span className={cx("tabular text-2xs font-medium", LABEL_TONE[tone])}>{readout}</span>
      )}
    </div>
  );
}
