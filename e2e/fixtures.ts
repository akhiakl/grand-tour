import { test as base, type Page } from "@playwright/test";

import type { Trip } from "@/lib/trip";

export { expect, type Page } from "@playwright/test";

export const FAKE_UPSTASH_URL = `http://127.0.0.1:${process.env.FAKE_UPSTASH_PORT ?? 8079}`;

/** Blank vector style so the map renders without reaching OpenFreeMap. */
const BLANK_STYLE = {
  version: 8,
  sources: {},
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#e8e2d0" } },
  ],
};

/** Writes a shared snapshot straight into the fake Upstash store. */
export async function seedSharedTrip(id: string, trip: Trip): Promise<void> {
  const response = await fetch(FAKE_UPSTASH_URL, {
    method: "POST",
    body: JSON.stringify(["SET", `trip:${id}`, JSON.stringify(trip)]),
  });
  if (!response.ok) throw new Error(`seed failed: ${response.status}`);
}

/** Every test starts with the third-party map edge stubbed out. */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, provide) => {
    await page.route("https://tiles.openfreemap.org/**", (route) =>
      route.fulfill({ json: BLANK_STYLE }),
    );
    await provide(page);
  },
});
