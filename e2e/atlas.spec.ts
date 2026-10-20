import { expect, test } from "./fixtures";

/** The example route on `/`: Paris → Geneva → Florence → Rome → Venice. */
test.describe("atlas card (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("a stop opens in the card and Escape steps back", async ({ page }) => {
    const itinerary = page.getByRole("list", { name: "Itinerary" });
    await itinerary.getByRole("button", { name: /Florence/ }).click();

    await expect(
      page.getByRole("heading", { level: 2, name: "Florence" }),
    ).toBeVisible();
    await expect(page.getByText(/Stop 3 of 5/)).toBeVisible();
    await expect(itinerary).toBeHidden();

    await page.getByRole("tab", { name: "Planner" }).click();
    await expect(page.getByText(/Budget calculator/)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(itinerary).toBeVisible();
  });

  test("a map marker opens the same detail", async ({ page }) => {
    await page
      .locator(".marker", { hasText: "Geneva" })
      .locator(".marker-dot")
      .click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Geneva" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Route", exact: true }).click();
    await expect(page.getByRole("list", { name: "Itinerary" })).toBeVisible();
  });

  test("packing ticks survive a detour to a stop", async ({ page }) => {
    await page.getByRole("button", { name: "Packing" }).click();
    await page.getByRole("checkbox", { name: "Power bank" }).click();

    await page.getByRole("button", { name: "Route", exact: true }).click();
    await page
      .getByRole("list", { name: "Itinerary" })
      .getByRole("button", { name: /Rome/ })
      .click();
    await page.getByRole("button", { name: "Route", exact: true }).click();

    await page.getByRole("button", { name: "Packing" }).click();
    await expect(page.getByRole("checkbox", { name: "Power bank" })).toBeChecked();
  });

  test("the legend explains the map's marks", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Legend" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Selected stop")).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: /Train$/ }),
    ).toBeVisible();

    await toggle.click();
    await expect(page.getByText("Selected stop")).toBeHidden();
  });

  test("the landing actions lead into each journey", async ({ page }) => {
    const start = page.getByRole("group", { name: "Start your own route" });
    await start.getByRole("link", { name: "Plan with AI" }).click();
    await expect(page).toHaveURL(/\/plan$/);

    await page.goto("/");
    await start.getByRole("link", { name: "Build manually" }).click();
    await expect(page).toHaveURL(/\/new$/);

    await page.goto("/");
    await page.getByRole("link", { name: "My maps" }).click();
    await expect(page).toHaveURL(/\/maps$/);
  });

  test("Customize copies the example into the editor and My maps keeps it", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Customize" }).click();
    await expect(page).toHaveURL(/\/new\?remix=/);
    await expect(page.getByLabel("Trip title")).toHaveValue("The Grand Tour");

    await page.goto("/maps");
    await expect(page.getByText("The Grand Tour")).toBeVisible();
  });
});
