import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import {
  addCity,
  canAddCity,
  createBlankDraft,
  draftFromTrip,
  draftToTrip,
  isShareable,
  moveCity,
  removeCityAt,
  updateCityAt,
  updateLegAt,
  updateTitle,
  type DraftTrip,
} from "./draft";
import { DEFAULT_TRIP_TITLE, GUEST_MAX_CITIES } from "./schema";

describe("createBlankDraft", () => {
  it("starts empty with the default title", () => {
    expect(createBlankDraft()).toEqual({
      title: DEFAULT_TRIP_TITLE,
      cities: [],
      legs: [],
    });
  });
});

describe("draftFromTrip", () => {
  it("lifts a saved trip's title/cities/legs into a draft", () => {
    const trip = makeTrip(3, { title: "Old Roads" });
    expect(draftFromTrip(trip)).toEqual({
      title: "Old Roads",
      cities: trip.cities,
      legs: trip.legs,
    });
  });
});

describe("addCity", () => {
  it("appends a city and grows legs to match", () => {
    const draft = addCity(createBlankDraft(), makeCity({ name: "Vienna" }));
    expect(draft.cities).toHaveLength(1);
    expect(draft.legs).toHaveLength(0);

    const withSecond = addCity(draft, makeCity({ name: "Prague" }));
    expect(withSecond.cities.map((c) => c.name)).toEqual(["Vienna", "Prague"]);
    expect(withSecond.legs).toHaveLength(1);
  });

  it("refuses to add past the guest ceiling", () => {
    let draft: DraftTrip = createBlankDraft();
    for (let i = 0; i < GUEST_MAX_CITIES; i++) {
      draft = addCity(draft, makeCity({ name: `City ${i}` }));
    }
    expect(canAddCity(draft)).toBe(false);

    const attempted = addCity(draft, makeCity({ name: "One Too Many" }));
    expect(attempted).toBe(draft);
    expect(attempted.cities).toHaveLength(GUEST_MAX_CITIES);
  });
});

describe("removeCityAt", () => {
  it("drops the city and rebuilds legs to the new length", () => {
    const draft = draftFromTrip(makeTrip(3));
    const result = removeCityAt(draft, 1);
    expect(result.cities).toHaveLength(2);
    expect(result.legs).toHaveLength(1);
  });

  it("reuses the surviving leg's data positionally", () => {
    const draft: DraftTrip = {
      title: "T",
      cities: [
        makeCity({ name: "A" }),
        makeCity({ name: "B" }),
        makeCity({ name: "C" }),
      ],
      legs: [makeLeg({ label: "A to B" }), makeLeg({ label: "B to C" })],
    };
    const result = removeCityAt(draft, 2);
    expect(result.legs).toEqual([makeLeg({ label: "A to B" })]);
  });
});

describe("moveCity", () => {
  it("reorders cities and keeps legs at the correct length", () => {
    const draft = draftFromTrip(makeTrip(3));
    const names = draft.cities.map((c) => c.name);

    const moved = moveCity(draft, 0, 2);
    expect(moved.cities.map((c) => c.name)).toEqual([names[1], names[2], names[0]]);
    expect(moved.legs).toHaveLength(2);
  });

  it("is a no-op for an out-of-range index", () => {
    const draft = draftFromTrip(makeTrip(2));
    expect(moveCity(draft, 0, 5)).toBe(draft);
    expect(moveCity(draft, -1, 0)).toBe(draft);
    expect(moveCity(draft, 0, 0)).toBe(draft);
  });
});

describe("updateCityAt / updateLegAt / updateTitle", () => {
  it("patches a single city without touching the others", () => {
    const draft = draftFromTrip(makeTrip(2));
    const result = updateCityAt(draft, 0, { nights: 9 });
    expect(result.cities[0].nights).toBe(9);
    expect(result.cities[1]).toBe(draft.cities[1]);
  });

  it("patches a single leg", () => {
    const draft = draftFromTrip(makeTrip(2));
    const result = updateLegAt(draft, 0, { mode: "flight" });
    expect(result.legs[0].mode).toBe("flight");
  });

  it("replaces the title", () => {
    const result = updateTitle(createBlankDraft(), "Coastal Loop");
    expect(result.title).toBe("Coastal Loop");
  });
});

describe("isShareable", () => {
  it("requires at least 2 cities and a non-blank title", () => {
    expect(isShareable(createBlankDraft())).toBe(false);
    expect(isShareable(draftFromTrip(makeTrip(1)))).toBe(false);
    expect(isShareable(draftFromTrip(makeTrip(2)))).toBe(true);
    expect(isShareable(updateTitle(draftFromTrip(makeTrip(2)), "   "))).toBe(false);
  });
});

describe("draftToTrip", () => {
  it("stamps a valid draft into a full Trip with the given createdAt", () => {
    const draft = draftFromTrip(makeTrip(2, { title: "Alpine Loop" }));
    const trip = draftToTrip(draft, 12345);
    expect(trip).not.toBeNull();
    expect(trip?.createdAt).toBe(12345);
    expect(trip?.createdBy).toBe("guest");
    expect(trip?.title).toBe("Alpine Loop");
  });

  it("returns null while the draft doesn't meet the schema yet", () => {
    expect(draftToTrip(createBlankDraft(), Date.now())).toBeNull();
    expect(draftToTrip(draftFromTrip(makeTrip(1)), Date.now())).toBeNull();
  });
});
