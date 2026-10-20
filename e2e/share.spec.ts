import type { Trip } from "@/lib/trip";
import { makePhotonFeature, makePhotonResponse } from "@/test/fixtures/geo-search";

import { expect, seedSharedTrip, test } from "./fixtures";

const SHARE_ID = "e2eShare";

const PLACES: Record<string, [number, number]> = {
  Vienna: [16.3738, 48.2082],
  Salzburg: [13.055, 47.8095],
};

test("manual create → share → open the link → remix", async ({ page }) => {
  await page.route("https://photon.komoot.io/**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") ?? "";
    const name = Object.keys(PLACES).find((place) => place.startsWith(query));
    const features = name
      ? [makePhotonFeature({ name, state: name }, PLACES[name])]
      : [];
    return route.fulfill({ json: makePhotonResponse(features) });
  });
  await page.route("**/api/trips", async (route) => {
    await seedSharedTrip(SHARE_ID, route.request().postDataJSON() as Trip);
    await route.fulfill({ status: 201, json: { id: SHARE_ID } });
  });

  await page.goto("/new");
  await page.getByLabel("Trip title").fill("Danube Days");
  for (const city of Object.keys(PLACES)) {
    await page.getByPlaceholder("Search for a city…").fill(city);
    await page.getByRole("option", { name: new RegExp(city) }).click();
  }
  await expect(page.getByText("2/5 stops")).toBeVisible();

  await page.getByRole("button", { name: "Share" }).click();
  const dialog = page.getByRole("dialog", { name: "Your map is live" });
  await expect(dialog.getByRole("textbox")).toHaveValue(
    new RegExp(`/t/${SHARE_ID}$`),
  );

  await page.goto(`/t/${SHARE_ID}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Danube Days");

  await page.getByRole("button", { name: "Remix this trip" }).click();
  await expect(page).toHaveURL(/\/new\?remix=/);
  await expect(page.getByLabel("Trip title")).toHaveValue("Danube Days");
  await expect(page.getByText("2/5 stops")).toBeVisible();
});
