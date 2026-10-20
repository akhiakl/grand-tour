import { makeRates } from "@/test/fixtures/units";

import { expect, test } from "./fixtures";

// en-IE defaults to kilometres and euros.
test.use({ locale: "en-IE" });

test("a viewer switches to miles and pounds, and it sticks", async ({ page }) => {
  await page.route("**/api/rates", (route) => route.fulfill({ json: makeRates() }));
  await page.goto("/");

  const route = page.getByText("Total route").locator("..");
  const budget = page.getByText("Budget / person").locator("..");
  await expect(route).toContainText("km");
  await expect(budget).toContainText("~€");

  await page.getByRole("button", { name: "Units and currency" }).click();
  await page.getByRole("radio", { name: "Miles" }).click();
  await page.getByRole("combobox", { name: "Currency" }).click();
  await page.getByRole("option", { name: /^GBP/ }).click();
  await page.keyboard.press("Escape");

  await expect(route).toContainText("mi");
  await expect(budget).toContainText("~£");

  await page.reload();
  await expect(route).toContainText("mi");
  await expect(budget).toContainText("~£");
});
