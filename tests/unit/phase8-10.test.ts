import { describe, expect, it } from "vitest";
import { CARDS, pickInsight } from "@/lib/insights";
import { INSIGHTS_HI, stepCopy } from "@/content/hinglish";
import { STEP_IDS } from "@/content/onboarding";
import { ROUTINE_RULES } from "@/content/routines";
import { icsCalendar } from "@/lib/ics";
import { cohortProvider, simulatedCohort, simulatedEvents, startWeekOf } from "@/lib/providers/cohort";
import { RemoteCohort } from "@/lib/providers/cohort/remote";
import { calendarEvents, dailyEvents, dueItem, reminderSchedule, upcoming } from "@/lib/reminders";
import { hoursApart, routineAdvice, toggleRollerNight, weekPlan } from "@/lib/routine";
import { addPack, removePack } from "@/lib/runway";
import { emptyState, type AppState, type Profile } from "@/lib/storage/schema";

const at = (iso: string) => new Date(iso);

function plan(over: Partial<Profile> = {}, state: Partial<AppState> = {}): AppState {
  const base = emptyState();
  return {
    ...base,
    ...state,
    profile: {
      nickname: "Arjun",
      ageBand: "25-34",
      cityId: "pune",
      products: ["solution", "gummies"],
      packs: [{ sku: "WF-SOL-60", reg: "2026-10-01", scannedAt: "2026-10-01T09:00:00.000Z" }],
      channel: "quick-commerce",
      startDate: "2026-10-01",
      worries: ["crown"],
      seasonOverride: null,
      createdAt: "2026-10-01T09:00:00.000Z",
      ...over,
    },
    onboarding: { step: 9, completedAt: "2026-10-01T09:00:00.000Z" },
  };
}

