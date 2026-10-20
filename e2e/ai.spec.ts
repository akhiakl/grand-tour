import { makeGeneratedDraft } from "@/test/fixtures/ai";

import { expect, test, type Page } from "./fixtures";

/** Walks the /plan chat with the generator mocked to return `draft`. */
async function planWithAi(page: Page, draft: ReturnType<typeof makeGeneratedDraft>) {
  await page.route("**/api/generate", (route) => route.fulfill({ json: draft }));
  await page.goto("/plan");
  await page.getByLabel("Destination").fill("Austria");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Number of days").fill("6");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Balanced/ }).click();
  await expect(page).toHaveURL(/\/new/);
}

test("AI create flow prefills the editor", async ({ page }) => {
  await planWithAi(page, makeGeneratedDraft([], 3));

  await expect(page.getByLabel("Trip title")).toHaveValue("Alpine Arc");
  await expect(page.getByText("3/5 stops")).toBeVisible();
  await expect(page.getByText("Stop 3").first()).toBeVisible();
});

test("a ghost stop past the guest limit opens the upsell", async ({ page }) => {
  await planWithAi(page, makeGeneratedDraft(["Ljubljana"], 5));

  await expect(page.getByText("5/5 stops")).toBeVisible();
  await page.locator(".marker-ghost", { hasText: "Ljubljana" }).click();
  await expect(page.getByRole("dialog", { name: "5 stops, for now" })).toBeVisible();
});
