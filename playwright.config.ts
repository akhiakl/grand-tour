import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const FAKE_UPSTASH_PORT = 8079;

/**
 * E2E runs against a production build (`pnpm build` first). External
 * services are faked at the edge: Upstash by a local REST stub, the API
 * routes and third-party map/geocoder calls by `page.route` in each test.
 * `PLAYWRIGHT_CHROMIUM_PATH` points at a preinstalled Chromium where
 * `playwright install` isn't available (remote agent sessions).
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH },
  },
  webServer: [
    {
      command: "node e2e/fake-upstash.ts",
      port: FAKE_UPSTASH_PORT,
      env: { FAKE_UPSTASH_PORT: String(FAKE_UPSTASH_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm start --port ${PORT}`,
      port: PORT,
      env: {
        UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${FAKE_UPSTASH_PORT}`,
        UPSTASH_REDIS_REST_TOKEN: "e2e",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
