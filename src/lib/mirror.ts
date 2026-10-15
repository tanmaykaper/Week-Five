import type { PhotoRecord, View } from "@/lib/storage/photos";
import { dateOfDay, journeyDay, PHOTO_WEEKS, photoWindow, type ISODate } from "@/lib/time/journey";

/**
 * The mirror's rules (BUILD_DOC F14), kept pure so they are tested: which photo weeks are
 * done, due, late or still to come, what day one can be compared with, and when two photos
 * were taken in light too different to compare fairly.
 */

/** Two photos whose mean luminance differs by more than this get a lighting warning. */
export const LIGHT_GAP = 25;
/** A photo week stays open this many days after its window closes (as the "photos late" note does). */
export const LATE_DAYS = 10;
/** Monthly photos sooner than this after day one would show nothing (DECISIONS 93). */
export const MIN_GAP_DAYS = 14;

export type PhotoDayStatus =
  /** Photos kept for this week (perhaps not all three views). */
  | "taken"
  /** The week's window is open. */
  | "due"
  /** The window has closed, but a few days late is still worth it. */
  | "late"
  /** Not yet. */
  | "upcoming"
  /** The window passed without photos. No harm done. */
  | "missed"
  /** Too soon after a day one taken late in the plan; the next photos are the first that count. */
  | "early";

export interface PhotoDay {
  /** 0 is day one. */
  week: number;
  status: PhotoDayStatus;
  /** The photo kept for each view this week, among those taken by now. */
  views: Partial<Record<View, PhotoRecord>>;
  /** When the week's photos were taken (the first of them), or the day they're aimed at. */
  date: Date;
  /** Photos can be taken or retaken for this week today. */
  open: boolean;
}

const byTime = (a: PhotoRecord, b: PhotoRecord) => a.takenAt.localeCompare(b.takenAt);

/** Photos taken by `now` (demo plans carry all 24 weeks up front). */
export function seenBy(photos: PhotoRecord[], now: Date): PhotoRecord[] {
  const t = now.getTime();
  return photos.filter((p) => Date.parse(p.takenAt) <= t);
}

/** The newest photo per view for one week. */
function viewsOf(photos: PhotoRecord[], week: number): Partial<Record<View, PhotoRecord>> {
  const out: Partial<Record<View, PhotoRecord>> = {};
  for (const p of photos.filter((x) => x.week === week).sort(byTime)) out[p.view] = p;
  return out;
}

/** The first photo week that counts after a day one taken on `baselineDay`. */
export function firstPhotoWeek(baselineDay: number): number {
  return PHOTO_WEEKS.find((w) => w * 7 - Math.max(1, baselineDay) >= MIN_GAP_DAYS) ?? 24;
}

/** The journey day the day-one photos were taken on, or null without any. */
export function baselineDay(photos: PhotoRecord[], startDate: ISODate): number | null {
  const first = photos.filter((p) => p.week === 0).sort(byTime)[0];
  return first ? journeyDay(startDate, new Date(first.takenAt)) : null;
}

/** Day one and the six photo weeks, each with its photos and where it stands today. */
export function photoDays(photos: PhotoRecord[], startDate: ISODate, day: number, now: Date): PhotoDay[] {
  const seen = seenBy(photos, now);
  const base = viewsOf(seen, 0);
  const baseFirst = Object.values(base).sort(byTime)[0];
  const first = firstPhotoWeek(baselineDay(seen, startDate) ?? 1);
  const days: PhotoDay[] = [
    {
      week: 0,
      status: baseFirst ? "taken" : "due",
      views: base,
      date: baseFirst ? new Date(baseFirst.takenAt) : dateOfDay(startDate, 1),
      open: !baseFirst,
    },
  ];
  for (const week of PHOTO_WEEKS) {
    const views = viewsOf(seen, week);
    const kept = Object.values(views).sort(byTime)[0];
    const { from, to } = photoWindow(week);
    const open = day >= from && day <= to + LATE_DAYS;
    let status: PhotoDayStatus;
    if (kept) status = "taken";
    else if (baseFirst && week < first) status = "early";
    else if (day < from) status = "upcoming";
    else if (day <= to) status = "due";
    else if (day <= to + LATE_DAYS) status = "late";
    else status = "missed";
    days.push({
      week,
      status,
      views,
      date: kept ? new Date(kept.takenAt) : dateOfDay(startDate, week * 7),
      open: open && status !== "early",
    });
  }
  return days;
}

/**
 * The photo week to ask for now: one whose window is open (or a few days late) and that is
 * still missing photos. Null when there's nothing to take, or no day one to compare with.
 */
export function weekToTake(days: PhotoDay[]): PhotoDay | null {
  if (days[0]?.status !== "taken") return null;
  return (
    days.find((d) => d.week > 0 && d.open && (d.status === "due" || d.status === "late" || (d.status === "taken" && Object.keys(d.views).length < 3))) ??
    null
  );
}

/** What day one can be compared with for one view: one photo per later week, oldest first. */
export function compareChoices(photos: PhotoRecord[], view: View, now: Date): PhotoRecord[] {
  const out = new Map<number, PhotoRecord>();
  for (const p of seenBy(photos, now)
    .filter((x) => x.view === view && x.week > 0)
    .sort(byTime))
    out.set(p.week, p);
  return [...out.values()].sort((a, b) => a.week - b.week);
}

/** The day-one photo for a view, if kept. */
export function dayOneOf(photos: PhotoRecord[], view: View, now: Date): PhotoRecord | null {
  return viewsOf(seenBy(photos, now), 0)[view] ?? null;
}

/** True when two photos' light differs enough that a comparison could mislead. */
export function lightDiffers(a: Pick<PhotoRecord, "luminance">, b: Pick<PhotoRecord, "luminance">): boolean {
  return Math.abs(a.luminance - b.luminance) > LIGHT_GAP;
}

/** Where the compare divider sits after a key press, 0 to 100. */
export function nudgeDivider(value: number, key: string): number | null {
  const step: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 };
  if (key === "Home") return 0;
  if (key === "End") return 100;
  const d = step[key];
  return d === undefined ? null : Math.min(100, Math.max(0, value + d));
}
