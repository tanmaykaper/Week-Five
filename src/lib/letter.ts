import type { AppState, Letter } from "@/lib/storage/schema";
import { dateOfDay, type ISODate } from "@/lib/time/journey";

/**
 * The note to week-five me (BUILD_DOC F10). Sealed until day 22, the start of week four,
 * or until the person opens "Before you stop", whichever comes first. Opening it is always
 * a deliberate tap, and the reveal is remembered.
 */
export const LETTER_OPENS_DAY = 22;

export type LetterStatus = "none" | "sealed" | "ready" | "revealed";

export function letterStatus(letter: Letter | null, day: number): LetterStatus {
  if (!letter || !letter.text.trim()) return "none";
  if (letter.revealedAt) return "revealed";
  return day >= LETTER_OPENS_DAY ? "ready" : "sealed";
}

export const letterOpens = (startDate: ISODate) => dateOfDay(startDate, LETTER_OPENS_DAY);

export function writeLetter(s: AppState, text: string, now: Date): AppState {
  const t = text.trim().slice(0, 400);
  if (!t) return s;
  return { ...s, letter: { text: t, writtenAt: now.toISOString() } };
}

export function revealLetter(s: AppState, via: "week-4" | "pause", now: Date): AppState {
  if (!s.letter || s.letter.revealedAt) return s;
  return { ...s, letter: { ...s.letter, revealedAt: now.toISOString(), revealedIn: via } };
}
