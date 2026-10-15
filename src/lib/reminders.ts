import { PRODUCT_WORDS } from "@/content/today";
import type { CalendarEvent } from "@/lib/ics";
import { letterStatus, LETTER_OPENS_DAY } from "@/lib/letter";
import { pauseState } from "@/lib/pause";
import { REORDER_PROMPT_DAYS, reorderAllowed, runway, type Runway } from "@/lib/runway";
import { slotItems } from "@/lib/doses";
import type { AppState, ProductId } from "@/lib/storage/schema";
import { addDays, dateOfDay, differenceInCalendarDays, parseISODate, PHOTO_WEEKS, photoWeekDue, toISODate, TOTAL_DAYS, TOTAL_WEEKS } from "@/lib/time/journey";

/**
 * Reminders (BUILD_DOC F17): one schedule feeds the calendar file, the in-app banner and the
 * notifications that fire while the app is open. Scheduled push needs a server, so it is
 * deliberately not here (DECISIONS 31).
 */

export type ReminderKind = "checkin" | "photos" | "letter" | "reorder" | "restart";

export interface Reminder {
  id: string;
  kind: ReminderKind;
  at: Date;
  title: string;
  body: string;
  href: string;
}

export const REMINDER_COPY = {
  checkinTitle: "Weekly check-in",
  checkinBody: "Thirty seconds: how is your scalp this week?",
  photosTitle: (w: number) => `Week ${w} photos`,
  photosBody: "Same spot, same light, same time of day as day one.",
  letterTitle: "Your note to week five is ready",
  letterBody: "You wrote it before the hard part. Read it when you're ready.",
  reorder10: (product: string) => `About 10 days of ${product} left`,
  reorder10Body: "Reorder when it suits you.",
  reorder3: "About 3 days left",
  reorder3Body: "Worth ordering today so you don't miss days.",
  restartTitle: "Restart day",
  restartBody: "Pick it up again today. Day one stays day one.",
};

const at = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number) as [number, number];
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
};

/** How a pack's product reads in a sentence: "regrowth solution", or "kit" for a bundle. */
export function supplyWord(r: Runway): string {
  return r.sku.products.length > 1 ? "kit" : PRODUCT_WORDS[r.sku.products[0]!].split(",")[0]!.toLowerCase();
}

