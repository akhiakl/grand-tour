# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: limit.spec.ts >> the editor stops at 5 cities and offers the upsell
- Location: e2e/limit.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator: getByRole('combobox')
Expected: hidden
Error: strict mode violation: getByRole('combobox') resolved to 4 elements:
    1) <button dir="ltr" type="button" role="combobox" id="leg-0-mode" data-state="closed" aria-expanded="false" aria-autocomplete="none" data-slot="select-trigger" class="flex h-10 items-center justify-between gap-2 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-36">…</button> aka locator('#leg-0-mode')
    2) <button dir="ltr" type="button" role="combobox" id="leg-1-mode" data-state="closed" aria-expanded="false" aria-autocomplete="none" data-slot="select-trigger" class="flex h-10 items-center justify-between gap-2 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-36">…</button> aka locator('#leg-1-mode')
    3) <button dir="ltr" type="button" role="combobox" id="leg-2-mode" data-state="closed" aria-expanded="false" aria-autocomplete="none" data-slot="select-trigger" class="flex h-10 items-center justify-between gap-2 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-36">…</button> aka locator('#leg-2-mode')
    4) <button dir="ltr" type="button" role="combobox" id="leg-3-mode" data-state="closed" aria-expanded="false" aria-autocomplete="none" data-slot="select-trigger" class="flex h-10 items-center justify-between gap-2 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-36">…</button> aka locator('#leg-3-mode')

