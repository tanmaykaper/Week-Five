"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/storage/store";
import { effectiveNow } from "@/lib/time/clock";
import { displayWeek, journeyDay, phaseOf, type Phase } from "@/lib/time/journey";

/** The real time, ticking once a minute so greetings and day counts roll over. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export interface JourneyNow {
  now: Date;
  startDate: string | null;
  day: number | null;
  week: number | null;
  phase: Phase | null;
}

/** Where the user is in their 24 weeks, honouring the demo clock. */
export function useJourney(): JourneyNow {
  const real = useNow();
  const mode = useApp((s) => s.mode);
  const startDate = useApp((s) => s.data.profile?.startDate ?? null);
  const demoDay = useApp((s) => s.data.demo?.day ?? null);

  return useMemo(() => {
    const demo = mode === "demo" && startDate && demoDay ? { startDate, day: demoDay } : null;
    const now = effectiveNow(real, demo);
    if (!startDate) return { now, startDate, day: null, week: null, phase: null };
    const day = journeyDay(startDate, now);
    return { now, startDate, day, week: displayWeek(day), phase: phaseOf(day) };
  }, [real, mode, startDate, demoDay]);
}
