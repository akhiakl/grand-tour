import { describe, expect, it } from "vitest";

import { blankCity } from "./draft";
import { startCityFromParams, startCityQuery } from "./start-city";

const KYOTO = {
  name: "Kyoto",
  country: "Japan",
  flag: "🇯🇵",
  ll: [35.0116, 135.7681] as [number, number],
};

describe("startCityQuery / startCityFromParams", () => {
  it("round-trips a searched city into a blank stop", () => {
    const city = startCityFromParams(new URLSearchParams(startCityQuery(KYOTO)));
    expect(city).toEqual({ ...blankCity(), ...KYOTO });
  });

  it("ignores links without a name or coordinates", () => {
    expect(startCityFromParams(new URLSearchParams(""))).toBeNull();
    expect(startCityFromParams(new URLSearchParams("city=Kyoto&lat=35"))).toBeNull();
    expect(startCityFromParams(new URLSearchParams("lat=35&lng=135"))).toBeNull();
  });

  it("rejects coordinates off the globe or not numbers", () => {
    expect(
      startCityFromParams(new URLSearchParams("city=X&lat=91&lng=0")),
    ).toBeNull();
    expect(
      startCityFromParams(new URLSearchParams("city=X&lat=0&lng=-181")),
    ).toBeNull();
    expect(
      startCityFromParams(new URLSearchParams("city=X&lat=north&lng=0")),
    ).toBeNull();
  });

  it("rejects names the trip schema wouldn't accept", () => {
    const long = "x".repeat(61);
    expect(
      startCityFromParams(new URLSearchParams(`city=${long}&lat=0&lng=0`)),
    ).toBeNull();
    expect(
      startCityFromParams(new URLSearchParams("city=%20&lat=0&lng=0")),
    ).toBeNull();
  });
});
