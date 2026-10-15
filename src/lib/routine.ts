import { ROUTINE_RULES, type RoutineRule } from "@/content/routines";
import { slotItems, type Slot } from "@/lib/doses";
import type { AgeBand, ProductId, Routine } from "@/lib/storage/schema";

/**
 * Routine suggestions from the rule table (BUILD_DOC F13). Pure and unit tested. Times and
 * handling only: nothing here ever reads or writes an amount.
 */

export interface Advice {
  id: string;
  title: string;
  body: string;
}

const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number) as [number, number];
  return h * 60 + m;
};

/** Hours from the morning time to the evening time, rounded to the half hour. */
export function hoursApart(morning: string, evening: string): number {
  let diff = minutes(evening) - minutes(morning);
  if (diff < 0) diff += 24 * 60;
  return Math.round((diff / 60) * 2) / 2;
}

function applies(rule: RoutineRule, products: ProductId[], ageBand: AgeBand | null, rainsNow: boolean, gap: number): boolean {
  if (rule.products && !rule.products.some((p) => products.includes(p))) return false;
  if (rule.ages && (!ageBand || !rule.ages.includes(ageBand))) return false;
  if (rule.rains && !rainsNow) return false;
  if (rule.gapOff !== undefined && Math.abs(gap - 12) < rule.gapOff) return false;
  return true;
}

export function routineAdvice(input: { products: ProductId[]; ageBand: AgeBand | null; routine: Pick<Routine, "morning" | "evening">; rainsNow: boolean }): Advice[] {
  const gap = hoursApart(input.routine.morning, input.routine.evening);
  const fill = (s: string) => s.replace("{morning}", input.routine.morning).replace("{evening}", input.routine.evening).replace("{gap}", String(gap));
  return ROUTINE_RULES.filter((r) => applies(r, input.products, input.ageBand, input.rainsNow, gap))
    // The even-gap tip replaces the "about twelve hours" one when the times are far off.
    .filter((r, _, all) => !(r.id === "spacing" && all.some((x) => x.id === "gap-off")))
    .map((r) => ({ id: r.id, title: fill(r.title), body: fill(r.body) }));
}

/** Monday first, as the week strip shows it. JavaScript's getDay() puts Sunday at 0. */
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

export interface PlanDay {
  /** getDay() value: 0 is Sunday. */
  weekday: number;
  slots: { slot: Slot; time: string; items: ProductId[] }[];
  roller: boolean;
}

/** The routine across a week: the two slots every day, roller nights marked on their own. */
export function weekPlan(products: ProductId[], routine: Routine): PlanDay[] {
  const items = slotItems(products);
  const usesRoller = products.includes("roller");
  return MONDAY_FIRST.map((weekday) => ({
    weekday,
    slots: (["am", "pm"] as Slot[])
      .filter((s) => items[s].length > 0)
      .map((slot) => ({ slot, time: slot === "am" ? routine.morning : routine.evening, items: items[slot] })),
    roller: usesRoller && routine.rollerNights.includes(weekday),
  }));
}

/** Adds or removes a roller night, keeping the list sorted and unique. */
export function toggleRollerNight(nights: number[], weekday: number): number[] {
  const next = nights.includes(weekday) ? nights.filter((n) => n !== weekday) : [...nights, weekday];
  return [...new Set(next)].sort((a, b) => a - b);
}
