import { expect, test, type Page, type Locator } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Merge-gate smoke test.
//
// Why this exists: the three agent domains (morph / content / bags) were split so
// they could run in parallel, but morph and content are not fully independent —
// TransitionLayer clones a PlaceImage and measures its getBoundingClientRect(), while
// the content layer owns where that image's src comes from. A change on either side
// can break the other while both branches stay green on their own checks.
//
// This test deliberately touches NO component file and uses NO data-testid: adding
// one would mean editing MorphCard.tsx, which morph-verify owns and has branched.
// Every selector below is either an existing aria-label or a structural fact.
// ─────────────────────────────────────────────────────────────────────────────

const NAV = 'nav[aria-label="Hoofdnavigatie"]';
const BACK = '[aria-label="Terug"]';

/** The detail overlay is the only thing in the app that renders a "Terug" button. */
function detailOverlay(page: Page): Locator {
  return page.locator(BACK);
}

/**
 * First tappable place card. Cards are motion.divs with an onClick and no role, so
 * they are located by the thing that makes them a card: an <img> inside the main
 * region. Deliberately not by place name — the content layer is rewriting place ids
 * and this test must survive that.
 */
function firstCard(page: Page): Locator {
  return page.locator("main img").first();
}

async function gotoHome(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator(NAV)).toBeVisible({ timeout: 30_000 });
}

test.describe("critical path", () => {
  test("home renders with navigation and place cards", async ({ page }) => {
    await gotoHome(page);

    // If the content layer breaks the data source, this is where it shows up first.
    const cards = page.locator("main img");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("every place image actually loads", async ({ page }) => {
    await gotoHome(page);
    await page.waitForLoadState("networkidle");

    // naturalWidth === 0 means the <img> resolved to nothing: a dead Unsplash URL, a
    // 404 on a local file, or a broken fallback. This is the assertion that enforces
    // the "alle content werkt zonder netwerk" rule once photos go local.
    const broken = await page.locator("main img").evaluateAll((imgs) =>
      imgs
        .filter((img): img is HTMLImageElement => img instanceof HTMLImageElement)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src)
    );

    expect(broken, `broken images: ${broken.join(", ")}`).toEqual([]);
  });

  test("tapping a card morphs into the detail view, and back returns home", async ({ page }) => {
    await gotoHome(page);
    await expect(detailOverlay(page)).toHaveCount(0);

    await firstCard(page).click();

    // The morph is spring-driven with a hold phase; the detail overlay mounts through
    // a portal during it. Waiting for the back button covers the whole sequence
    // without hard-coding any of the tuned timing constants morph-verify may change.
    await expect(detailOverlay(page)).toBeVisible({ timeout: 10_000 });

    await detailOverlay(page).click();

    await expect(detailOverlay(page)).toHaveCount(0, { timeout: 10_000 });
    await expect(page.locator(NAV)).toBeVisible();
  });

  test("bottom navigation reaches every root view without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await gotoHome(page);

    for (const label of ["Favorieten", "Kaart", "Trips", "Tas", "Explore"]) {
      await page.locator(`${NAV} [aria-label="${label}"]`).click();
      await expect(page.locator(NAV)).toBeVisible();
    }

    expect(errors, `uncaught errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("app is not indexable", async ({ page }) => {
    // Hard project rule (AGENTS.md): this is a private app. Asserted here rather than
    // trusted, because it is one metadata edit away from silently regressing.
    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";
    expect(html).toContain("noindex");
  });
});
