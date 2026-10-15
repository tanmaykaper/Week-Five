import { describe, expect, it } from "vitest";
import { citationFor } from "@/content/references";
import { weekText, WEEK_GROUPS } from "@/content/weeks";
import { CARDS, logInsight, pickInsight, reasonSentence, type InsightContext } from "@/lib/insights";
import { letterStatus, revealLetter, writeLetter } from "@/lib/letter";
import { pauseState } from "@/lib/pause";
import { emptyState, type CheckIn, type Intercept } from "@/lib/storage/schema";

const at = (iso: string) => new Date(iso);
const ci = (over: Partial<CheckIn>): CheckIn => ({ id: "c", at: "2026-10-13T10:00:00", day: 34, shed: 1, worry: 1, missedDoses: 0, redFlags: [], ...over });

// Day 35 of a plan started on 10 September, at 10 in the morning.
const base: InsightContext = {
  day: 35,
  now: at("2026-10-14T10:00:00"),
  startDate: "2026-09-10",
  channel: "assessment",
  products: ["solution"],
  cityName: "Pune",
  season: { months: [], weeks: null, overlapsShed: false },
  checkins: [ci({})],
  hasBaseline: true,
  photoWeeks: [0, 4],
  letter: null,
  intercepts: [],
  insightLog: [],
  rollerNights: [],
};

describe("the cards", () => {
  it("are all there, each with two variants, no dashes and a known source", () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(51);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
    for (const c of CARDS) {
      expect(c.variants).toHaveLength(2);
      for (const v of c.variants) expect(v).not.toMatch(/[\u2013\u2014]/);
      for (const r of c.refs) expect(citationFor(r), `${c.id} cites ${r}`).toBeTruthy();
    }
  });

  it("make every red flag serious", () => {
    for (const id of ["red-irritation", "red-systemic", "red-late-heavy", "red-other"]) {
      expect(CARDS.find((c) => c.id === id)?.tone).toBe("serious");
    }
  });
});

describe("picking today's card", () => {
  it("lets a red flag win over everything, with a doctor action", () => {
    const pick = pickInsight({ ...base, checkins: [ci({ redFlags: ["swelling"], shed: 3 })] });
    expect(pick).toMatchObject({ id: "red-systemic", tone: "serious", attach: "doctor" });
    expect(reasonSentence(pick.reasons)).toMatch(/you ticked swelling in face, hands or feet/);
  });

  it("reframes doubt in the shed window with the day-one photo, and says why", () => {
    const pick = pickInsight({ ...base, checkins: [ci({ shed: 3, worry: 2 })] });
    expect(pick).toMatchObject({ id: "shed-high", attach: "baseline" });
    expect(reasonSentence(pick.reasons)).toBe('You\'re seeing this because you\'re on day 35, you said hair fall is "more than usual" and you said worry is "some".');
  });

  it("is calm and number-free at night when worry is high", () => {
    const pick = pickInsight({ ...base, now: at("2026-10-14T23:30:00"), checkins: [ci({ worry: 3, at: "2026-10-14T23:00:00" })] });
    expect(pick).toMatchObject({ id: "night-worry", attach: "breathe", noNumbers: true });
  });

  it("offers the note in weeks four and five while it's sealed", () => {
    const letter = { text: "Give it till April.", writtenAt: "2026-09-10T20:00:00.000Z" };
    expect(pickInsight({ ...base, letter })).toMatchObject({ id: "shed-letter-ready", attach: "letter" });
    expect(pickInsight({ ...base, letter: { ...letter, revealedAt: "2026-10-01T10:00:00.000Z" } }).id).not.toBe("shed-letter-ready");
  });

  it("knows the rains, the photo week and the overdue photos", () => {
    const rains = { months: [6, 7, 8, 9], weeks: [1, 3] as [number, number], overlapsShed: true };
    expect(pickInsight({ ...base, day: 40, season: rains }).id).toBe("shed-monsoon");
    const due = pickInsight({ ...base, day: 28, photoWeeks: [0] });
    expect(due).toMatchObject({ id: "shed-photo-week-four", attach: "photos", photoWeek: 4 });
    const late = pickInsight({ ...base, day: 36, photoWeeks: [0] });
    expect(late.id).toBe("photo-overdue");
    expect(late.text).toMatch(/week 4/);
  });

  it("asks for photos before anything else in the first weeks", () => {
    expect(pickInsight({ ...base, day: 3, hasBaseline: false }).id).toBe("calm-no-baseline");
  });

  it("rests an ambient card for a week after it's shown, but keeps today's pick all day", () => {
    // A city with rains outside the shed window, so only the plan's own cards apply.
    const season = { months: [6, 7, 8, 9], weeks: null, overlapsShed: false };
    const ctx = { ...base, day: 40, season, now: at("2026-10-19T10:00:00"), checkins: [ci({ at: "2026-10-18T10:00:00" })] };
    const first = pickInsight(ctx);
    expect(first.id).toBe("shed-peak");
    // Shown today: still today's card.
    expect(pickInsight({ ...ctx, insightLog: [{ id: first.id, on: "2026-10-19" }] }).id).toBe("shed-peak");
    // Shown yesterday: something else gets a turn.
    expect(pickInsight({ ...ctx, insightLog: [{ id: first.id, on: "2026-10-18" }] }).id).not.toBe("shed-peak");
    // Shown eight days ago: back in rotation.
    expect(pickInsight({ ...ctx, insightLog: [{ id: first.id, on: "2026-10-11" }] }).id).toBe("shed-peak");
  });

  it("keeps the same variant all day and can change it the next", () => {
    const a = pickInsight(base).text;
    expect(pickInsight({ ...base, now: at("2026-10-14T18:00:00") }).text).toBe(a);
    const days = new Set(Array.from({ length: 8 }, (_, i) => pickInsight({ ...base, now: at(`2026-10-${14 + i}T10:00:00`) }).text));
    expect(days.size).toBeGreaterThan(1);
  });

  it("follows a pause and the restart", () => {
    const paused: Intercept[] = [{ id: "i", at: "2026-10-12T10:00:00.000Z", day: 33, choice: "pause", restartDate: "2026-10-20" }];
    const p = pickInsight({ ...base, intercepts: paused });
    expect(p.id).toBe("paused-now");
    expect(p.text).toMatch(/20 October/);
    expect(pickInsight({ ...base, day: 45, now: at("2026-10-24T10:00:00"), checkins: [ci({ at: "2026-10-23T10:00:00" })], intercepts: paused }).id).toBe("restart-after-pause");
    const kept: Intercept[] = [{ id: "k", at: "2026-10-13T10:00:00.000Z", day: 34, choice: "keep-going" }];
    expect(pickInsight({ ...base, day: 40, intercepts: kept }).id).toBe("shed-kept-going");
  });

  it("has something to say before day one", () => {
    expect(pickInsight({ ...base, day: -2 }).id).toBe("not-started");
  });

  it("logs one entry a day and keeps sixty", () => {
    let log: { id: string; on: string }[] = [];
    for (let i = 0; i < 70; i++) log = logInsight(log, `c${i}`, new Date(2026, 0, 1 + i));
    expect(log).toHaveLength(60);
    log = logInsight(log, "again", new Date(2026, 0, 70));
    expect(log.filter((l) => l.on === "2026-03-11")).toHaveLength(1);
  });
});

