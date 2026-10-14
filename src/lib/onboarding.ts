import { STEP_IDS, type StepId } from "@/content/onboarding";
import { skuByCode } from "@/content/skus";
import type { AgeBand, AppState, Draft, Profile, Routine } from "@/lib/storage/schema";
import { addDays, differenceInCalendarDays, parseISODate, toISODate, type ISODate } from "@/lib/time/journey";

/** How far back or ahead a start date may be. */
export const START_LIMITS = { pastDays: 365, futureDays: 60 };

/** Default reminder times by age band. Copy and times only, never anything about amounts. */
export function defaultTimes(age: AgeBand | null | undefined): { morning: string; evening: string } {
  switch (age) {
    case "18-24":
      return { morning: "09:00", evening: "22:30" };
    case "35-44":
      return { morning: "07:30", evening: "21:00" };
    case "45-plus":
      return { morning: "07:00", evening: "20:30" };
    default:
      return { morning: "08:00", evening: "21:30" };
  }
}

export function startDateProblem(value: string | undefined, now: Date): string | null {
  if (!value) return "Pick a day.";
  let d: Date;
  try {
    d = parseISODate(value);
  } catch {
    return "That isn't a date we can read.";
  }
  const diff = differenceInCalendarDays(d, now);
  if (diff < -START_LIMITS.pastDays) return "That's more than a year ago. Pick a day within the last year.";
  if (diff > START_LIMITS.futureDays) return "That's more than two months away. Pick a closer day.";
  return null;
}

/** Whether the step has what it needs to move on. Skippable steps can always move on. */
export function canContinue(step: StepId, draft: Draft, now: Date): boolean {
  switch (step) {
    case "products":
      return (draft.products?.length ?? 0) > 0;
    case "channel":
      return Boolean(draft.channel);
    case "start":
      return startDateProblem(draft.startDate, now) === null;
    default:
      return true;
  }
}

/** Fills in what a pack scan tells us, without overwriting anything already answered. */
export function draftFromPack(draft: Draft, pack: { sku: string; reg: ISODate; batch?: string }, now: Date): Draft {
  const sku = skuByCode(pack.sku);
  return {
    ...draft,
    pack: draft.pack ?? { sku: pack.sku, reg: pack.reg, batch: pack.batch, scannedAt: now.toISOString() },
    products: draft.products ?? (sku ? [...sku.products] : undefined),
  };
}

/** Quick picks for the start date: today, yesterday, a week ago, and the day the pack was bought. */
export function startPicks(now: Date, packReg?: ISODate): { label: string; value: ISODate }[] {
  const picks = [
    { label: "Today", value: toISODate(now) },
    { label: "Yesterday", value: toISODate(addDays(now, -1)) },
    { label: "A week ago", value: toISODate(addDays(now, -7)) },
  ];
  if (packReg && !picks.some((p) => p.value === packReg) && startDateProblem(packReg, now) === null) {
    picks.push({ label: "The day I bought it", value: packReg });
  }
  return picks;
}

/** Turns finished answers into the saved plan. Blank names become "you" in greetings. */
export function finishPlan(state: AppState, now: Date): AppState {
  const d = state.onboarding.draft ?? {};
  const times = defaultTimes(d.ageBand);
  const profile: Profile = {
    nickname: (d.nickname ?? "").trim().slice(0, 24),
    ageBand: d.ageBand ?? null,
    cityId: d.cityId ?? null,
    products: d.products && d.products.length > 0 ? d.products : ["solution"],
    packs: d.pack ? [d.pack] : [],
    channel: d.channel ?? "pharmacy-other",
    startDate: d.startDate ?? toISODate(now),
    worries: d.worries ?? [],
    seasonOverride: d.seasonOverride ?? null,
    createdAt: now.toISOString(),
  };
  const routine: Routine = {
    ...state.routine,
    morning: d.morning ?? times.morning,
    evening: d.evening ?? times.evening,
  };
  const letterText = (d.letter ?? "").trim();
  return {
    ...state,
    profile,
    routine,
    letter: letterText ? { text: letterText, writtenAt: now.toISOString() } : state.letter,
    settings: { ...state.settings, notifications: d.notifications ?? false },
    onboarding: { ...state.onboarding, step: STEP_IDS.length, completedAt: now.toISOString() },
  };
}

/** True when setup was started but not finished, so the app can offer to pick it up. */
export function setupInProgress(state: AppState): boolean {
  return !state.onboarding.completedAt && (state.onboarding.step > 0 || Boolean(state.onboarding.draft));
}
