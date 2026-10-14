"use client";

import { Gate, Upcoming } from "@/components/shell/Gate";
import { PageHead } from "@/components/ui/primitives";
import { useJourney } from "@/lib/hooks/useJourney";
import { useApp } from "@/lib/storage/store";
import { greetingWord, phasePhrase, TOTAL_DAYS } from "@/lib/time/journey";

function dayLine(day: number, week: number): string {
  if (day <= 0) return `Your plan starts in ${1 - day} ${1 - day === 1 ? "day" : "days"}.`;
  if (day > TOTAL_DAYS) return `Day ${day}. ${phasePhrase(day)[0]!.toUpperCase()}${phasePhrase(day).slice(1)}.`;
  return `Day ${day} of 168. Week ${week}, ${phasePhrase(day)}.`;
}

export function TodayPreview() {
  return (
    <Gate>
      <TodayHead />
    </Gate>
  );
}

function TodayHead() {
  const { now, day, week } = useJourney();
  const name = useApp((s) => s.data.profile?.nickname || "you");
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="pt-[clamp(40px,6vw,88px)]" aria-label="Today">
      <PageHead kicker={date} title={`${greetingWord(now)}, ${name}.`} lead={day !== null && week !== null ? dayLine(day, week) : null} />
      <Upcoming phase={5}>The ring, the 24-week strip, your routine, day one and now, supply and the reassurance card arrive here.</Upcoming>
    </section>
  );
}
