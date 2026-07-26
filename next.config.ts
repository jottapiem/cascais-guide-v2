import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A stray package-lock.json sits one level up at /Volumes/SSD/. Without this, Next
  // infers THAT directory as the workspace root and warns on every dev/build in every
  // worktree. Pinning the root to this project silences it at the source instead of
  // asking each agent to ignore the noise.
  outputFileTracingRoot: path.join(__dirname),

  // At iPhone width the dev indicator badge sits directly on top of the bottom
  // navigation and swallows its taps — it broke the E2E nav test and would hit any
  // agent doing browser verification at mobile width. The error overlay itself is
  // unaffected; only the floating badge goes away.
  devIndicators: false,
};

export default nextConfig;
