import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { tripGpx } from "./gpx";

describe("tripGpx", () => {
  const trip = makeTrip(2, {
    title: "Alps & <more>",
    cities: [
      makeCity({ name: "Vienna", ll: [48.2082, 16.3738] }),
      makeCity({ name: "Salzburg", ll: [47.8095, 13.055] }),
    ],
  });
  const gpx = tripGpx(trip);

  it("is a GPX 1.1 document with the escaped trip name", () => {
    expect(gpx.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain("<name>Alps &amp; &lt;more&gt;</name>");
  });

  it("emits a waypoint per stop with lat/lon from ll", () => {
    expect(gpx).toContain(
      '<wpt lat="48.2082" lon="16.3738"><name>Vienna</name></wpt>',
    );
    expect(gpx).toContain(
      '<wpt lat="47.8095" lon="13.055"><name>Salzburg</name></wpt>',
    );
  });

  it("emits one route through the stops in order", () => {
    const route = gpx.slice(gpx.indexOf("<rte>"));
    expect(route.indexOf("Vienna")).toBeLessThan(route.indexOf("Salzburg"));
    expect(route.match(/<rtept /g)).toHaveLength(2);
  });
});
