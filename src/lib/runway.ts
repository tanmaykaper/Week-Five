import { skuByCode, type Sku } from "@/content/skus";
import type { CheckIn, PackScan } from "@/lib/storage/schema";
import { addDays, differenceInCalendarDays, parseISODate, type ISODate } from "@/lib/time/journey";

/** Below this many days, the supply block offers the reorder link (and Phase 8 adds banners). */
export const REORDER_PROMPT_DAYS = 10;

export interface Runway {
  sku: Sku;
  /** Days of supply left today; zero or less means it has probably run out. */
  daysLeft: number;
  runsOut: Date;
  /** Share of the pack used, 0 to 1. */
  used: number;
}

/** Supply left on the newest pack: its days of supply minus the days since it was bought. */
export function runway(packs: PackScan[], now: Date): Runway | null {
  const known = packs.filter((p) => skuByCode(p.sku));
  if (known.length === 0) return null;
  const newest = known.reduce((a, b) => (b.reg >= a.reg ? b : a));
  const sku = skuByCode(newest.sku)!;
  const bought = parseISODate(newest.reg);
  const since = differenceInCalendarDays(now, bought);
  const daysLeft = sku.daysOfSupply - since;
  return { sku, daysLeft, runsOut: addDays(bought, sku.daysOfSupply), used: Math.min(1, Math.max(0, since / sku.daysOfSupply)) };
}

const HOUR = 3_600_000;

/** A check-in that carries doubt: hair fall or worry at 3 or more, or anything on the red-flag list. */
export const isUneasy = (c: CheckIn) => c.shed >= 3 || c.worry >= 3 || c.redFlags.length > 0;

/**
 * Reassurance first, the reorder later. No reorder prompt within 24 hours of an uneasy
 * check-in (kickoff 3.8, DECISIONS 20), and none while the person has snoozed it.
 */
export function reorderAllowed(checkins: CheckIn[], now: Date, snoozedUntil?: ISODate): boolean {
  if (snoozedUntil && differenceInCalendarDays(parseISODate(snoozedUntil), now) > 0) return false;
  const t = now.getTime();
  return !checkins.some((c) => {
    const at = Date.parse(c.at);
    return at <= t && t - at < 24 * HOUR && isUneasy(c);
  });
}
