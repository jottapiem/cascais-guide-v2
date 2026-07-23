import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import type { Icon } from "@phosphor-icons/react";

import { cx } from "@/lib/cx";

/**
 * PillButton — the app's primary call to action.
 *
 * The signature detail: a trailing icon is never left naked next to the label.
 * It sits in its own disc that is flush with the button's right inner padding
 * (shell height − 2 × 6px padding = disc diameter), so the button reads as a
 * capsule with a physical button pressed into it. On hover the disc travels
 * diagonally "outward" — the same direction an arrow-up-right points — while
 * the whole capsule presses down.
 *
 * Renders a real `<button>`, or an `<a>` when `href` is given. Never a div.
 *
 * @example
 * <PillButton icon={ArrowUpRight} href={mapsUrl}>{t("place.map.open")}</PillButton>
 * <PillButton variant="quiet" size="sm" onClick={reset}>{t("common.cancel")}</PillButton>
 */

export type PillButtonVariant = "beacon" | "quiet";
export type PillButtonSize = "sm" | "md";

type PillButtonOwnProps = {
  /** The label. Pass translated copy — this component never holds strings. */
  children: ReactNode;
  /** `beacon` = the gold primary action, `quiet` = neutral secondary action. */
  variant?: PillButtonVariant;
  /** Both sizes keep a ≥44px touch target; `sm` is 44px, `md` is 48px. */
  size?: PillButtonSize;
  /** A Phosphor icon component. Rendered at weight="light" inside its disc. */
  icon?: Icon;
  className?: string;
};

type PillButtonAsButton = PillButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PillButtonOwnProps> & {
    href?: never;
  };

type PillButtonAsAnchor = PillButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof PillButtonOwnProps> & {
    href: string;
  };

export type PillButtonProps = PillButtonAsButton | PillButtonAsAnchor;

const SHELL_BASE =
  "group relative inline-flex select-none items-center justify-center rounded-pill font-sans font-medium " +
  // The global :focus-visible rule squares the radius off to 4px; a pill has to
  // win that back or the focus ring boxes the capsule in.
  "focus-visible:rounded-pill " +
  "transition-[scale,box-shadow,background-color,border-color] duration-200 ease-farol " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

const SHELL_VARIANT: Record<PillButtonVariant, string> = {
  beacon: "bg-beacon-strong text-ground hover:lift",
  quiet:
    "bg-surface-raised text-text border border-hairline hover:border-hairline-strong hover:bg-surface",
};

const SHELL_SIZE: Record<PillButtonSize, { withIcon: string; bare: string }> = {
  sm: { withIcon: "h-11 gap-2.5 pl-5 pr-1.5 text-sm", bare: "h-11 px-5 text-sm" },
  md: { withIcon: "h-12 gap-3 pl-6 pr-1.5 text-base", bare: "h-12 px-6 text-base" },
};

const DISC_SIZE: Record<PillButtonSize, string> = { sm: "size-8", md: "size-9" };
const GLYPH_SIZE: Record<PillButtonSize, number> = { sm: 16, md: 18 };

/**
 * The disc is identical in both variants — always the ground colour with a gold
 * glyph — which is what makes the two variants read as one family.
 */
const DISC_BASE =
  "grid shrink-0 place-items-center rounded-full bg-ground text-beacon-strong " +
  "transition-[translate,scale] duration-300 ease-farol " +
  "motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 " +
  "motion-safe:group-hover:scale-[1.08] motion-safe:group-active:scale-100";

export function PillButton(props: PillButtonProps): ReactElement {
  const { children, variant = "beacon", size = "md", icon: Glyph, className } = props;

  const shellClassName = cx(
    SHELL_BASE,
    SHELL_VARIANT[variant],
    Glyph ? SHELL_SIZE[size].withIcon : SHELL_SIZE[size].bare,
    className,
  );

  const body = (
    <>
      <span className="truncate">{children}</span>
      {Glyph ? (
        <span aria-hidden="true" className={cx(DISC_BASE, DISC_SIZE[size])}>
          <Glyph size={GLYPH_SIZE[size]} weight="light" />
        </span>
      ) : null}
    </>
  );

  if (props.href !== undefined) {
    const {
      children: _children,
      variant: _variant,
      size: _size,
      icon: _icon,
      className: _className,
      ...anchorProps
    } = props;

    return (
      <a {...anchorProps} className={shellClassName}>
        {body}
      </a>
    );
  }

  const {
    children: _children,
    variant: _variant,
    size: _size,
    icon: _icon,
    className: _className,
    href: _href,
    type,
    ...buttonProps
  } = props;

  return (
    <button {...buttonProps} type={type ?? "button"} className={shellClassName}>
      {body}
    </button>
  );
}
