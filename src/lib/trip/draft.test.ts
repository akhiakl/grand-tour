import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import {
  addCity,
  canAddCity,
  clampNights,
  createBlankDraft,
  draftFromTrip,
  draftIssues,
  indexAfterMove,
  indexAfterRemove,
  draftToTrip,
  isShareable,
  moveCity,
  removeCityAt,
  updateCityAt,
  updateLegAt,
  updateStartDate,
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
  it("requires at least 2 cities; field problems are left to draftIssues", () => {
    expect(isShareable(createBlankDraft())).toBe(false);
    expect(isShareable(draftFromTrip(makeTrip(1)))).toBe(false);
    expect(isShareable(draftFromTrip(makeTrip(2)))).toBe(true);
    expect(isShareable(updateTitle(draftFromTrip(makeTrip(2)), "   "))).toBe(true);
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

describe("clampNights", () => {
  it("keeps whole nights inside 0–30", () => {
    expect(clampNights(4)).toBe(4);
    expect(clampNights(2.7)).toBe(2);
    expect(clampNights(-3)).toBe(0);
    expect(clampNights(99)).toBe(30);
    expect(clampNights(Number.NaN)).toBe(0);
  });
});

describe("draftIssues", () => {
  it("is empty for a valid draft", () => {
    expect(draftIssues(draftFromTrip(makeTrip(2)))).toEqual({});
  });

  it("points at a blank title and blank stop names in plain words", () => {
    const draft = updateCityAt(updateTitle(draftFromTrip(makeTrip(3)), "  "), 1, {
      name: " ",
    });
    expect(draftIssues(draft)).toEqual({
      title: "Give your map a title.",
      "cities.1.name": "Give this stop a name.",
    });
  });

  it("flags out-of-range nights on the right stop", () => {
    const draft = updateCityAt(draftFromTrip(makeTrip(2)), 0, { nights: 31 });
    expect(draftIssues(draft)).toEqual({
      "cities.0.nights": "Nights run from 0 to 30.",
    });
  });

  it("ignores trip-wide count rules that have no single field", () => {
    expect(draftIssues(createBlankDraft())).toEqual({});
    expect(draftIssues(draftFromTrip(makeTrip(1)))).toEqual({});
  });

  it("falls back to the schema message for other fields", () => {
    const draft = updateLegAt(draftFromTrip(makeTrip(2)), 0, {
      duration: "x".repeat(21),
    });
    expect(Object.keys(draftIssues(draft))).toEqual(["legs.0.duration"]);
  });
});

describe("indexAfterMove / indexAfterRemove", () => {
  it("follows the moved stop and shifts the ones it passed", () => {
    expect(indexAfterMove(1, 1, 3)).toBe(3);
    expect(indexAfterMove(2, 1, 3)).toBe(1);
    expect(indexAfterMove(3, 1, 3)).toBe(2);
    expect(indexAfterMove(2, 3, 1)).toBe(3);
    expect(indexAfterMove(1, 3, 1)).toBe(2);
    expect(indexAfterMove(0, 3, 1)).toBe(0);
    expect(indexAfterMove(4, 1, 3)).toBe(4);
  });

  it("drops the removed stop and shifts later ones up", () => {
    expect(indexAfterRemove(2, 2)).toBeNull();
    expect(indexAfterRemove(3, 2)).toBe(2);
    expect(indexAfterRemove(1, 2)).toBe(1);
  });
});

describe("updateStartDate", () => {
  it("dates and undates a draft, carried through to the trip", () => {
    const dated = updateStartDate(draftFromTrip(makeTrip(2)), "2027-05-01");
    expect(dated.startDate).toBe("2027-05-01");
    expect(draftToTrip(dated, 1)?.startDate).toBe("2027-05-01");
    expect(draftFromTrip(draftToTrip(dated, 1)!).startDate).toBe("2027-05-01");

    const undated = updateStartDate(dated, "");
    expect("startDate" in undated).toBe(false);
    expect(draftToTrip(undated, 1)?.startDate).toBeUndefined();
  });

  it("reports an impossible date as a field issue", () => {
    const draft = updateStartDate(draftFromTrip(makeTrip(2)), "2027-02-30");
    expect(draftIssues(draft)).toEqual({ startDate: "Pick a real calendar date." });
  });
});
