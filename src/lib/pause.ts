import type { Intercept } from "@/lib/storage/schema";
import { differenceInCalendarDays, parseISODate, toISODate, type ISODate } from "@/lib/time/journey";

/**
 * Where the "Wait, before you stop" choices leave things. A pause never resets the day
 * count (DECISIONS 19); it only changes what the app says until, and just after, the
 * restart date.
 */
export interface PauseState {
  /** Paused now, until this date (the restart day). */
  pausedUntil: ISODate | null;
  /** The last restart date that has passed, if any. */
  restartedOn: ISODate | null;
  /** When "keep going" was last chosen. */
  keptGoingAt: string | null;
}

export function pauseState(intercepts: Intercept[], now: Date): PauseState {
  const t = now.getTime();
  const past = intercepts.filter((i) => Date.parse(i.at) <= t).sort((a, b) => a.at.localeCompare(b.at));
  let pausedUntil: ISODate | null = null;
  let restartedOn: ISODate | null = null;
  let keptGoingAt: string | null = null;
  const today = toISODate(now);
  for (const i of past) {
    if (i.choice === "keep-going") {
      keptGoingAt = i.at;
      pausedUntil = null;
    }
    if (i.choice === "pause" && i.restartDate) {
      if (i.restartDate > today) pausedUntil = i.restartDate;
      else {
        pausedUntil = null;
        restartedOn = i.restartDate;
      }
    }
  }
  return { pausedUntil, restartedOn, keptGoingAt };
}

/** Whole days since an ISO date (negative before it). */
export const daysSince = (iso: ISODate, now: Date) => differenceInCalendarDays(now, parseISODate(iso));
