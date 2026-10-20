# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai.spec.ts >> a ghost stop past the guest limit opens the upsell
- Location: e2e/ai.spec.ts:25:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('5/5 stops')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('5/5 stops') with timeout 5000ms
  - waiting for getByText('5/5 stops')

```

```yaml
- banner:
    - link "Field Atlas":
        - /url: /
    - textbox "Trip title": Grand Tour
    - link "My Maps":
        - /url: /maps
    - button "Share" [disabled]
- heading "Stops" [level=2]
- text: 0/5 stops
- paragraph: Search for the next stop.
- combobox "Search for a city…"
- button "Or add a blank stop"
- paragraph: Add a stop to see it appear on the map.
- region "Notifications alt+T"
- alert: Build a trip · Grand Tour
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
  20 |   await expect(page.getByLabel("Trip title")).toHaveValue("Alpine Arc");
  21 |   await expect(page.getByText("3/5 stops")).toBeVisible();
  22 |   await expect(page.getByText("Stop 3").first()).toBeVisible();
  23 | });
  24 |
  25 | test("a ghost stop past the guest limit opens the upsell", async ({ page }) => {
  26 |   await planWithAi(page, makeGeneratedDraft(["Ljubljana"], 5));
  27 |
> 28 |   await expect(page.getByText("5/5 stops")).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  29 |   await page.locator(".marker-ghost", { hasText: "Ljubljana" }).click();
  30 |   await expect(page.getByRole("dialog", { name: "5 stops, for now" })).toBeVisible();
  31 | });
  32 |
```
