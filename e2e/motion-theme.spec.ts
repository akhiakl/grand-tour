import { expect, test } from "./fixtures";

test("switching theme doesn't move the atlas card", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator(".atlas-card");
  await expect(card).toBeVisible();
  const before = await card.boundingBox();

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await card.boundingBox()).toEqual(before);
});

test("reduced motion stills the route and marker animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const route = page.locator(".atlas-map .leaflet-overlay-pane path").first();
  await expect(route).toBeAttached();

  const durations = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        ".atlas-map .leaflet-overlay-pane path, .marker-pulse",
      ),
    ].map((el) => getComputedStyle(el).animationDuration),
  );
  expect(durations.length).toBeGreaterThan(0);
  for (const duration of durations) expect(["0s", "1e-05s"]).toContain(duration);
});
