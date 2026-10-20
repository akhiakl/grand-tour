import { expect, test } from "./fixtures";

test("the editor stops at 5 cities and offers the upsell", async ({ page }) => {
  await page.goto("/new");
  const addBlank = page.getByRole("button", { name: "Or add a blank stop" });
  for (let i = 0; i < 5; i++) await addBlank.click();

  await expect(page.getByText("5/5 stops")).toBeVisible();
  await expect(addBlank).toBeHidden();
  await expect(page.getByRole("combobox")).toBeHidden();

  await page.getByRole("button", { name: "See what unlocks" }).click();
  const upsell = page.getByRole("dialog", { name: "5 stops, for now" });
  await expect(upsell).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(upsell).toBeHidden();
});
