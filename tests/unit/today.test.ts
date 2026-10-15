import { describe, expect, it } from "vitest";
import { latestCheckin, makeCheckin, redCard, respond } from "@/lib/checkin";
import { cohort, cohortGlance } from "@/lib/cohort";
import { activeSlots, isDone, setDose, slotItems, streak } from "@/lib/doses";
import { reorderAllowed, runway } from "@/lib/runway";
import type { CheckIn, DoseLog } from "@/lib/storage/schema";
import { todayNote, type NoteContext } from "@/lib/today-note";

const at = (iso: string) => new Date(iso);

describe("doses and the streak", () => {
  it("puts the topical in both slots and gummies in the evening, never an amount", () => {
    expect(slotItems(["solution", "gummies"])).toEqual({ am: ["solution"], pm: ["solution", "gummies"] });
    expect(activeSlots(["gummies"])).toEqual(["pm"]);
    expect(activeSlots(["shampoo"])).toEqual([]);
  });

  it("replaces a slot's entry when it is toggled", () => {
    let doses: DoseLog[] = [];
    doses = setDose(doses, "2026-10-14", "am", true, at("2026-10-14T08:00:00"));
    doses = setDose(doses, "2026-10-14", "am", false, at("2026-10-14T08:05:00"));
    expect(doses).toHaveLength(1);
    expect(isDone(doses, "2026-10-14", "am", at("2026-10-14T09:00:00"))).toBe(false);
  });

  it("ignores doses logged after now (demo mode carries the whole plan)", () => {
    const doses = setDose([], "2026-10-14", "pm", true, at("2026-10-14T21:35:00"));
    expect(isDone(doses, "2026-10-14", "pm", at("2026-10-14T20:00:00"))).toBe(false);
    expect(isDone(doses, "2026-10-14", "pm", at("2026-10-14T22:00:00"))).toBe(true);
  });

  it("counts full days in a row, and an unfinished today doesn't break it", () => {
    let doses: DoseLog[] = [];
    for (const d of ["2026-10-11", "2026-10-12", "2026-10-13"]) {
      doses = setDose(doses, d, "am", true, at(`${d}T08:00:00`));
      doses = setDose(doses, d, "pm", true, at(`${d}T21:00:00`));
    }
    doses = setDose(doses, "2026-10-14", "am", true, at("2026-10-14T08:00:00"));
    expect(streak(doses, ["am", "pm"], "2026-10-14", at("2026-10-14T12:00:00"))).toBe(3);
    doses = setDose(doses, "2026-10-14", "pm", true, at("2026-10-14T21:00:00"));
    expect(streak(doses, ["am", "pm"], "2026-10-14", at("2026-10-14T22:00:00"))).toBe(4);
    expect(streak(doses, ["am", "pm"], "2026-10-14", at("2026-10-14T22:00:00"), "2026-10-13")).toBe(2);
    expect(streak([], ["am"], "2026-10-14", at("2026-10-14T22:00:00"))).toBe(0);
  });
});

const ci = (over: Partial<CheckIn>): CheckIn => ({ id: "c", at: "2026-10-14T09:00:00.000Z", day: 35, shed: 1, worry: 1, missedDoses: 0, redFlags: [], ...over });

describe("supply and the reorder rule", () => {
  it("counts days left on the newest pack", () => {
    const r = runway(
      [
        { sku: "WF-SOL-60", reg: "2026-09-01", scannedAt: "2026-09-01T10:00:00.000Z" },
        { sku: "WF-SOL-90", reg: "2026-10-01", scannedAt: "2026-10-01T10:00:00.000Z" },
      ],
      at("2026-10-14T12:00:00"),
    )!;
    expect(r.sku.code).toBe("WF-SOL-90");
    expect(r.daysLeft).toBe(32);
    expect(r.runsOut.getDate()).toBe(15);
    expect(r.runsOut.getMonth()).toBe(10);
  });

  it("knows nothing without a known pack", () => {
    expect(runway([], new Date())).toBeNull();
    expect(runway([{ sku: "NOPE", reg: "2026-10-01", scannedAt: "2026-10-01T10:00:00.000Z" }], new Date())).toBeNull();
  });

  it("holds the reorder prompt for 24 hours after an uneasy check-in", () => {
    const now = at("2026-10-14T20:00:00.000Z");
    expect(reorderAllowed([ci({ shed: 3 })], now)).toBe(false);
    expect(reorderAllowed([ci({ worry: 4 })], now)).toBe(false);
    expect(reorderAllowed([ci({ redFlags: ["rash"] })], now)).toBe(false);
    expect(reorderAllowed([ci({ shed: 1, worry: 1 })], now)).toBe(true);
    expect(reorderAllowed([ci({ shed: 4, at: "2026-10-13T08:00:00.000Z" })], now)).toBe(true);
    // A check-in from later in a demo plan doesn't count yet.
    expect(reorderAllowed([ci({ shed: 4, at: "2026-10-15T08:00:00.000Z" })], now)).toBe(true);
  });

  it("respects a snooze", () => {
    expect(reorderAllowed([], at("2026-10-14T12:00:00"), "2026-10-17")).toBe(false);
    expect(reorderAllowed([], at("2026-10-17T12:00:00"), "2026-10-17")).toBe(true);
  });
});

