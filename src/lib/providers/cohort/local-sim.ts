import { CITIES } from "@/content/cities";
import { hashString, mulberry32 } from "@/lib/rng";
import { PHOTO_WEEKS, TOTAL_WEEKS, weekOf, type ISODate } from "@/lib/time/journey";
import type { CohortProvider, Mate, MateEvent } from "./types";

/**
 * LocalSimCohort: 40 fictional people who started within two weeks of the user, seeded from
 * the start date so they are the same on every visit, with events that follow each person's
 * own day. Nobody here is real, and the screen says so.
 */

const FIRST_NAMES = [
  "Aarav", "Dev", "Kabir", "Rohan", "Vikram", "Ishaan", "Arnav", "Siddharth", "Karan", "Nikhil",
  "Aditya", "Pranav", "Yash", "Harsh", "Manav", "Varun", "Neel", "Tushar", "Omkar", "Farhan",
  "Imran", "Joel", "Gurpreet", "Anand", "Sameer", "Tanvir", "Zubin", "Akash", "Ritesh", "Vivek",
];

export function simulatedCohort(startDate: ISODate, size = 40): Mate[] {
  const rnd = mulberry32(hashString(startDate));
  const cities = CITIES.slice(0, 20);
  return Array.from({ length: size }, (_, i) => ({
    id: `mate-${i}`,
    firstName: FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)]!,
    city: cities[Math.floor(rnd() * cities.length)]!.name,
    offset: Math.round(rnd() * 28) - 14,
  }));
}

/** People who started within three days of the user: "your start week". */
export const startWeekOf = (people: Mate[]) => people.filter((m) => Math.abs(m.offset) <= 3);

/** What happened in the cohort over the two weeks up to `userDay`, newest first. Pure and deterministic. */
export function simulatedEvents(startDate: ISODate, people: Mate[], userDay: number, limit: number): MateEvent[] {
  const out: MateEvent[] = [];
  const startWeek = startWeekOf(people);
  for (let d = userDay; d >= Math.max(1, userDay - 13); d--) {
    const rnd = mulberry32(hashString(`${startDate}:${d}`));
    const dayEvents: MateEvent[] = [];
    for (const m of people) {
      const theirDay = d - m.offset;
      const roll = rnd();
      if (theirDay === 1) {
        dayEvents.push({ id: `started-${m.id}-${d}`, mateId: m.id, kind: "started", at: d });
        continue;
      }
      if (theirDay < 1) continue;
      const week = theirDay / 7;
      if (theirDay % 7 === 0 && week <= TOTAL_WEEKS) {
        const photo = (PHOTO_WEEKS as readonly number[]).includes(week);
        dayEvents.push({ id: `${photo ? "photo" : "week"}-${m.id}-${d}`, mateId: m.id, kind: photo ? "took-photo" : "finished-week", week, at: d });
      } else if (theirDay <= 8 && roll < 0.035) {
        dayEvents.push({ id: `letter-${m.id}-${d}`, mateId: m.id, kind: "wrote-letter", at: d });
      } else if (roll < 0.08) {
        dayEvents.push({ id: `checkin-${m.id}-${d}`, mateId: m.id, kind: "checked-in", at: d });
      }
    }
    // Once every few days, the start week as a whole.
    if (d === userDay || d % 4 === 0) {
      const w = Math.max(1, weekOf(d));
      const count = startWeek.filter((m) => weekOf(d - m.offset) === w).length;
      if (count > 1) dayEvents.push({ id: `count-${d}`, mateId: null, kind: "cohort-count", week: Math.min(TOTAL_WEEKS, w), count, at: d });
    }
    // A seeded order within the day, so the feed doesn't read as alphabetical.
    dayEvents.sort((a, b) => hashString(`${a.id}`) - hashString(`${b.id}`));
    out.push(...dayEvents);
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

export class LocalSimCohort implements CohortProvider {
  readonly id = "local-sim" as const;
  readonly isSimulated = true;
  private people: Mate[];

  constructor(private startDate: ISODate) {
    this.people = simulatedCohort(startDate);
  }

  async available() {
    return true;
  }

  async cohort() {
    return this.people;
  }

  async events(userDay: number, limit: number) {
    return simulatedEvents(this.startDate, this.people, userDay, limit);
  }

  async nudge() {
    // Nothing leaves the device: the screen plays the animation and logs it locally.
  }
}
