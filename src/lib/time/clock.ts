import { dateOfDay, type ISODate } from "./journey";

/**
 * The app never calls `new Date()` for anything journey-related. It asks the clock.
 * In demo mode the clock pretends today is a chosen journey day, keeping the real
 * time of day so greetings and night-time cards still behave.
 */
export function effectiveNow(real: Date, demo: { startDate: ISODate; day: number } | null): Date {
  if (!demo) return real;
  const d = dateOfDay(demo.startDate, demo.day);
  d.setHours(real.getHours(), real.getMinutes(), real.getSeconds(), real.getMilliseconds());
  return d;
}