describe("check-in answers", () => {
  it("lets red flags win, the most urgent first", () => {
    expect(redCard({ redFlags: ["rash", "dizzy-or-racing-heart"], shed: 1 }, 30)).toMatch(/needs a doctor today/);
    expect(redCard({ redFlags: ["burning"], shed: 1 }, 30)).toMatch(/before your next application/);
    expect(redCard({ redFlags: ["other-unusual"], shed: 1 }, 30)).toMatch(/Trust that/);
    expect(redCard({ redFlags: [], shed: 4 }, 120)).toMatch(/isn't the usual pattern/);
    expect(redCard({ redFlags: [], shed: 4 }, 40)).toBeNull();
    expect(respond({ redFlags: ["pain"], shed: 0, worry: 0 }, 10).kind).toBe("red");
  });

  it("answers doubt in the shed window with the day-one photo and the map", () => {
    const a = respond({ redFlags: [], shed: 3, worry: 2 }, 35);
    expect(a).toMatchObject({ kind: "uneasy", showBaseline: true, showMap: true });
    expect(a.text).toMatch(/week 5 looks like/);
    expect(respond({ redFlags: [], shed: 1, worry: 1 }, 35)).toMatchObject({ kind: "easy", showBaseline: false });
    expect(respond({ redFlags: [], shed: 4, worry: 4 }, 140).text).toMatch(/doctor/);
  });

  it("builds a valid check-in and finds the latest one up to now", () => {
    const now = at("2026-10-14T09:00:00.000Z");
    const c = makeCheckin({ shed: 3, worry: 2, missedDoses: 20, redFlags: [], note: "  fine  " }, 35, now);
    expect(c).toMatchObject({ day: 35, missedDoses: 14, note: "fine" });
    expect(makeCheckin({ shed: 0, worry: 0, missedDoses: 0, redFlags: [], note: "  " }, 1, now).note).toBeUndefined();
    const list = [ci({ id: "a", at: "2026-10-10T09:00:00.000Z" }), ci({ id: "b", at: "2026-10-13T09:00:00.000Z" }), ci({ id: "c", at: "2026-10-20T09:00:00.000Z" })];
    expect(latestCheckin(list, now)?.id).toBe("b");
  });
});

describe("the cohort", () => {
  it("is the same 40 people for the same start date, and different for another", () => {
    expect(cohort("2026-09-10")).toEqual(cohort("2026-09-10"));
    expect(cohort("2026-09-10")).toHaveLength(40);
    expect(cohort("2026-09-11").map((m) => m.firstName)).not.toEqual(cohort("2026-09-10").map((m) => m.firstName));
    expect(cohort("2026-09-10").every((m) => Math.abs(m.offset) <= 14)).toBe(true);
  });

  it("says something warm and specific", () => {
    const g = cohortGlance("2026-09-10", 35);
    expect(g.week).toBe(5);
    expect(g.startWeek.every((m) => Math.abs(m.offset) <= 3)).toBe(true);
    expect(g.event).toMatch(/^\w+ from [\w ]+ (took their week \d+ photos|finished week \d+|checked in today|starts in a few days)\.$/);
  });
});

describe("today's note", () => {
  const base: NoteContext = {
    day: 35,
    now: at("2026-10-14T10:00:00"),
    channel: "assessment",
    season: { months: [], weeks: null, overlapsShed: false },
    checkins: [],
    latest: null,
    hasBaseline: true,
    photoWeeks: [0, 4],
  };

  it("lets a recent red flag win over everything", () => {
    const latest = ci({ at: "2026-10-13T10:00:00", redFlags: ["swelling"] });
    expect(todayNote({ ...base, latest, checkins: [latest] })).toMatchObject({ id: "red", tone: "serious" });
  });

  it("reframes a high-shed check-in in the shed window with the day-one photo", () => {
    const latest = ci({ at: "2026-10-13T10:00:00", shed: 3 });
    expect(todayNote({ ...base, latest, checkins: [latest] })).toMatchObject({ id: "shed-high", attach: "baseline" });
  });

  it("asks for day-one photos first when there are none", () => {
    expect(todayNote({ ...base, day: 3, hasBaseline: false, photoWeeks: [] })).toMatchObject({ id: "calm-no-baseline", attach: "photos" });
  });

  it("knows week five, the rains and the photo days", () => {
    expect(todayNote({ ...base, latest: ci({ at: "2026-10-13T10:00:00" }) }).id).toBe("shed-week-five");
    expect(todayNote({ ...base, day: 40, season: { months: [6, 7, 8, 9], weeks: [1, 6], overlapsShed: true }, latest: ci({ at: "2026-10-13T10:00:00" }) }).id).toBe("shed-monsoon");
    expect(todayNote({ ...base, day: 28, photoWeeks: [0], latest: ci({ at: "2026-10-13T10:00:00" }) })).toMatchObject({ id: "photo-due", attach: "photos" });
  });

  it("forgets check-ins older than a week, and nudges for a new one", () => {
    const old = ci({ at: "2026-10-01T10:00:00", shed: 4 });
    expect(todayNote({ ...base, day: 45, latest: old, checkins: [old] }).id).toBe("no-checkin-week");
  });

  it("has something to say before the start and long after it", () => {
    expect(todayNote({ ...base, day: -2 }).id).toBe("not-started");
    expect(todayNote({ ...base, day: 200, latest: ci({ at: "2026-10-13T10:00:00" }) }).id).toBe("beyond-keep");
  });
});
