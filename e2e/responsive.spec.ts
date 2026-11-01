import { SAMPLE_TRIP } from "@/lib/trip";

import { expect, seedSharedTrip, test } from "./fixtures";

const SHARE_ID = "e2eResponsive";

const PAGES = [
  "/",
  "/about",
  "/plan",
  "/new?city=Vienna&country=Austria&lat=48.2082&lng=16.3738",
  "/maps",
  "/privacy",
  "/terms",
  "/contact",
  `/t/${SHARE_ID}`,
];

test.beforeAll(async () => {
  await seedSharedTrip(SHARE_ID, SAMPLE_TRIP);
});

for (const width of [360, 768, 1280]) {
  test.describe(`${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of PAGES) {
      test(`${path} never scrolls sideways`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}