Call log:
  - Expect "toBeHidden" getByRole('combobox') with timeout 5000ms
  - waiting for getByRole('combobox')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - generic [ref=e2]:
        - banner [ref=e3]:
            - generic [ref=e4]:
                - link "Field Atlas" [ref=e5] [cursor=pointer]:
                    - /url: /
                - textbox "Trip title" [ref=e8]: Grand Tour
            - generic [ref=e9]:
                - link "My Maps" [ref=e10] [cursor=pointer]:
                    - /url: /maps
                - button "Share" [ref=e11]
        - generic [ref=e12]:
            - generic [ref=e13]:
                - generic [ref=e14]:
                    - heading "Stops" [level=2] [ref=e15]
                    - generic [ref=e16]: 5/5 stops
                - generic [ref=e17]:
                    - generic [ref=e19]:
                        - generic [ref=e28]:
                            - generic [ref=e29]: Flag
                            - textbox "Flag" [ref=e30]
                        - generic [ref=e31]:
                            - generic [ref=e32]: City
                            - textbox "City" [ref=e33]: New stop
                        - generic [ref=e34]:
                            - generic [ref=e35]: Country
                            - textbox "Country" [ref=e36]
                        - generic [ref=e37]:
                            - generic [ref=e38]: Nights
                            - spinbutton "Nights" [ref=e39]: "1"
                        - generic [ref=e40]:
                            - button "Move New stop up" [disabled]
                            - button "Move New stop down" [ref=e41]
                            - button "Edit all details" [ref=e42]
                            - button "Remove New stop" [ref=e43]
                    - generic [ref=e44]:
                        - generic [ref=e45]:
                            - generic [ref=e46]: Mode
                            - combobox "Mode" [ref=e47]:
                                - generic: 🚄 Train
                        - generic [ref=e50]:
                            - generic [ref=e51]: Label
                            - textbox "Label" [ref=e52]:
                                - /placeholder: Railjet via Linz
                        - generic [ref=e53]:
                            - generic [ref=e54]: Duration
                            - textbox "Duration" [ref=e55]:
                                - /placeholder: ~2h 30m
                - generic [ref=e56]:
                    - generic [ref=e58]:
                        - generic [ref=e67]:
                            - generic [ref=e68]: Flag
                            - textbox "Flag" [ref=e69]
                        - generic [ref=e70]:
                            - generic [ref=e71]: City
                            - textbox "City" [ref=e72]: New stop
                        - generic [ref=e73]:
                            - generic [ref=e74]: Country
                            - textbox "Country" [ref=e75]
                        - generic [ref=e76]:
                            - generic [ref=e77]: Nights
                            - spinbutton "Nights" [ref=e78]: "1"
                        - generic [ref=e79]:
                            - button "Move New stop up" [ref=e80]
                            - button "Move New stop down" [ref=e81]
                            - button "Edit all details" [ref=e82]
                            - button "Remove New stop" [ref=e83]
                    - generic [ref=e84]:
                        - generic [ref=e85]:
                            - generic [ref=e86]: Mode
                            - combobox "Mode" [ref=e87]:
                                - generic: 🚄 Train
                        - generic [ref=e90]:
                            - generic [ref=e91]: Label
                            - textbox "Label" [ref=e92]:
                                - /placeholder: Railjet via Linz
                        - generic [ref=e93]:
                            - generic [ref=e94]: Duration
                            - textbox "Duration" [ref=e95]:
                                - /placeholder: ~2h 30m
                - generic [ref=e96]:
                    - generic [ref=e98]:
                        - generic [ref=e107]:
                            - generic [ref=e108]: Flag
                            - textbox "Flag" [ref=e109]
                        - generic [ref=e110]:
                            - generic [ref=e111]: City
                            - textbox "City" [ref=e112]: New stop
                        - generic [ref=e113]:
                            - generic [ref=e114]: Country
                            - textbox "Country" [ref=e115]
                        - generic [ref=e116]:
                            - generic [ref=e117]: Nights
                            - spinbutton "Nights" [ref=e118]: "1"
                        - generic [ref=e119]:
                            - button "Move New stop up" [ref=e120]
                            - button "Move New stop down" [ref=e121]
                            - button "Edit all details" [ref=e122]
                            - button "Remove New stop" [ref=e123]
                    - generic [ref=e124]:
                        - generic [ref=e125]:
                            - generic [ref=e126]: Mode
                            - combobox "Mode" [ref=e127]:
                                - generic: 🚄 Train
                        - generic [ref=e130]:
                            - generic [ref=e131]: Label
                            - textbox "Label" [ref=e132]:
                                - /placeholder: Railjet via Linz
                        - generic [ref=e133]:
                            - generic [ref=e134]: Duration
                            - textbox "Duration" [ref=e135]:
                                - /placeholder: ~2h 30m
                - generic [ref=e136]:
                    - generic [ref=e138]:
                        - generic [ref=e147]:
                            - generic [ref=e148]: Flag
                            - textbox "Flag" [ref=e149]
                        - generic [ref=e150]:
                            - generic [ref=e151]: City
                            - textbox "City" [ref=e152]: New stop
                        - generic [ref=e153]:
                            - generic [ref=e154]: Country
                            - textbox "Country" [ref=e155]
                        - generic [ref=e156]:
                            - generic [ref=e157]: Nights
                            - spinbutton "Nights" [ref=e158]: "1"
                        - generic [ref=e159]:
                            - button "Move New stop up" [ref=e160]
                            - button "Move New stop down" [ref=e161]
                            - button "Edit all details" [ref=e162]
                            - button "Remove New stop" [ref=e163]
                    - generic [ref=e164]:
                        - generic [ref=e165]:
                            - generic [ref=e166]: Mode
                            - combobox "Mode" [ref=e167]:
                                - generic: 🚄 Train
                        - generic [ref=e170]:
                            - generic [ref=e171]: Label
                            - textbox "Label" [ref=e172]:
                                - /placeholder: Railjet via Linz
                        - generic [ref=e173]:
                            - generic [ref=e174]: Duration
                            - textbox "Duration" [ref=e175]:
                                - /placeholder: ~2h 30m
                - generic [ref=e178]:
                    - generic [ref=e187]:
                        - generic [ref=e188]: Flag
                        - textbox "Flag" [ref=e189]
                    - generic [ref=e190]:
                        - generic [ref=e191]: City
                        - textbox "City" [ref=e192]: New stop
                    - generic [ref=e193]:
                        - generic [ref=e194]: Country
                        - textbox "Country" [ref=e195]
                    - generic [ref=e196]:
                        - generic [ref=e197]: Nights
                        - spinbutton "Nights" [ref=e198]: "1"
                    - generic [ref=e199]:
                        - button "Move New stop up" [ref=e200]
                        - button "Move New stop down" [disabled]
                        - button "Edit all details" [ref=e201]
                        - button "Remove New stop" [ref=e202]
                - generic [ref=e204]:
                    - paragraph [ref=e205]: Guest maps top out at 5 stops.
                    - button "See what unlocks" [ref=e206]
            - paragraph [ref=e209]: Add a stop to see it appear on the map.
    - region "Notifications alt+T"
    - alert [ref=e210]
```

# Test source

```ts
  1  | import { expect, test } from "./fixtures";
  2  |
  3  | test("the editor stops at 5 cities and offers the upsell", async ({ page }) => {
  4  |   await page.goto("/new");
  5  |   const addBlank = page.getByRole("button", { name: "Or add a blank stop" });
  6  |   for (let i = 0; i < 5; i++) await addBlank.click();
  7  |
  8  |   await expect(page.getByText("5/5 stops")).toBeVisible();
  9  |   await expect(addBlank).toBeHidden();
> 10 |   await expect(page.getByRole("combobox")).toBeHidden();
     |                                            ^ Error: expect(locator).toBeHidden() failed
  11 |
  12 |   await page.getByRole("button", { name: "See what unlocks" }).click();
  13 |   const upsell = page.getByRole("dialog", { name: "5 stops, for now" });
  14 |   await expect(upsell).toBeVisible();
  15 |   await page.keyboard.press("Escape");
  16 |   await expect(upsell).toBeHidden();
  17 | });
  18 |
```
