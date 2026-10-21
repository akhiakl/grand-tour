import AxeBuilder from "@axe-core/playwright";

import { SAMPLE_TRIP } from "@/lib/trip";

import { expect, seedSharedTrip, test } from "./fixtures";

const SHARE_ID = "e2eA11y";

const PAGES = [
  "/",
  "/about",
  "/plan",
  "/new",
  // The editor with a stop in it, not just its empty state.
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

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe (${colorScheme})`, () => {
    for (const path of PAGES) {
      test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
        // Reduced motion skips the intro splash and route animation, so
        // axe sees the settled page.
        await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        const { violations, passes } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const summary = violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        );
        expect(summary).toEqual([]);
        // Guard against scanning a blank page.
        expect(passes.length).toBeGreaterThan(10);
      });
    }
  });
}

test("the basemap error toast passes axe too", async ({ page }) => {
  // Tiles unreachable: the in-voice retry toast appears over the map.
  await page.route("https://tiles.openfreemap.org/**", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-sonner-toast]")).toBeVisible();

  const { violations } = await new AxeBuilder({ page })
    .include("[data-sonner-toast]")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
