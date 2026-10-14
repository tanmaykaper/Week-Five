import { cityById, DEFAULT_MONSOON } from "@/content/cities";
import { dateOfDay, SHED_WINDOW, TOTAL_DAYS, weekOf, type ISODate } from "@/lib/time/journey";

export type SeasonOverride = "monsoon" | "no-monsoon" | null;

export interface Season {
  /** The rainy months used, or an empty list when there are none. */
  months: number[];
  /** Weeks of the 24 that fall in those months, as one span, or null. */
  weeks: [number, number] | null;
  /** True when any day of the shed window (days 15 to 56) falls in those months. */
  overlapsShed: boolean;
}

/**
 * Which rainy months apply. A known city wins; "no-monsoon" switches the rain off;
 * otherwise (skipped, or "somewhere else" with rains) most of India's months apply.
 */
export function monsoonMonths(cityId: string | null, override: SeasonOverride): number[] {
  if (override === "no-monsoon") return [];
  const city = cityById(cityId);
  if (city) return city.monsoon;
  return DEFAULT_MONSOON;
}

/** Where the rains sit on a plan starting on `startDate`. */
export function seasonFor(startDate: ISODate, cityId: string | null, override: SeasonOverride): Season {
  const months = monsoonMonths(cityId, override);
  if (months.length === 0) return { months, weeks: null, overlapsShed: false };
  let first = 0;
  let last = 0;
  let overlapsShed = false;
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const month = dateOfDay(startDate, day).getMonth() + 1;
    if (!months.includes(month)) continue;
    if (!first) first = day;
    last = day;
    if (day >= SHED_WINDOW.startDay && day <= SHED_WINDOW.endDay) overlapsShed = true;
  }
  return { months, weeks: first ? [weekOf(first), weekOf(last)] : null, overlapsShed };
}
