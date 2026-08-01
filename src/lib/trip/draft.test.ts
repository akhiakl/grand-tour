import { describe, expect, it } from "vitest";

import { makeCitySearchResult } from "@/test/fixtures/geo-search";
import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import {
  createBlankTrip,
  createDraftCity,
  createDraftLeg,
  draftReducer,
  rebuildLegs,
} from "./draft";

describe("createBlankTrip", () => {
  it("starts with no stops and the default title", () => {
    const trip = createBlankTrip();
    expect(trip.cities).toEqual([]);
    expect(trip.legs).toEqual([]);
    expect(trip.title).toBe("Grand Tour");
    expect(trip.createdBy).toBe("guest");
  });
});

describe("createDraftCity", () => {
  it("maps a search result into a City with empty rich fields", () => {
    const result = makeCitySearchResult();
    const city = createDraftCity(result);
    expect(city.name).toBe(result.name);
    expect(city.country).toBe(result.country);
    expect(city.flag).toBe(result.flag);
    expect(city.ll).toEqual(result.ll);
    expect(city.nights).toBe(1);
    expect(city.must).toEqual([]);
    expect(city.budget).toEqual([0, 0]);
  });
});

describe("createDraftLeg", () => {
  it("defaults to an empty train leg", () => {
    expect(createDraftLeg()).toEqual({ mode: "train", label: "", duration: "" });
  });
});

describe("rebuildLegs", () => {
  it("returns the same array when the count already matches", () => {
    const cities = [makeCity(), makeCity()];
    const legs = [makeLeg()];
    expect(rebuildLegs(cities, legs)).toBe(legs);
  });

  it("trims extra legs", () => {
    const cities = [makeCity()];
    const legs = [makeLeg(), makeLeg()];
    expect(rebuildLegs(cities, legs)).toEqual([]);
  });

  it("pads with default legs", () => {
    const cities = [makeCity(), makeCity(), makeCity()];
    const legs = [makeLeg({ label: "kept" })];
    const result = rebuildLegs(cities, legs);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("kept");
    expect(result[1]).toEqual(createDraftLeg());
  });

  it("never goes negative for an empty city list", () => {
    expect(rebuildLegs([], [makeLeg()])).toEqual([]);
  });
});

describe("draftReducer", () => {
  it("sets the title", () => {
    const trip = makeTrip(0, { title: "Old" });
    expect(draftReducer(trip, { type: "setTitle", title: "New" }).title).toBe("New");
  });

  it("adds a city and rebuilds legs", () => {
    const trip = makeTrip(1);
    const next = draftReducer(trip, {
      type: "addCity",
      result: makeCitySearchResult(),
    });
    expect(next.cities).toHaveLength(2);
    expect(next.legs).toHaveLength(1);
  });

  it("refuses to add past the guest limit", () => {
    const trip = makeTrip(5);
    const next = draftReducer(trip, {
      type: "addCity",
      result: makeCitySearchResult(),
    });
    expect(next).toBe(trip);
  });

  it("removes a city and rebuilds legs", () => {
    const trip = makeTrip(3);
    const next = draftReducer(trip, { type: "removeCity", index: 1 });
    expect(next.cities).toHaveLength(2);
    expect(next.legs).toHaveLength(1);
  });

  it("reorders cities and keeps legs in sync", () => {
    const first = makeCity({ name: "First" });
    const second = makeCity({ name: "Second" });
    const trip = makeTrip(0, { cities: [first, second], legs: [makeLeg()] });
    const next = draftReducer(trip, { type: "reorderCities", from: 0, to: 1 });
    expect(next.cities.map((city) => city.name)).toEqual(["Second", "First"]);
    expect(next.legs).toHaveLength(1);
  });

  it("patches a single city by index", () => {
    const trip = makeTrip(2);
    const next = draftReducer(trip, {
      type: "updateCity",
      index: 0,
      patch: { nights: 9 },
    });
    expect(next.cities[0].nights).toBe(9);
    expect(next.cities[1]).toBe(trip.cities[1]);
  });

  it("patches a single leg by index", () => {
    const trip = makeTrip(2);
    const next = draftReducer(trip, {
      type: "updateLeg",
      index: 0,
      patch: { label: "Direct flight" },
    });
    expect(next.legs[0].label).toBe("Direct flight");
  });
});
