
/** A calendar date in local time, "2026-10-14". */
export type ISODate = string;

export const TOTAL_DAYS = 168;
export const TOTAL_WEEKS = 24;
export const SHED_WINDOW = { startDay: 15, endDay: 56 } as const;
export const PHOTO_WEEKS = [4, 8, 12, 16, 20, 24] as const;

export type Phase = "not-started" | "calm" | "shed" | "settling" | "first-hairs" | "building" | "judgement" | "beyond";

/** Phase boundaries by journey day. See docs/DATA_MODEL.md. */
const PHASE_RANGES: { phase: Phase; from: number; to: number }[] = [
  { phase: "calm", from: 1, to: 14 },
  { phase: "shed", from: 15, to: 56 },
  { phase: "settling", from: 57, to: 84 },
  { phase: "first-hairs", from: 85, to: 126 },
  { phase: "building", from: 127, to: 167 },
  { phase: "judgement", from: 168, to: 175 },
];

/** Phase labels for the 24-week strip, by week. */
export const PHASE_SPANS = [
  { label: "Quiet start", fromWeek: 1, toWeek: 2 },
  { label: "Shed window", fromWeek: 3, toWeek: 8 },
  { label: "Settling", fromWeek: 9, toWeek: 12 },
  { label: "First fine hairs", fromWeek: 13, toWeek: 18 },
  { label: "Long middle", fromWeek: 19, toWeek: 23 },
  { label: "Judge", fromWeek: 24, toWeek: 24 },
] as const;

// Small local calendar helpers. date-fns parse and format pulled about 15 KB of locale
// tables into every page for three functions; these do the same in local time.
const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(value: ISODate): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(Number.NaN);
  if (Number.isNaN(d.getTime()) || toISODate(d) !== value) throw new Error(`Invalid date: ${value}`);
  return d;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}

/** Whole calendar days from b to a, immune to daylight saving shifts. */
export function differenceInCalendarDays(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ua - ub) / 86_400_000);
}

export function isISODate(value: string): boolean {
  try {
    parseISODate(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Day 1 is the start date. Calendar days in local time, so the time of day and
 * daylight saving never shift it. Zero or negative means the plan starts later.
 */
export function journeyDay(startDate: ISODate, now: Date): number {
  return differenceInCalendarDays(now, parseISODate(startDate)) + 1;
}

/** Week 1 is days 1 to 7. Day 34 is week 5. Returns 0 before the start. */
export function weekOf(day: number): number {
  return day <= 0 ? 0 : Math.ceil(day / 7);
}

/** The week to show on the map, capped at 24. */
export function displayWeek(day: number): number {
  return Math.min(weekOf(day), TOTAL_WEEKS);
}

export function phaseOf(day: number): Phase {
  if (day <= 0) return "not-started";
  const hit = PHASE_RANGES.find((r) => day >= r.from && day <= r.to);
  return hit ? hit.phase : "beyond";
}

/** Share of the 168-day judgement window completed, 0 to 1. */
export function progress(day: number): number {
  return Math.min(Math.max(day, 0), TOTAL_DAYS) / TOTAL_DAYS;
}

export function inShedWindow(day: number): boolean {
  return day >= SHED_WINDOW.startDay && day <= SHED_WINDOW.endDay;
}

/** The calendar date of a given journey day. */
export function dateOfDay(startDate: ISODate, day: number): Date {
  return addDays(parseISODate(startDate), day - 1);
}

/** The short phrase that follows "Day 34, week 5," on Today. */
export function phasePhrase(day: number): string {
  const week = weekOf(day);
  switch (phaseOf(day)) {
    case "not-started":
      return "not started yet";
    case "calm":
      return "the quiet start";
    case "shed":
      if (week <= 4) return "the shed window";
      if (week === 5) return "the part everyone finds hardest";
      return "the shed window, past the middle";
    case "settling":
      return "things settling down";
    case "first-hairs":
      return "when fine hairs often show up";
    case "building":
      return "the long middle";
    case "judgement":
      return "judgement week";
    case "beyond":
      return "past six months";
  }
}

/** Photo windows open 2 days before the photo week ends and stay open 5 days after. */
export function photoWindow(week: (typeof PHOTO_WEEKS)[number]): { from: number; to: number } {
  const target = week * 7;
  return { from: target - 2, to: target + 5 };
}

/** The photo week whose window contains this day, if any. */
export function photoWeekDue(day: number): (typeof PHOTO_WEEKS)[number] | null {
  return PHOTO_WEEKS.find((w) => {
    const { from, to } = photoWindow(w);
    return day >= from && day <= to;
  }) ?? null;
}

/** The next photo week at or after this day. */
export function nextPhotoWeek(day: number): (typeof PHOTO_WEEKS)[number] | null {
  return PHOTO_WEEKS.find((w) => w * 7 >= day) ?? null;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export function timeOfDay(now: Date): TimeOfDay {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

export function greetingWord(now: Date): string {
  return { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Still up" }[timeOfDay(now)];
}