/** Every reminder in the plan, in date order. */
export function reminderSchedule(state: AppState, now: Date): Reminder[] {
  const p = state.profile;
  if (!p) return [];
  const { morning, evening } = state.routine;
  const photoTime = state.settings.photoHour !== undefined ? `${String(state.settings.photoHour).padStart(2, "0")}:00` : evening;
  const out: Reminder[] = [];

  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    out.push({ id: `checkin-w${w}`, kind: "checkin", at: at(dateOfDay(p.startDate, w * 7), evening), title: REMINDER_COPY.checkinTitle, body: REMINDER_COPY.checkinBody, href: "/checkin" });
  }
  for (const w of PHOTO_WEEKS) {
    out.push({ id: `photos-w${w}`, kind: "photos", at: at(dateOfDay(p.startDate, w * 7), photoTime), title: REMINDER_COPY.photosTitle(w), body: REMINDER_COPY.photosBody, href: `/baseline/?week=${w}` });
  }
  if (state.letter && !state.letter.revealedAt) {
    out.push({ id: "letter", kind: "letter", at: at(dateOfDay(p.startDate, LETTER_OPENS_DAY), evening), title: REMINDER_COPY.letterTitle, body: REMINDER_COPY.letterBody, href: "/map#letter" });
  }
  const r = runway(p.packs, now);
  if (r) {
    const pack = p.packs.reduce((a, b) => (b.reg >= a.reg ? b : a));
    out.push(
      { id: `reorder-10-${pack.reg}`, kind: "reorder", at: at(addDays(r.runsOut, -10), morning), title: REMINDER_COPY.reorder10(supplyWord(r)), body: REMINDER_COPY.reorder10Body, href: "/reorder" },
      { id: `reorder-3-${pack.reg}`, kind: "reorder", at: at(addDays(r.runsOut, -3), morning), title: REMINDER_COPY.reorder3, body: REMINDER_COPY.reorder3Body, href: "/reorder" },
    );
  }
  const pause = pauseState(state.intercepts, now);
  if (pause.pausedUntil) {
    out.push({ id: `restart-${pause.pausedUntil}`, kind: "restart", at: at(parseISODate(pause.pausedUntil), morning), title: REMINDER_COPY.restartTitle, body: REMINDER_COPY.restartBody, href: "/home" });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** What is still to come, soonest first. */
export function upcoming(state: AppState, now: Date, limit = 4): Reminder[] {
  return reminderSchedule(state, now).filter((r) => r.at.getTime() > now.getTime()).slice(0, limit);
}

/** The calendar file: everything still ahead, each a 15 minute event at its local time. */
export function calendarEvents(state: AppState, now: Date): CalendarEvent[] {
  return reminderSchedule(state, now)
    .filter((r) => r.at.getTime() > now.getTime() - 60 * 60_000)
    .map((r) => ({ uid: r.id, title: r.title, description: `${r.body} Week Five keeps everything on your phone.`, start: r.at }));
}

const productLine = (items: ProductId[]) => items.map((i) => PRODUCT_WORDS[i]).join(", ");

/** The daily times as repeating events until day 168, plus roller nights once a week each. */
export function dailyEvents(state: AppState, now: Date): CalendarEvent[] {
  const p = state.profile;
  if (!p) return [];
  const start = parseISODate(p.startDate) > now ? parseISODate(p.startDate) : now;
  const left = Math.max(1, TOTAL_DAYS - Math.max(0, differenceInCalendarDays(start, parseISODate(p.startDate))));
  const items = slotItems(p.products);
  const out: CalendarEvent[] = [];
  if (items.am.length) out.push({ uid: "daily-am", title: `Morning: ${productLine(items.am)}`, start: at(start, state.routine.morning), rrule: `FREQ=DAILY;COUNT=${left}`, minutes: 10 });
  if (items.pm.length) out.push({ uid: "daily-pm", title: `Evening: ${productLine(items.pm)}`, start: at(start, state.routine.evening), rrule: `FREQ=DAILY;COUNT=${left}`, minutes: 10 });
  if (p.products.includes("roller")) {
    const codes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    for (const night of state.routine.rollerNights) {
      const first = addDays(start, (night - start.getDay() + 7) % 7);
      out.push({ uid: `roller-${night}`, title: "Roller night, kept apart from the solution", start: at(first, state.routine.evening), rrule: `FREQ=WEEKLY;BYDAY=${codes[night]};COUNT=${Math.ceil(left / 7)}`, minutes: 10 });
    }
  }
  return out.map((e) => ({ ...e, description: "General guidance. Follow your pack leaflet or your doctor." }));
}

export type DueAction = { label: string; href: string } | { label: string; open: "checkin" | "letter" };

export interface DueItem {
  id: string;
  tone: "amber" | "accent";
  text: string;
  action: DueAction;
}

/**
 * The one thing worth a banner right now, if any. The reorder only ever appears when the
 * sequencing rule allows it: never within a day of an uneasy check-in (BUILD_DOC F12).
 */
export function dueItem(state: AppState, now: Date, day: number, photosTaken: (week: number) => boolean | null): DueItem | null {
  const p = state.profile;
  if (!p) return null;
  const today = toISODate(now);
  const pause = pauseState(state.intercepts, now);
  if (pause.restartedOn === today) return { id: `restart-${today}`, tone: "accent", text: `${REMINDER_COPY.restartTitle}. ${REMINDER_COPY.restartBody}`, action: { label: "Open Today", href: "/home" } };

  const r = runway(p.packs, now);
  const allowed = reorderAllowed(state.checkins, now, state.settings.reorder.snoozedUntil);
  const pack = p.packs.length ? p.packs.reduce((a, b) => (b.reg >= a.reg ? b : a)) : null;
  if (r && pack && allowed && r.daysLeft <= 3) {
    return r.daysLeft <= 0
      ? { id: `reorder-0-${pack.reg}`, tone: "amber", text: `Your ${supplyWord(r)} has probably run out. Bought a new pack? Scan its code.`, action: { label: "See supply", href: "/reorder" } }
      : { id: `reorder-3-${pack.reg}`, tone: "amber", text: `${REMINDER_COPY.reorder3}. ${REMINDER_COPY.reorder3Body}`, action: { label: "See supply", href: "/reorder" } };
  }

  const due = day >= 1 ? photoWeekDue(day) : null;
  if (due && photosTaken(due) === false) {
    return { id: `photos-w${due}`, tone: "amber", text: `${REMINDER_COPY.photosTitle(due)} are due. ${REMINDER_COPY.photosBody}`, action: { label: "Take photos", href: `/baseline/?week=${due}` } };
  }

  if (letterStatus(state.letter, day) === "ready") {
    return { id: "letter", tone: "accent", text: `${REMINDER_COPY.letterTitle}.`, action: { label: "Read it", open: "letter" } };
  }

  if (r && pack && allowed && r.daysLeft <= REORDER_PROMPT_DAYS) {
    return { id: `reorder-10-${pack.reg}`, tone: "amber", text: `About ${r.daysLeft} days of ${supplyWord(r)} left. ${REMINDER_COPY.reorder10Body}`, action: { label: "See supply", href: "/reorder" } };
  }

  if (day >= 8) {
    const t = now.getTime();
    const last = state.checkins.filter((c) => Date.parse(c.at) <= t).reduce((m, c) => Math.max(m, Date.parse(c.at)), 0);
    if (t - last > 7 * 86_400_000) return { id: `checkin-${today}`, tone: "accent", text: "No check-in this week. Thirty seconds.", action: { label: "Check in", open: "checkin" } };
  }
  return null;
}