describe("routine rules", () => {
  it("measures the gap between the two times, across midnight too", () => {
    expect(hoursApart("08:00", "21:30")).toBe(13.5);
    expect(hoursApart("22:00", "09:00")).toBe(11);
  });

  it("suggests timing for what is in the routine, and never mentions an amount", () => {
    const advice = routineAdvice({ products: ["solution", "gummies"], ageBand: "25-34", routine: { morning: "08:00", evening: "20:00" }, rainsNow: false });
    const ids = advice.map((a) => a.id);
    expect(ids).toContain("spacing");
    expect(ids).toContain("gummies-food");
    expect(ids).not.toContain("roller-nights");
    expect(ids).not.toContain("rains");
    for (const rule of ROUTINE_RULES) expect(`${rule.title} ${rule.body}`).not.toMatch(/\b\d+\s?(ml|mg|drops?|%|percent)\b/i);
  });

  it("swaps the twelve-hour tip for the even-gap one when the times are far apart", () => {
    const ids = routineAdvice({ products: ["foam"], ageBand: null, routine: { morning: "07:00", evening: "13:00" }, rainsNow: true }).map((a) => a.id);
    expect(ids).toContain("gap-off");
    expect(ids).not.toContain("spacing");
    expect(ids).toContain("rains");
  });

  it("lays out the week Monday first, with roller nights marked", () => {
    const week = weekPlan(["solution", "roller"], { morning: "08:00", evening: "21:00", rollerNights: [3] });
    expect(week.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(week.find((d) => d.weekday === 3)!.roller).toBe(true);
    expect(week[0]!.slots.map((s) => s.slot)).toEqual(["am", "pm"]);
    expect(toggleRollerNight([3, 1], 3)).toEqual([1]);
    expect(toggleRollerNight([1], 5)).toEqual([1, 5]);
  });
});

describe("reminders", () => {
  it("schedules weekly check-ins, six photo days, the note and the reorder points", () => {
    const s = plan({}, { letter: { text: "Keep going.", writtenAt: "2026-10-01T09:00:00.000Z" } });
    const all = reminderSchedule(s, at("2026-10-05T10:00:00"));
    expect(all.filter((r) => r.kind === "checkin")).toHaveLength(24);
    expect(all.filter((r) => r.kind === "photos").map((r) => r.id)).toEqual(["photos-w4", "photos-w8", "photos-w12", "photos-w16", "photos-w20", "photos-w24"]);
    expect(all.some((r) => r.id === "letter")).toBe(true);
    const reorder = all.filter((r) => r.kind === "reorder");
    // A 30-day pack bought on 1 October runs out on 31 October.
    expect(reorder.map((r) => r.at.getDate())).toEqual([21, 28]);
    expect(upcoming(s, at("2026-10-05T10:00:00"), 2)[0]!.id).toBe("checkin-w1");
  });

  it("writes a calendar file with the repeating daily times", () => {
    const s = plan();
    const text = icsCalendar([...calendarEvents(s, at("2026-10-05T10:00:00")), ...dailyEvents(s, at("2026-10-05T10:00:00"))]);
    expect(text).toContain("BEGIN:VCALENDAR");
    expect(text).toContain("SUMMARY:Week 4 photos");
    expect(text).toMatch(/RRULE:FREQ=DAILY;COUNT=\d+/);
    expect(text).not.toMatch(new RegExp(`[${String.fromCharCode(0x2013, 0x2014)}]`));
  });

  it("puts the reorder banner behind an uneasy check-in", () => {
    const now = at("2026-10-25T10:00:00");
    const calm = plan();
    expect(dueItem(calm, now, 25, () => true)?.id).toBe("reorder-10-2026-10-01");
    const uneasy = plan({}, { checkins: [{ id: "c1", at: "2026-10-25T08:00:00", day: 25, shed: 4, worry: 3, missedDoses: 0, redFlags: [] }] });
    expect(dueItem(uneasy, now, 25, () => true)?.id ?? "").not.toMatch(/^reorder/);
  });

  it("asks for the photos in a photo window until they exist", () => {
    const s = plan({ packs: [] });
    expect(dueItem(s, at("2026-10-28T10:00:00"), 28, () => false)?.id).toBe("photos-w4");
    expect(dueItem(s, at("2026-10-28T10:00:00"), 28, () => true)?.id ?? "").not.toBe("photos-w4");
  });
});

describe("packs", () => {
  it("adds a new pack once, and its products join the routine", () => {
    const p = plan().profile!;
    const next = addPack(p, { sku: "wf-gum-30", reg: "2026-10-20", scannedAt: "2026-10-20T09:00:00.000Z" });
    expect(next.packs).toHaveLength(2);
    expect(next.packs[1]!.sku).toBe("WF-GUM-30");
    expect(next.products).toContain("gummies");
    expect(addPack(next, { sku: "WF-GUM-30", reg: "2026-10-20", scannedAt: "2026-10-21T09:00:00.000Z" }).packs).toHaveLength(2);
    expect(removePack(next, 0).packs.map((x) => x.sku)).toEqual(["WF-GUM-30"]);
  });
});

describe("the demo community", () => {
  it("is the same 40 fictional people on every visit, and labelled simulated", async () => {
    expect(simulatedCohort("2026-10-01")).toEqual(simulatedCohort("2026-10-01"));
    const provider = cohortProvider("2026-10-01");
    expect(provider.isSimulated).toBe(true);
    expect(await provider.cohort()).toHaveLength(40);
    expect(await new RemoteCohort().available()).toBe(false);
  });

  it("only tells warm, result-free events, newest first", () => {
    const people = simulatedCohort("2026-10-01");
    const events = simulatedEvents("2026-10-01", people, 35, 30);
    expect(events.length).toBeGreaterThan(5);
    for (let i = 1; i < events.length; i++) expect(events[i - 1]!.at).toBeGreaterThanOrEqual(events[i]!.at);
    expect(new Set(events.map((e) => e.kind))).not.toContain("rank");
    expect(startWeekOf(people).every((m) => Math.abs(m.offset) <= 3)).toBe(true);
  });
});

describe("Hinglish", () => {
  it("covers every setup question and every insight card", () => {
    for (const id of STEP_IDS) expect(stepCopy(id, "hinglish", false).title).toBeTruthy();
    for (const card of CARDS) expect(INSIGHTS_HI[card.id], card.id).toBeTruthy();
    expect(stepCopy("products", "hinglish", true).title).toMatch(/pack/);
  });

  it("swaps the line but never the card", () => {
    const ctx = {
      day: 35,
      now: at("2026-11-04T10:00:00"),
      startDate: "2026-10-01",
      channel: "assessment" as const,
      products: ["solution" as const],
      cityName: null,
      season: { months: [], weeks: null, overlapsShed: false },
      checkins: [],
      hasBaseline: true,
      photoWeeks: [4],
      letter: null,
      intercepts: [],
      insightLog: [],
      rollerNights: [],
    };
    const en = pickInsight(ctx);
    const hi = pickInsight({ ...ctx, lang: "hinglish" });
    expect(hi.id).toBe(en.id);
    expect(hi.text).toBe(INSIGHTS_HI[en.id]);
  });
});
