import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { tripMapsUrl } from "./maps-url";

const city = (lat: number, lng: number) => makeCity({ ll: [lat, lng] });

describe("tripMapsUrl", () => {
  it("routes from the first to the last stop via the ones between", () => {
    const trip = makeTrip(3, {
      cities: [city(48.2, 16.3), city(47.8, 13.0), city(46.6, 14.3)],
    });
    const url = new URL(tripMapsUrl(trip));
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("origin")).toBe("48.2,16.3");
    expect(url.searchParams.get("destination")).toBe("46.6,14.3");
    expect(url.searchParams.get("waypoints")).toBe("47.8,13");
  });

  it("omits waypoints for a two-stop trip", () => {
    const trip = makeTrip(2, { cities: [city(1, 2), city(3, 4)] });
    expect(new URL(tripMapsUrl(trip)).searchParams.has("waypoints")).toBe(false);
  });

  it("caps waypoints at nine", () => {
    const cities = Array.from({ length: 13 }, (_, i) => city(i, i));
    const url = new URL(tripMapsUrl(makeTrip(13, { cities })));
    expect(url.searchParams.get("waypoints")!.split("|")).toHaveLength(9);
  });
});
