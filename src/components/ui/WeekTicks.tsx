import { PHOTO_WEEKS, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";

/**
 * The 24 weeks as a line of ticks: weeks behind you in ink, this week in the accent, the
 * shed window a touch taller, photo weeks with an amber dot. The flat twin of the rings.
 */
export function WeekTicks({ day, className = "", label }: { day: number; className?: string; label?: string }) {
  const now = day >= 1 ? Math.min(TOTAL_WEEKS, weekOf(day)) : 0;
  return (
    <div className={`week-ticks ${className}`} role="img" aria-label={label ?? (now ? `Week ${now} of 24` : "Not started yet")}>
      {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const w = i + 1;
        return (
          <i
            key={w}
            data-done={w < now || undefined}
            data-now={w === now || undefined}
            data-shed={(w >= 3 && w <= 8) || undefined}
            data-photo={(PHOTO_WEEKS as readonly number[]).includes(w) || undefined}
          />
        );
      })}
    </div>
  );
}
