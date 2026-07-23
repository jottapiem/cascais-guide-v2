/**
 * Minimal class-name joiner.
 *
 * Deliberately not `clsx`/`cn` with a tailwind-merge on top: the UI kit composes
 * classes in a fixed order (base → variant → caller override), so a merge step
 * would only hide ordering mistakes. Falsy entries are dropped so conditional
 * classes read as `cond && "…"`.
 */
export type ClassValue = string | false | null | undefined;

export function cx(...values: readonly ClassValue[]): string {
  let out = "";
  for (const value of values) {
    if (!value) continue;
    out = out.length === 0 ? value : `${out} ${value}`;
  }
  return out;
}
