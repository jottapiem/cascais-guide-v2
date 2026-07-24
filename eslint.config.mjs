import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // macOS AppleDouble sidecars. This repo lives on a non-HFS volume, so every
    // write spawns a `._name` twin next to the real file. They're binary, they're
    // already gitignored, and eslint would otherwise fail on "Invalid character".
    "**/._*",
  ]),
]);

export default eslintConfig;
