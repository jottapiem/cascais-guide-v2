import type { ComponentPropsWithoutRef, ElementType, ReactElement, ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Double-Bezel — the container that carries Farol's whole "machined hardware"
 * feel: an outer tray (`bezel`) holding an inner plate (`bezel-core`).
 *
 * The illusion depends entirely on the radii staying concentric: the shell's
 * radius minus the shell's padding equals the core's radius
 * (`--radius-shell` 2rem − 0.375rem padding = `--radius-core` 1.625rem). Both
 * live in globals.css, so never re-declare padding or radius on either layer —
 * change the tokens instead and every bezel in the app stays true.
 *
 * @example
 * <Bezel as="article" elevated>
 *   <Image … />
 * </Bezel>
 */

type BezelOwnProps = {
  /** Rendered inside the inner core, which clips overflow (photos, maps, …). */
  children: ReactNode;
  /** Classes for the outer shell — layout, sizing, spacing around the core. */
  className?: string;
  /** Classes for the inner core — its background, aspect ratio, inner layout. */
  coreClassName?: string;
  /** Adds the ambient `lift` shadow, for bezels that float above the ground. */
  elevated?: boolean;
};

export type BezelProps<T extends ElementType = "div"> = BezelOwnProps & {
  /** Element or component to render as the shell. Defaults to `div`. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BezelOwnProps | "as">;

export function Bezel<T extends ElementType = "div">({
  as,
  children,
  className,
  coreClassName,
  elevated = false,
  ...rest
}: BezelProps<T>): ReactElement {
  const Shell = (as ?? "div") as ElementType;

  return (
    <Shell {...rest} className={cx("bezel", elevated && "lift", className)}>
      <div className={cx("bezel-core", "bg-surface-raised", coreClassName)}>{children}</div>
    </Shell>
  );
}
