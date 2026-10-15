import { CITIES } from "@/content/cities";
import { hashString, mulberry32 } from "@/lib/rng";
import { photoWeekDue, weekOf, type ISODate } from "@/lib/time/journey";

/**
 * A simulated cohort for the demo community: 40 fictional people who started within two
 * weeks of the user, seeded from the start date so they are the same on every visit.
 * Nobody here is real. Phase 9 wraps this in the CohortProvider with the full feed.
 */

const FIRST_NAMES = [
  "Aarav", "Dev", "Kabir", "Rohan", "Vikram", "Ishaan", "Arnav", "Siddharth", "Karan", "Nikhil",
  "Aditya", "Pranav", "Yash", "Harsh", "Manav", "Varun", "Neel", "Tushar", "Omkar", "Farhan",
  "Imran", "Joel", "Gurpreet", "Anand", "Sameer", "Tanvir", "Zubin", "Akash", "Ritesh", "Vivek",
];

export interface Mate {
  id: string;
  firstName: string;
  city: string;
  /** Days between the user's start and theirs: positive means they started later. */
  offset: number;
}

export function cohort(startDate: ISODate, size = 40): Mate[] {
  const rnd = mulberry32(hashString(startDate));
  const cities = CITIES.slice(0, 20);
  return Array.from({ length: size }, (_, i) => ({
    id: `mate-${i}`,
    firstName: FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)]!,
    city: cities[Math.floor(rnd() * cities.length)]!.name,
    offset: Math.round(rnd() * 28) - 14,
  }));
}

export interface CohortGlance {
  /** People who started within three days of the user. */
  startWeek: Mate[];
  /** The week they're mostly on today. */
  week: number;
  /** One small, warm thing that happened. */
  event: string;
}

export function cohortGlance(startDate: ISODate, day: number): CohortGlance {
  const people = cohort(startDate);
  const startWeek = people.filter((m) => Math.abs(m.offset) <= 3);
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
