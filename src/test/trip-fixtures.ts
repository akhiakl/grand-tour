import type { City, Leg, Trip } from "@/lib/schema";

/** Builders for a small, always-valid trip used across unit tests. */

export const makeCity = (overrides: Partial<City> = {}): City => ({
  name: "Vienna",
  country: "Austria",
  flag: "🇦🇹",
  ll: [48.2082, 16.3738],
  nights: 3,
  why: "Imperial boulevards, coffee houses and the Ringstrasse.",
  must: ["Schönbrunn", "Kunsthistorisches Museum"],
  gems: ["Palmenhaus"],
  food: [["Sachertorte", "Chocolate cake at Café Sacher"]],
  days: [["Day 1", "Old town", "Stephansdom, Graben, coffee house evening"]],
  budget: [90, 160],
  transport: "U-Bahn day passes",
  stay: "Innere Stadt for walkability",
  tips: ["Book opera standing tickets at dawn"],
  ...overrides,
});

export const makeLeg = (overrides: Partial<Leg> = {}): Leg => ({
  mode: "train",
  label: "Railjet via Linz",
  duration: "~2h 30m",
  ...overrides,
});

export const makeTrip = (cityCount = 2, overrides: Partial<Trip> = {}): Trip => ({
  v: 1,
  title: "Grand Tour",
  cities: Array.from({ length: cityCount }, () => makeCity()),
  legs: Array.from({ length: cityCount - 1 }, () => makeLeg()),
  createdBy: "guest",
  createdAt: 1700000000000,
  ...overrides,
});
