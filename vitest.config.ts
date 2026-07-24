import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    // AppleDouble sidecars: this repo lives on a non-HFS volume, so every write
    // spawns a binary `._name` twin that vitest would otherwise try to parse.
    exclude: ["**/node_modules/**", "**/.next/**", "**/._*"],
  },
});
