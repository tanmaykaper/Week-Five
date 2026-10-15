import { describe, expect, it } from "vitest";
import { compareChoices, dayOneOf, firstPhotoWeek, lightDiffers, nudgeDivider, photoDays, weekToTake } from "@/lib/mirror";
import type { PhotoRecord, View } from "@/lib/storage/photos";
import { dateOfDay } from "@/lib/time/journey";

const START = "2026-09-01";
const onDay = (day: number, hour = 21) => {
  const d = dateOfDay(START, day);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const photo = (view: View, week: number, day: number, luminance = 120): PhotoRecord => ({
  id: `${view}-${week}-${day}`,
  view,
  week,
  takenAt: onDay(day).toISOString(),
  blob: new Blob(),
  width: 800,
  height: 800,
  luminance,
});
const set = (week: number, day: number) => (["crown", "hairline", "parting"] as View[]).map((v) => photo(v, week, day));

describe("photo days", () => {
  it("day one, then the six photo weeks, each with where it stands", () => {
    const photos = [...set(0, 1), ...set(4, 28)];
    const days = photoDays(photos, START, 35, onDay(35, 22));
    expect(days.map((d) => d.week)).toEqual([0, 4, 8, 12, 16, 20, 24]);
    expect(days.map((d) => d.status)).toEqual(["taken", "taken", "upcoming", "upcoming", "upcoming", "upcoming", "upcoming"]);
    expect(Object.keys(days[1]!.views).sort()).toEqual(["crown", "hairline", "parting"]);
    expect(days[2]!.date.getDate()).toBe(onDay(56).getDate());
  });

  it("opens a week two days before it and keeps it open ten days late", () => {
    const photos = set(0, 1);
    const status = (day: number) => photoDays(photos, START, day, onDay(day, 22))[1]!;
    expect(status(25).status).toBe("upcoming");
    expect(status(26)).toMatchObject({ status: "due", open: true });
    expect(status(33)).toMatchObject({ status: "due", open: true });
    expect(status(34)).toMatchObject({ status: "late", open: true });
    expect(status(43)).toMatchObject({ status: "late", open: true });
    expect(status(44)).toMatchObject({ status: "missed", open: false });
  });

  it("ignores photos from the future (a demo plan holds all 24 weeks)", () => {
    const photos = [...set(0, 1), ...set(4, 28), ...set(8, 56)];
    const days = photoDays(photos, START, 35, onDay(35, 22));
    expect(days[2]!.status).toBe("upcoming");
    expect(days[2]!.views).toEqual({});
  });

  it("skips photo weeks that come too soon after a late day one", () => {
    expect(firstPhotoWeek(1)).toBe(4);
    expect(firstPhotoWeek(15)).toBe(8);
    expect(firstPhotoWeek(25)).toBe(8);
    const photos = set(0, 25);
    const days = photoDays(photos, START, 27, onDay(27, 22));
    expect(days[1]).toMatchObject({ week: 4, status: "early", open: false });
    expect(weekToTake(days)).toBeNull();
  });

  it("asks for the open week, or the rest of a half-taken set, and nothing without day one", () => {
    expect(weekToTake(photoDays(set(0, 1), START, 29, onDay(29, 22)))?.week).toBe(4);
    const half = [...set(0, 1), photo("crown", 4, 28)];
    expect(weekToTake(photoDays(half, START, 29, onDay(29, 22)))?.week).toBe(4);
    expect(weekToTake(photoDays([...set(0, 1), ...set(4, 28)], START, 29, onDay(29, 22)))).toBeNull();
    expect(weekToTake(photoDays([], START, 29, onDay(29, 22)))).toBeNull();
  });
});

describe("comparing", () => {
  it("offers one photo per later week for the view, oldest first, newest retake winning", () => {
    const photos = [...set(0, 1), photo("crown", 8, 56), photo("crown", 4, 27), photo("crown", 4, 29), photo("hairline", 4, 28)];
    const choices = compareChoices(photos, "crown", onDay(60, 22));
    expect(choices.map((p) => p.week)).toEqual([4, 8]);
    expect(choices[0]!.id).toBe("crown-4-29");
    expect(dayOneOf(photos, "crown", onDay(60, 22))?.week).toBe(0);
    expect(dayOneOf([], "crown", onDay(60, 22))).toBeNull();
  });

  it("warns when the light differs by more than 25", () => {
    expect(lightDiffers({ luminance: 120 }, { luminance: 145 })).toBe(false);
    expect(lightDiffers({ luminance: 120 }, { luminance: 146 })).toBe(true);
    expect(lightDiffers({ luminance: 150 }, { luminance: 100 })).toBe(true);
  });

  it("moves the divider with the keys, inside 0 to 100", () => {
    expect(nudgeDivider(50, "ArrowRight")).toBe(55);
    expect(nudgeDivider(50, "ArrowLeft")).toBe(45);
    expect(nudgeDivider(98, "ArrowRight")).toBe(100);
    expect(nudgeDivider(10, "PageDown")).toBe(0);
    expect(nudgeDivider(40, "Home")).toBe(0);
    expect(nudgeDivider(40, "End")).toBe(100);
    expect(nudgeDivider(40, "Enter")).toBeNull();
  });
});
