import { expect, test } from "./fixtures";

test("a removed stop comes back with Undo, and moves are announced", async ({
  page,
}) => {
  await page.goto("/new");
  const addBlank = page.getByRole("button", { name: "Or add a blank stop" });
  await addBlank.click();
  await addBlank.click();
  await page.locator("#stop-0-name").fill("Vienna");
  await page.locator("#stop-1-name").fill("Prague");

  await page.getByRole("button", { name: "Move Vienna down" }).click();
  await expect(page.getByRole("status").filter({ hasText: "moved" })).toHaveText(
    "Vienna moved to stop 2 of 2.",
  );
  await expect(page.locator("#stop-0-name")).toHaveValue("Prague");
  // Focus followed Vienna to the end of the list, onto its other move button.
  await expect(page.getByRole("button", { name: "Move Vienna up" })).toBeFocused();

  await page.getByRole("button", { name: "Remove Prague" }).click();
  await expect(page.getByText("1/5 stops")).toBeVisible();
  // The toast's Undo, not the header's history button.
  await page
    .locator("[data-sonner-toast]")
    .getByRole("button", { name: "Undo" })
    .click();

  await expect(page.getByText("2/5 stops")).toBeVisible();
  await expect(page.locator("#stop-0-name")).toHaveValue("Prague");
  await expect(page.locator("#stop-1-name")).toHaveValue("Vienna");
});
