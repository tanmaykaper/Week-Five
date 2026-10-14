import { describe, expect, it } from "vitest";
import {
  dateOfDay,
  displayWeek,
  greetingWord,
  inShedWindow,
  isISODate,
  journeyDay,
  nextPhotoWeek,
  parseISODate,
  phaseOf,
  phasePhrase,
  photoWeekDue,
  progress,
  toISODate,
  weekOf,
} from "@/lib/time/journey";
import { effectiveNow } from "@/lib/time/clock";

const at = (iso: string, h = 12, m = 0) => {
  const d = parseISODate(iso);
  d.setHours(h, m);
  return d;
};

describe("journeyDay", () => {
  it("counts the start date as day 1", () => {
    expect(journeyDay("2026-09-10", at("2026-09-10"))).toBe(1);
  });
  it("matches the brief: day 34 is week 5", () => {
    const now = at("2026-10-13");
    expect(journeyDay("2026-09-10", now)).toBe(34);
    expect(weekOf(34)).toBe(5);
  });
  it("ignores the time of day", () => {
    expect(journeyDay("2026-09-10", at("2026-09-11", 0, 1))).toBe(2);
    expect(journeyDay("2026-09-10", at("2026-09-11", 23, 59))).toBe(2);
  });
  it("goes zero or negative before the start", () => {
    expect(journeyDay("2026-09-10", at("2026-09-09"))).toBe(0);
    expect(journeyDay("2026-09-10", at("2026-09-01"))).toBe(-8);
  });
  it("survives a month and year boundary", () => {
    expect(journeyDay("2026-12-25", at("2027-01-01"))).toBe(8);
  });
});

describe("weeks and phases", () => {
  it("maps days to weeks", () => {
    expect([0, 1, 7, 8, 14, 15, 168, 169].map(weekOf)).toEqual([0, 1, 1, 2, 2, 3, 24, 25]);
    expect(displayWeek(200)).toBe(24);
  });
  it("puts phase boundaries where the docs say", () => {
    expect(phaseOf(0)).toBe("not-started");
    expect(phaseOf(14)).toBe("calm");
    expect(phaseOf(15)).toBe("shed");
    expect(phaseOf(56)).toBe("shed");
    expect(phaseOf(57)).toBe("settling");
    expect(phaseOf(85)).toBe("first-hairs");
    expect(phaseOf(127)).toBe("building");
    expect(phaseOf(168)).toBe("judgement");
    expect(phaseOf(176)).toBe("beyond");
  });
  it("knows the shed window", () => {
    expect(inShedWindow(14)).toBe(false);
    expect(inShedWindow(15)).toBe(true);
    expect(inShedWindow(56)).toBe(true);
    expect(inShedWindow(57)).toBe(false);
  });
  it("writes the week five phrase", () => {
    expect(phasePhrase(34)).toBe("the part everyone finds hardest");
    expect(phasePhrase(22)).toBe("the shed window");
    expect(phasePhrase(3)).toBe("the quiet start");
  });
});

describe("progress", () => {
  it("is clamped between 0 and 1", () => {
    expect(progress(-5)).toBe(0);
    expect(progress(84)).toBe(0.5);
    expect(progress(400)).toBe(1);
  });
});

describe("photo days", () => {
  it("opens the week 4 window from day 26 to day 33", () => {
    expect(photoWeekDue(25)).toBeNull();
    expect(photoWeekDue(26)).toBe(4);
    expect(photoWeekDue(33)).toBe(4);
    expect(photoWeekDue(34)).toBeNull();
  });
  it("finds the next photo week", () => {
    expect(nextPhotoWeek(34)).toBe(8);
    expect(nextPhotoWeek(168)).toBe(24);
    expect(nextPhotoWeek(169)).toBeNull();
  });
});

describe("dates", () => {
  it("round-trips ISO dates and rejects bad ones", () => {
    expect(toISODate(parseISODate("2026-02-28"))).toBe("2026-02-28");
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("14-10-2026")).toBe(false);
  });
  it("finds the date of a journey day", () => {
    expect(toISODate(dateOfDay("2026-09-10", 34))).toBe("2026-10-13");
  });
  it("greets by time of day", () => {
    expect(greetingWord(at("2026-10-13", 8))).toBe("Morning");
    expect(greetingWord(at("2026-10-13", 23))).toBe("Still up");
    expect(greetingWord(at("2026-10-13", 3))).toBe("Still up");
  });
});

describe("clock", () => {
  it("returns the real time outside demo mode", () => {
    const real = at("2026-10-14", 21, 30);
    expect(effectiveNow(real, null)).toBe(real);
  });
  it("jumps to the demo day but keeps the time of day", () => {
    const real = at("2026-10-14", 21, 30);
    const now = effectiveNow(real, { startDate: "2026-09-10", day: 35 });
    expect(toISODate(now)).toBe("2026-10-14");
    expect(now.getHours()).toBe(21);
    expect(journeyDay("2026-09-10", effectiveNow(real, { startDate: "2026-09-10", day: 5 }))).toBe(5);
  });
});
