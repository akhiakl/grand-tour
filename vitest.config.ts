import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Tests import server modules directly; neutralize the bundler guard.
      "server-only": fileURLToPath(
        new URL("./src/test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      // Coverage tracks the tested core (lib + API routes); UI components
      // are covered by Playwright e2e in the final build step.
      include: ["src/lib/**", "src/app/api/**"],
      exclude: ["**/*.test.*", "src/lib/utils.ts"],
      reporter: ["text", "json", "json-summary", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
