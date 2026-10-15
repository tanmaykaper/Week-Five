import type { DoseLog, ProductId } from "@/lib/storage/schema";
import { addDays, parseISODate, toISODate, type ISODate } from "@/lib/time/journey";

/**
 * The day's two slots and the streak. A slot counts as done only if it was marked done
 * at or before `now`, because demo mode carries a whole generated plan and the clock
 * decides how much of it has happened.
 */
export type Slot = "am" | "pm";
export const SLOTS: Slot[] = ["am", "pm"];

/** What each slot holds, from the products. Timing only, never amounts (routine rules come in Phase 8). */
export function slotItems(products: ProductId[]): Record<Slot, ProductId[]> {
  const topical = products.filter((p) => p === "solution" || p === "foam");
  return {
    am: [...topical, ...(products.includes("serum") ? (["serum"] as ProductId[]) : [])],
    pm: [...topical, ...(products.includes("gummies") ? (["gummies"] as ProductId[]) : [])],
  };
}

/** Slots that have something in them. A gummies-only routine has an evening and no morning. */
export function activeSlots(products: ProductId[]): Slot[] {
  const items = slotItems(products);
  return SLOTS.filter((s) => items[s].length > 0);
}

export function isDone(doses: DoseLog[], date: ISODate, slot: Slot, now: Date): boolean {
  let done = false;
  for (const d of doses) {
    if (d.date !== date || d.slot !== slot) continue;
    if (Date.parse(d.at) > now.getTime()) continue;
    done = d.done;
  }
  return done;
}

/** Marks a slot done or not done, replacing whatever was logged for that date and slot. */
export function setDose(doses: DoseLog[], date: ISODate, slot: Slot, done: boolean, at: Date): DoseLog[] {
  return [...doses.filter((d) => !(d.date === date && d.slot === slot)), { date, slot, done, at: at.toISOString() }];
}

/**
 * Days in a row with every active slot done. Today counts once it is complete; until then
 * the streak runs to yesterday, so an evening not done yet never reads as a broken streak.
 */
export function streak(doses: DoseLog[], slots: Slot[], today: ISODate, now: Date, startDate?: ISODate): number {
  if (slots.length === 0) return 0;
  const complete = (date: ISODate) => slots.every((s) => isDone(doses, date, s, now));
  let day = parseISODate(today);
  if (!complete(today)) day = addDays(day, -1);
  const first = startDate ? parseISODate(startDate).getTime() : -Infinity;
  let n = 0;
  while (day.getTime() >= first && complete(toISODate(day))) {
    n++;
    day = addDays(day, -1);
    if (n > 400) break;
  }
  return n;
}
