# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai.spec.ts >> AI create flow prefills the editor
- Location: e2e/ai.spec.ts:17:5

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByLabel('Trip title')
Expected: "Alpine Arc"
Received: "Grand Tour"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" getByLabel('Trip title') with timeout 5000ms
  - waiting for getByLabel('Trip title')
    11 × locator resolved to <input maxlength="80" data-slot="input" value="Grand Tour" aria-label="Trip title" class="flex w-full rounded-lg border border-line py-2 text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-auto border-none bg-transparent px-0 font-display text-3xl font-medium tracking-tight shadow-none focus-visible:ring-0"/>
       - unexpected value "Grand Tour"

```

```yaml
- textbox "Trip title": Grand Tour
```

# Test source

```ts
  1  | import { makeGeneratedDraft } from "@/test/fixtures/ai";
  2  |
  3  | import { expect, test, type Page } from "./fixtures";
  4  |
  5  | /** Walks the /plan chat with the generator mocked to return `draft`. */
  6  | async function planWithAi(page: Page, draft: ReturnType<typeof makeGeneratedDraft>) {
  7  |   await page.route("**/api/generate", (route) => route.fulfill({ json: draft }));
  8  |   await page.goto("/plan");
  9  |   await page.getByLabel("Destination").fill("Austria");
  10 |   await page.getByRole("button", { name: "Next" }).click();
  11 |   await page.getByLabel("Number of days").fill("6");
  12 |   await page.getByRole("button", { name: "Next" }).click();
  13 |   await page.getByRole("button", { name: /Balanced/ }).click();
  14 |   await expect(page).toHaveURL(/\/new/);
  15 | }
  16 |
  17 | test("AI create flow prefills the editor", async ({ page }) => {
  18 |   await planWithAi(page, makeGeneratedDraft([], 3));
  19 |
> 20 |   await expect(page.getByLabel("Trip title")).toHaveValue("Alpine Arc");
     |                                               ^ Error: expect(locator).toHaveValue(expected) failed
  21 |   await expect(page.getByText("3/5 stops")).toBeVisible();
  22 |   await expect(page.getByText("Stop 3").first()).toBeVisible();
  23 | });
  24 |
  25 | test("a ghost stop past the guest limit opens the upsell", async ({ page }) => {
  26 |   await planWithAi(page, makeGeneratedDraft(["Ljubljana"], 5));
  27 |
  28 |   await expect(page.getByText("5/5 stops")).toBeVisible();
  29 |   await page.locator(".marker-ghost", { hasText: "Ljubljana" }).click();
  30 |   await expect(page.getByRole("dialog", { name: "5 stops, for now" })).toBeVisible();
  31 | });
  32 |
```
