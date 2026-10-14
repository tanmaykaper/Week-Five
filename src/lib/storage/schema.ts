import * as z from "zod/mini";
import { isISODate } from "@/lib/time/journey";

/** Bump when the stored shape changes, and add a migration in migrations.ts. */
export const SCHEMA_VERSION = 1;

const isoDate = z.string().check(z.refine(isISODate, "Expected a yyyy-mm-dd date"));
const isoDateTime = z.string().check(z.refine((s) => !Number.isNaN(Date.parse(s)), "Expected an ISO date-time"));
const level = z.int().check(z.gte(0), z.lte(4));
const time = z.string().check(z.regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM"));

export const productIds = ["solution", "foam", "gummies", "shampoo", "roller", "serum", "other"] as const;
export const channels = ["assessment", "quick-commerce", "pharmacy-other"] as const;
export const ageBands = ["18-24", "25-34", "35-44", "45-plus"] as const;
export const worries = ["shedding", "visible-scalp", "hairline", "crown", "other"] as const;
export const redFlags = ["pain", "burning", "rash", "swelling", "dizzy-or-racing-heart", "other-unusual"] as const;

export const packScanSchema = z.object({
  sku: z.string().check(z.minLength(1), z.maxLength(32)),
  reg: isoDate,
  batch: z.optional(z.string().check(z.maxLength(32))),
  scannedAt: isoDateTime,
});

export const profileSchema = z.object({
  nickname: z.string().check(z.maxLength(24)),
  ageBand: z.nullable(z.enum(ageBands)),
  cityId: z.nullable(z.string().check(z.maxLength(40))),
  products: z.array(z.enum(productIds)).check(z.minLength(1)),
  packs: z.array(packScanSchema),
  channel: z.enum(channels),
  startDate: isoDate,
  worries: z.array(z.enum(worries)),
  seasonOverride: z.nullable(z.enum(["monsoon", "no-monsoon"])),
  createdAt: isoDateTime,
});

export const routineSchema = z.object({
  morning: time,
  evening: time,
  rollerNights: z.array(z.int().check(z.gte(0), z.lte(6))),
});

export const doseLogSchema = z.object({
  date: isoDate,
  slot: z.enum(["am", "pm"]),
  done: z.boolean(),
  at: isoDateTime,
});

export const checkInSchema = z.object({
  id: z.string(),
  at: isoDateTime,
  day: z.int(),
  shed: level,
  worry: level,
  missedDoses: z.int().check(z.gte(0), z.lte(14)),
  redFlags: z.array(z.enum(redFlags)),
  note: z.optional(z.string().check(z.maxLength(280))),
});

export const letterSchema = z.object({
  text: z.string().check(z.maxLength(400)),
  writtenAt: isoDateTime,
  revealedAt: z.optional(isoDateTime),
  revealedIn: z.optional(z.enum(["week-4", "pause"])),
});

export const interceptSchema = z.object({
  id: z.string(),
  at: isoDateTime,
  day: z.int(),
  choice: z.enum(["keep-going", "pause", "doctor", "closed"]),
  restartDate: z.optional(isoDate),
});

export const settingsSchema = z.object({
  lang: z.enum(["en", "hinglish"]),
  notifications: z.boolean(),
  introSeen: z.boolean(),
  /** Hour (0 to 23) the day-one photos were taken, so monthly retakes can match the light. */
  photoHour: z.optional(z.int().check(z.gte(0), z.lte(23))),
  reorder: z.object({ snoozedUntil: z.optional(isoDate), lastShownAt: z.optional(isoDateTime) }),
});

/** Answers given so far during setup, so closing the tab resumes where it was. Nothing here is required. */
export const draftSchema = z.object({
  nickname: z.optional(z.string().check(z.maxLength(24))),
  /** null means the question was skipped. */
  ageBand: z.optional(z.nullable(z.enum(ageBands))),
  cityId: z.optional(z.nullable(z.string().check(z.maxLength(40)))),
  seasonOverride: z.optional(z.nullable(z.enum(["monsoon", "no-monsoon"]))),
  products: z.optional(z.array(z.enum(productIds))),
  channel: z.optional(z.enum(channels)),
  startDate: z.optional(isoDate),
  worries: z.optional(z.array(z.enum(worries))),
  letter: z.optional(z.string().check(z.maxLength(400))),
  morning: z.optional(time),
  evening: z.optional(time),
  notifications: z.optional(z.boolean()),
  pack: z.optional(packScanSchema),
});

export const onboardingSchema = z.object({
  step: z.int().check(z.gte(0)),
  draft: z.optional(draftSchema),
  completedAt: z.optional(isoDateTime),
  briefingSeenAt: z.optional(isoDateTime),
  baselineDoneAt: z.optional(isoDateTime),
});

export const appStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  profile: z.nullable(profileSchema),
  routine: routineSchema,
  doses: z.array(doseLogSchema),
  checkins: z.array(checkInSchema),
  letter: z.nullable(letterSchema),
  intercepts: z.array(interceptSchema),
  insightLog: z.array(z.object({ id: z.string(), on: isoDate })),
  nudgesSent: z.array(z.object({ mateId: z.string(), on: isoDate })),
  onboarding: onboardingSchema,
  settings: settingsSchema,
  /** Present only in the demo namespace. */
  demo: z.optional(
    z.object({ day: z.int().check(z.gte(1), z.lte(400)), persona: z.enum(["steady", "worried", "monsoon-quick-commerce"]) }),
  ),
});

export type AppState = z.infer<typeof appStateSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type DoseLog = z.infer<typeof doseLogSchema>;
export type Letter = z.infer<typeof letterSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type PackScan = z.infer<typeof packScanSchema>;
export type Intercept = z.infer<typeof interceptSchema>;
export type ProductId = (typeof productIds)[number];
export type Channel = (typeof channels)[number];
export type AgeBand = (typeof ageBands)[number];
export type Worry = (typeof worries)[number];
export type RedFlag = (typeof redFlags)[number];

export function emptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    routine: { morning: "08:00", evening: "21:30", rollerNights: [] },
    doses: [],
    checkins: [],
    letter: null,
    intercepts: [],
    insightLog: [],
    nudgesSent: [],
    onboarding: { step: 0 },
    settings: { lang: "en", notifications: false, introSeen: false, reorder: {} },
  };
}
