import type { ReactNode } from "react";

/**
 * Next requires a layout at the root of `app/`, but every real route lives
 * under `[locale]` and that layout owns <html> and <body> (it needs the
 * resolved locale for `lang`). So this one only passes children through —
 * the documented next-intl setup for a localised App Router.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