describe("pause state", () => {
  it("is paused before the restart date, restarted after, and cleared by keep going", () => {
    const pause: Intercept = { id: "p", at: "2026-10-12T10:00:00.000Z", day: 33, choice: "pause", restartDate: "2026-10-20" };
    expect(pauseState([pause], at("2026-10-15T10:00:00")).pausedUntil).toBe("2026-10-20");
    expect(pauseState([pause], at("2026-10-21T10:00:00"))).toMatchObject({ pausedUntil: null, restartedOn: "2026-10-20" });
    const keep: Intercept = { id: "k", at: "2026-10-14T10:00:00.000Z", day: 35, choice: "keep-going" };
    expect(pauseState([pause, keep], at("2026-10-15T10:00:00"))).toMatchObject({ pausedUntil: null, keptGoingAt: keep.at });
  });
});

describe("the letter", () => {
  it("is sealed until day 22, then ready, then remembered as read", () => {
    let s = writeLetter(emptyState(), "  Give it till April.  ", at("2026-09-10T20:00:00"));
    expect(s.letter?.text).toBe("Give it till April.");
    expect(letterStatus(s.letter, 21)).toBe("sealed");
    expect(letterStatus(s.letter, 22)).toBe("ready");
    s = revealLetter(s, "pause", at("2026-10-01T10:00:00"));
    expect(s.letter).toMatchObject({ revealedIn: "pause" });
    expect(letterStatus(s.letter, 5)).toBe("revealed");
    expect(revealLetter(s, "week-4", new Date()).letter?.revealedIn).toBe("pause");
    expect(letterStatus(null, 30)).toBe("none");
  });
});

describe("week pages", () => {
  it("have every section for all 24 weeks, without dashes", () => {
    for (let n = 1; n <= 24; n++) {
      const w = weekText(n);
      for (const k of ["turn", "line", "happens", "todo", "notWorry", "doctor"] as const) {
        expect(w[k], `week ${n} ${k}`).toBeTruthy();
        expect(w[k]).not.toMatch(/[\u2013\u2014]/);
      }
      expect(w.refs.length).toBeGreaterThan(0);
    }
    expect(WEEK_GROUPS.reduce((n, g) => n + g.to - g.from + 1, 0)).toBe(24);
  });
});
