import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// Pre-flight smoke test. Owned by no agent — it exists so that a failing
// `npm test` in any worktree means "your change broke something", never
// "the test setup was never wired up in the first place".

describe("test harness", () => {
  it("runs typescript", () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 2)).toBe(4);
  });

  it("provides a jsdom document", () => {
    expect(typeof document).toBe("object");
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(false);
  });

  it("renders React components through testing-library", () => {
    render(<p>Guincho</p>);
    expect(screen.getByText("Guincho")).toBeInTheDocument();
  });

  it("resolves the @/ path alias", async () => {
    const { MORPH_RADIUS_RATIO } = await import("@/lib/morph-config");
    expect(MORPH_RADIUS_RATIO).toBeGreaterThan(0);
  });
});
