import { simulatedCohort, startWeekOf, type Mate } from "@/lib/providers/cohort";
import { hashString, mulberry32 } from "@/lib/rng";
import { photoWeekDue, weekOf, type ISODate } from "@/lib/time/journey";

/**
 * Today's glance at the demo community. The people come from the cohort provider
 * (src/lib/providers/cohort), so Today and the Mates page always show the same names.
 */
export type { Mate } from "@/lib/providers/cohort";
export { simulatedCohort as cohort } from "@/lib/providers/cohort";

export interface CohortGlance {
  /** People who started within three days of the user. */
  startWeek: Mate[];
  /** The week they're mostly on today. */
  week: number;
  /** One small, warm thing that happened. */
  event: string;
}

export function cohortGlance(startDate: ISODate, day: number): CohortGlance {
  const people = simulatedCohort(startDate);
  const startWeek = startWeekOf(people);
  const week = Math.max(1, weekOf(day));
  const rnd = mulberry32(hashString(`${startDate}:${day}`));
  const pick = startWeek[Math.floor(rnd() * startWeek.length)] ?? people[0]!;
  const theirDay = day - pick.offset;
  const photoWeek = photoWeekDue(theirDay);
  const event =
    theirDay < 1
      ? `${pick.firstName} from ${pick.city} starts in a few days.`
      : photoWeek
        ? `${pick.firstName} from ${pick.city} took their week ${photoWeek} photos.`
        : theirDay % 7 === 0 && theirDay >= 7
          ? `${pick.firstName} from ${pick.city} finished week ${theirDay / 7}.`
          : `${pick.firstName} from ${pick.city} checked in today.`;
  return { startWeek, week, event };
}
