import { addDays, dateOfDay, toISODate, TOTAL_DAYS } from "@/lib/time/journey";
import { emptyState, SCHEMA_VERSION, type AppState, type CheckIn, type DoseLog } from "@/lib/storage/schema";

/**
 * Fictional sample people for demo mode. Nobody here is real, and none of it comes
 * from the interviews. The whole 24 weeks are generated up front; screens only show
 * what has happened up to the demo day.
 */
export type Persona = "steady" | "worried" | "monsoon-quick-commerce";

export const PERSONAS: Record<Persona, { label: string; summary: string }> = {
  steady: { label: "Steady", summary: "Bought through the hair assessment, sheds, keeps going." },
  worried: { label: "Worried", summary: "Sheds hard in week five and opens the stop flow." },
  "monsoon-quick-commerce": { label: "Monsoon, quick commerce", summary: "Ten-minute delivery, no briefing, rainy-season start." },
};

const DEFAULT_DAY = 35;

// Shed and worry by week for each persona: weeks 1 to 24.
const CURVES: Record<Persona, { shed: number[]; worry: number[] }> = {
  steady: {
    shed: [1, 1, 2, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    worry: [1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  worried: {
    shed: [1, 2, 3, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    worry: [1, 2, 3, 3, 4, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "monsoon-quick-commerce": {
    shed: [2, 2, 3, 4, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    worry: [1, 2, 2, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

const LETTERS: Record<Persona, string> = {
  steady: "You started this because you were tired of wearing a cap to every photo. You said six months. Week five is not six months.",
  worried: "If you're reading this, you probably want to stop. Don't decide tonight. Look at the photo first.",
  "monsoon-quick-commerce": "It's raining and your hair is everywhere. That was always going to happen. Give it till the winter.",
};

function at(startDate: string, day: number, hours: number, minutes = 0): string {
  const d = dateOfDay(startDate, day);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function buildDemoState(persona: Persona, realToday: Date): AppState {
  // Start far enough back that the default demo day lands on today's real date.
  const startDate = toISODate(addDays(realToday, -(DEFAULT_DAY - 1)));
  const curve = CURVES[persona];
  const quick = persona === "monsoon-quick-commerce";

  const checkins: CheckIn[] = [];
  for (let week = 1; week <= 24; week++) {
    const day = week * 7;
    checkins.push({
      id: `demo-ci-${week}`,
      at: at(startDate, day, 21, 40),
      day,
      shed: curve.shed[week - 1] ?? 1,
      worry: curve.worry[week - 1] ?? 0,
      missedDoses: persona === "worried" && week === 6 ? 4 : week % 5 === 0 ? 1 : 0,
      redFlags: [],
    });
  }

  const doses: DoseLog[] = [];
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const date = toISODate(dateOfDay(startDate, day));
    const skipped = (persona === "worried" && day >= 38 && day <= 41) || day % 23 === 0;
    doses.push({ date, slot: "am", done: !skipped, at: at(startDate, day, 8, 5) });
    doses.push({ date, slot: "pm", done: !skipped && day % 11 !== 0, at: at(startDate, day, 21, 35) });
  }

  return {
    ...emptyState(),
    schemaVersion: SCHEMA_VERSION,
    profile: {
      nickname: quick ? "Kabir" : persona === "worried" ? "Rohan" : "Arjun",
      ageBand: quick ? "18-24" : "25-34",
      cityId: quick ? "mumbai" : persona === "worried" ? "delhi" : "pune",
      products: quick ? ["solution"] : ["solution", "gummies", "shampoo"],
      packs: [
        { sku: "WF-SOL-60", reg: startDate, batch: "DEMO1", scannedAt: at(startDate, 1, 20) },
        { sku: "WF-SOL-60", reg: toISODate(dateOfDay(startDate, 27)), batch: "DEMO2", scannedAt: at(startDate, 27, 19) },
      ],
      channel: quick ? "quick-commerce" : persona === "worried" ? "pharmacy-other" : "assessment",
      startDate,
      worries: quick ? ["shedding"] : ["shedding", "hairline"],
      seasonOverride: quick ? "monsoon" : null,
      createdAt: at(startDate, 1, 20),
    },
    routine: { morning: "08:00", evening: "21:30", rollerNights: [] },
    doses,
    checkins,
    letter: { text: LETTERS[persona], writtenAt: at(startDate, 1, 20, 10) },
    onboarding: {
      step: 9,
      completedAt: at(startDate, 1, 20, 12),
      briefingSeenAt: at(startDate, 1, 20, 13),
      baselineDoneAt: at(startDate, 1, 20, 20),
    },
    settings: { lang: "en", notifications: false, introSeen: true, reorder: {} },
    demo: { day: DEFAULT_DAY, persona },
  };
}
