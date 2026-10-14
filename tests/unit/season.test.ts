import { describe, expect, it } from "vitest";
import { CITIES, cityById, searchCities } from "@/content/cities";
import { monsoonMonths, seasonFor } from "@/lib/season";

describe("monsoon months", () => {
  it("uses the city's own months", () => {
    expect(monsoonMonths("chennai", null)).toEqual([10, 11, 12]);
    expect(monsoonMonths("mumbai", null)).toEqual([6, 7, 8, 9]);
  });

  it("falls back to June to September when skipped or somewhere else with rains", () => {
    expect(monsoonMonths(null, null)).toEqual([6, 7, 8, 9]);
    expect(monsoonMonths(null, "monsoon")).toEqual([6, 7, 8, 9]);
  });

  it("switches off when someone says there is no monsoon", () => {
    expect(monsoonMonths("mumbai", "no-monsoon")).toEqual([]);
    expect(seasonFor("2026-07-01", "mumbai", "no-monsoon")).toEqual({ months: [], weeks: null, overlapsShed: false });
  });
});

describe("where the rains sit on the plan", () => {
  it("a Mumbai start in early June gets the rains over the shed window", () => {
    const s = seasonFor("2026-06-05", "mumbai", null);
    expect(s.weeks).toEqual([1, 17]);
    expect(s.overlapsShed).toBe(true);
  });

  it("a Mumbai start in mid October has no rains in its 24 weeks", () => {
    expect(seasonFor("2026-10-14", "mumbai", null)).toMatchObject({ weeks: null, overlapsShed: false });
  });

  it("a Chennai start in mid October is all northeast monsoon early on", () => {
    const s = seasonFor("2026-10-14", "chennai", null);
    expect(s.weeks).toEqual([1, 12]);
    expect(s.overlapsShed).toBe(true);
  });

  it("a January start meets the next monsoon right at the end", () => {
    const s = seasonFor("2027-01-01", "pune", null);
    expect(s.weeks).toEqual([22, 24]);
    expect(s.overlapsShed).toBe(false);
  });

  it("rains that start after the shed window are not called an overlap", () => {
    // 1 June is day 62, week 9: just after the shed window closes on day 56.
    const s = seasonFor("2026-04-01", "kolkata", null);
    expect(s.weeks).toEqual([9, 24]);
    expect(s.overlapsShed).toBe(false);
  });
});

describe("cities", () => {
  it("has unique ids, including every id the demo people use", () => {
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length);
    for (const id of ["mumbai", "delhi", "pune"]) expect(cityById(id)).toBeDefined();
  });

  it("searches by the start of the name first, then the state", () => {
    expect(searchCities("pu")[0]?.id).toBe("pune");
    expect(searchCities("kerala").map((c) => c.id)).toEqual(["kochi", "thiruvananthapuram"]);
    expect(searchCities("  ").length).toBeGreaterThan(0);
  });
});
