import { RED_CARDS, RESPONSES } from "@/content/checkin";
import type { CheckIn, RedFlag } from "@/lib/storage/schema";
import { phaseOf, weekOf } from "@/lib/time/journey";

export type CheckinResponse =
  | { kind: "red"; text: string }
  | { kind: "easy" | "uneasy"; text: string; showBaseline: boolean; showMap: boolean };

const SYSTEMIC: RedFlag[] = ["swelling", "dizzy-or-racing-heart"];
const IRRITATION: RedFlag[] = ["pain", "burning", "rash"];

/** The doctor card a check-in calls for, if any. The most urgent wins. */
export function redCard(c: Pick<CheckIn, "redFlags" | "shed">, day: number): string | null {
  if (c.redFlags.some((f) => SYSTEMIC.includes(f))) return RED_CARDS.systemic;
  if (c.redFlags.some((f) => IRRITATION.includes(f))) return RED_CARDS.irritation;
  if (c.redFlags.includes("other-unusual")) return RED_CARDS.other;
  if (day >= 112 && c.shed === 4) return RED_CARDS.lateHeavy;
  return null;
}

function responseKey(day: number): keyof typeof RESPONSES {
  const phase = phaseOf(day);
  if (phase === "not-started" || phase === "calm") return "calm";
  if (phase === "shed" || phase === "settling" || phase === "first-hairs") return phase;
  return "later";
}

/** What the app says after a check-in: a red flag replaces everything, otherwise phase by doubt. */
export function respond(c: Pick<CheckIn, "redFlags" | "shed" | "worry">, day: number): CheckinResponse {
  const red = redCard(c, day);
  if (red) return { kind: "red", text: red };
  const key = responseKey(day);
  const uneasy = c.shed >= 3 || c.worry >= 3;
  const text = RESPONSES[key][uneasy ? "uneasy" : "easy"].replace("{w}", String(Math.max(1, weekOf(day))));
  return { kind: uneasy ? "uneasy" : "easy", text, showBaseline: uneasy && key === "shed", showMap: uneasy && (key === "calm" || key === "shed") };
}

export function makeCheckin(input: { shed: number; worry: number; missedDoses: number; redFlags: RedFlag[]; note: string }, day: number, now: Date): CheckIn {
  const note = input.note.trim().slice(0, 280);
  return {
    id: `ci-${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: now.toISOString(),
    day,
    shed: input.shed,
    worry: input.worry,
    missedDoses: Math.max(0, Math.min(14, Math.round(input.missedDoses))),
    redFlags: input.redFlags,
    ...(note ? { note } : {}),
  };
}

/** The most recent check-in at or before now (demo mode carries future ones). */
export function latestCheckin(checkins: CheckIn[], now: Date): CheckIn | null {
  const t = now.getTime();
  let best: CheckIn | null = null;
  for (const c of checkins) {
    const at = Date.parse(c.at);
    if (at > t) continue;
    if (!best || at > Date.parse(best.at)) best = c;
  }
  return best;
}
