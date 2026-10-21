import { readFile } from "node:fs/promises";

import { makeRouteCities, makeTrip } from "@/test/fixtures/trip";

import { expect, seedSharedTrip, test } from "./fixtures";

/** One snapshot per test: specs run in parallel against one store. */
const sharedId = (name: string) => `e2e${name}${Date.now().toString(36)}`;

test("packing ticks, own items and notes survive a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Packing" }).click();
  await page.getByRole("checkbox", { name: "Power bank" }).click();
  await page.getByRole("textbox", { name: "Add a packing item" }).fill("Snorkel");
  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByRole("button", { name: "Route", exact: true }).click();
  await page.getByRole("button", { name: "Notes" }).click();
  await page.getByRole("textbox", { name: "Trip notes" }).fill("Gate B12");

  await page.reload();
  await page.getByRole("button", { name: "Packing" }).click();
  await expect(page.getByRole("checkbox", { name: "Power bank" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Snorkel" })).toBeVisible();
  // The sample route crosses France, Switzerland and Italy.
  await expect(
    page.getByRole("checkbox", { name: /Power adapter for type C\/J sockets/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Route", exact: true }).click();
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.getByRole("textbox", { name: "Trip notes" })).toHaveValue(
    "Gate B12",
  );
});

test("a dated shared trip shows its days, views and a calendar file", async ({
  page,
}) => {
  const SHARED_ID = sharedId("1");
  await seedSharedTrip(
    SHARED_ID,
    makeTrip(3, {
      title: "Danube Days",
      cities: makeRouteCities(3),
      startDate: "2027-05-01",
    }),
  );
  await page.goto(`/t/${SHARED_ID}`);

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.getByText(/Opened \d+ times?\./)).toBeVisible();
  await expect(
    page
      .getByRole("list", { name: "Itinerary" })
      .getByText(/^May 4\s?–\s?7 · 3 nights/),
  ).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Calendar" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("danube-days.ics");
  const ics = await readFile((await file.path())!, "utf8");
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
});

test("My Maps duplicates a trip and round-trips a backup file", async ({ page }) => {
  const SHARED_ID = sharedId("2");
  await seedSharedTrip(
    SHARED_ID,
    makeTrip(2, { title: "Alps", cities: makeRouteCities(2) }),
  );
  await page.goto(`/t/${SHARED_ID}`);
  await page.getByRole("button", { name: "Remix this trip" }).click();
  await expect(page).toHaveURL(/\/new\?remix=/);

  await page.goto("/maps");
  await page.getByRole("button", { name: "Duplicate Alps" }).click();
  await expect(page.getByRole("heading", { name: "Alps (copy)" })).toBeVisible();

  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download a backup of Alps", exact: true })
    .click();
  const backup = await (await download).path();

  await page.getByRole("button", { name: "Delete Alps", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alps", exact: true })).toHaveCount(
    0,
  );

  await page.getByLabel("Map backup file").setInputFiles(backup!);
  await expect(
    page.getByRole("heading", { name: "Alps", exact: true }),
  ).toBeVisible();
});

test("the editor dates a trip and undoes a title edit", async ({ page }) => {
  const SHARED_ID = sharedId("3");
  await seedSharedTrip(
    SHARED_ID,
    makeTrip(2, { title: "Alps", cities: makeRouteCities(2) }),
  );
  await page.goto(`/t/${SHARED_ID}`);
  await page.getByRole("button", { name: "Remix this trip" }).click();

  const title = page.getByLabel("Trip title");
  await title.fill("Alpine Loop");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(title).toHaveValue("Alps");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(title).toHaveValue("Alpine Loop");

  await page.getByLabel("Starts").fill("2027-05-01");
  await expect(page.getByText(/as the crow flies/)).toBeVisible();
});
