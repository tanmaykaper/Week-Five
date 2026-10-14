import { describe, expect, it } from "vitest";
import { aboutHour, nextPhotos, nextView, painterView, viewAfter } from "@/lib/baseline";

describe("which view comes next", () => {
  it("goes crown, hairline, parting and stops when all three are kept", () => {
    expect(nextView({})).toBe("crown");
    expect(nextView({ crown: 1 })).toBe("hairline");
    expect(nextView({ crown: 1, hairline: 1 })).toBe("parting");
    expect(nextView({ crown: 1, hairline: 1, parting: 1 })).toBeNull();
  });

  it("after a keep, moves to the next missing view, wrapping round", () => {
    expect(viewAfter("crown", { crown: 1 })).toBe("hairline");
    expect(viewAfter("parting", { hairline: 1, parting: 1 })).toBe("crown");
    expect(viewAfter("hairline", { crown: 1, hairline: 1, parting: 1 })).toBeNull();
  });
});

describe("the painter", () => {
  it("opens on the photo of what bothers them most", () => {
    expect(painterView(["hairline", "crown"])).toBe("hairline");
    expect(painterView(["crown"])).toBe("crown");
    expect(painterView(["visible-scalp"])).toBe("parting");
    expect(painterView(["shedding"])).toBe("crown");
    expect(painterView([])).toBe("crown");
  });
});

describe("the next photos", () => {
  it("are on the last day of week 4 for a baseline in the first two weeks, at the same hour", () => {
    const { week, at } = nextPhotos("2026-10-08", 7, 21);
    expect(week).toBe(4);
    expect(at.getFullYear()).toBe(2026);
    expect(at.getMonth()).toBe(10); // November
    expect(at.getDate()).toBe(4);
    expect(at.getHours()).toBe(21);
  });

  it("are at least two weeks after the baseline", () => {
    expect(nextPhotos("2026-10-08", 14, 9).week).toBe(4); // day 28 is 14 days on
    expect(nextPhotos("2026-10-08", 15, 9).week).toBe(8); // 13 days on is too soon
  });

  it("skip to the following photo week when the next one is too close", () => {
    expect(nextPhotos("2026-10-08", 20, 9).week).toBe(8);
    expect(nextPhotos("2026-10-08", 40, 9).week).toBe(8);
    expect(nextPhotos("2026-10-08", 160, 9).week).toBe(24);
  });

  it("before the plan starts, count from day one", () => {
    expect(nextPhotos("2026-11-01", -5, 8).week).toBe(4);
  });
});

describe("a time of day, not an appointment", () => {
  it("reads like speech", () => {
    expect(aboutHour(8)).toBe("8 am");
    expect(aboutHour(21)).toBe("9 pm");
    expect(aboutHour(12)).toBe("midday");
    expect(aboutHour(0)).toBe("midnight");
  });
});
