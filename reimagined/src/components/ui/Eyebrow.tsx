import type { ComponentPropsWithoutRef, ElementType, ReactElement, ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Eyebrow — the microscopic, wide-tracked uppercase label that sits above a
 * heading and tells you what kind of thing you are looking at.
 *
 * It is the counterweight to the huge Fraunces display type: tiny and quiet, so
 * the headline underneath can be enormous without the block feeling shouty.
 * Styling lives in the `eyebrow` utility in globals.css.
 *
 * The optional `rule` renders the route-stroke motif (SPEC §5) as a short
 * hairline before the text — use it where the eyebrow starts a new section.
 *
 * @example
 * <Eyebrow rule>{t("home.rails.nearby.title")}</Eyebrow>
 * <h2 className="font-display text-3xl">Praia do Guincho</h2>
 */

type EyebrowOwnProps = {
  children: ReactNode;
  className?: string;
  /** Prefix the label with a short hairline stroke. Decorative only. */
  rule?: boolean;
};

export type EyebrowProps<T extends ElementType = "span"> = EyebrowOwnProps & {
  /** Element to render as. Defaults to `span` so it can sit in any heading. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof EyebrowOwnProps | "as">;

export function Eyebrow<T extends ElementType = "span">({
  as,
  children,
  className,
  rule = false,
  ...rest
}: EyebrowProps<T>): ReactElement {
  const Tag = (as ?? "span") as ElementType;

  return (
    <Tag {...rest} className={cx("eyebrow inline-flex items-center gap-2.5", className)}>
      {rule ? (
        <span aria-hidden="true" className="h-px w-6 shrink-0 bg-hairline-strong" />
      ) : null}
      {children}
    </Tag>
  );
}
