import { VIEWS } from "@/content/baseline";
import type { View } from "@/lib/storage/photos";
import type { Worry } from "@/lib/storage/schema";
import { dateOfDay, PHOTO_WEEKS, type ISODate } from "@/lib/time/journey";

/** Baseline photos are week 0, whatever day of the plan they are taken on. */
export const BASELINE_WEEK = 0;

/** The first of the three views still missing, or null when all three are kept. */
export function nextView(taken: Partial<Record<View, unknown>>): View | null {
  return VIEWS.find((v) => !taken[v]) ?? null;
}

/** After keeping `view`: the next missing view, or null when the set is complete. */
export function viewAfter(view: View, taken: Partial<Record<View, unknown>>): View | null {
  const start = VIEWS.indexOf(view);
  for (let i = 1; i <= VIEWS.length; i++) {
    const v = VIEWS[(start + i) % VIEWS.length]!;
    if (!taken[v]) return v;
  }
  return null;
}

/** Which photo the painter opens on, from what setup said bothers them most. */
export function painterView(worries: Worry[]): View {
  if (worries.includes("hairline")) return "hairline";
  if (worries.includes("crown")) return "crown";
  if (worries.includes("visible-scalp")) return "parting";
  return "crown";
}

/**
 * The next monthly photos after a baseline taken on `day`: the first photo week at least
 * two weeks away (a baseline on day 25 shouldn't be followed by photos on day 28), on its
 * last day, at the hour the baseline was taken so the light matches.
 */
export function nextPhotos(startDate: ISODate, day: number, hour: number): { week: number; at: Date } {
  const week = PHOTO_WEEKS.find((w) => w * 7 - Math.max(1, day) >= 14) ?? 24;
  const at = dateOfDay(startDate, week * 7);
  at.setHours(hour, 0, 0, 0);
  return { week, at };
}

/** "about 8 am", "about 6 pm": a time of day, not an appointment. */
export function aboutHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return "midnight";
  if (h === 12) return "midday";
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "am" : "pm"}`;
}
