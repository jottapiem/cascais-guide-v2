"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";

import { cx } from "@/lib/cx";

/**
 * Reveal — content fades and lifts into place the first time it scrolls into
 * view. Used to give long editorial pages a sense of unfolding rather than
 * dumping a finished screen on the reader.
 *
 * Observed with IntersectionObserver, never a scroll listener: the callback
 * fires off the main thread's scroll path, so a page full of Reveals costs
 * nothing while scrolling. Only `opacity` and `translate` animate, so each
 * reveal stays on the compositor.
 *
 * Under `prefers-reduced-motion: reduce` it is a no-op in both directions: a
 * `motion-reduce` rule keeps the content fully visible even before hydration,
 * and the effect then skips the observer entirely.
 *
 * @example
 * {places.map((place, i) => (
 *   <Reveal key={place.slug} as="li" delay={i * 70}>…</Reveal>
 * ))}
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type RevealOwnProps = {
  children: ReactNode;
  className?: string;
  /**
   * Stagger offset in milliseconds. Pass `index * 70` for a list; keep the
   * total under ~400ms so the last item never feels late.
   */
  delay?: number;
  /** How much of the element must be visible before it reveals. 0–1. */
  threshold?: number;
  /** Margin around the viewport when testing intersection, CSS shorthand. */
  rootMargin?: string;
  /** Re-hide when scrolled back out of view. Off by default: reveal once. */
  repeat?: boolean;
};

export type RevealProps<T extends ElementType = "div"> = RevealOwnProps & {
  /** Element to render as — `li` inside lists, `section` for page blocks. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps | "as">;

export function Reveal<T extends ElementType = "div">({
  as,
  children,
  className,
  delay = 0,
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  repeat = false,
  ...rest
}: RevealProps<T>): ReactElement {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;

    const reduced =
      typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setInstant(true);
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (!repeat) observer.disconnect();
          } else if (repeat) {
            setShown(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [repeat, rootMargin, threshold]);

  const Tag = (as ?? "div") as ElementType;
  const style: CSSProperties | undefined =
    instant || delay === 0 ? undefined : { transitionDelay: `${delay}ms` };

  return (
    <Tag
      {...rest}
      ref={ref}
      style={style}
      className={cx(
        "transition-[opacity,translate] duration-700 ease-farol",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
