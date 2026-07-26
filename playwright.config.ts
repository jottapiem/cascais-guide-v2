import { defineConfig, devices } from "@playwright/test";

// Merge-gate E2E. Owned by the orchestrator, not by any single agent: it exists
// precisely to catch breakage that spans agent boundaries — the morph engine measures
// an element whose src the content layer owns, so a change on either side can break
// the other while both branches stay green on their own tests.
//
// Port 3000 is the root worktree's own dev port, and `reuseExistingServer` attaches to
// it when it is already up. Next 16 refuses to start a second dev server for the same
// directory regardless of port ("Another next dev server is already running"), so an
// isolated port here would not have worked. The agent worktrees are separate
// directories on 3001-3003, so they are unaffected either way.
const PORT = 3000;

export default defineConfig({
  testDir: "./e2e",
  // Third tool that needs this: eslint and vitest ignore it too. This repo lives on a
  // non-HFS volume, so every write spawns a binary `._name` sidecar that any file
  // globber will happily try to parse as source.
  testIgnore: "**/._*",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // iPhone-sized: this app is mobile-first and the morph geometry is derived from
      // a max-w-md column. Testing at desktop width would exercise the sm: breakpoint
      // layout instead of the one that actually ships.
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
