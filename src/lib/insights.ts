import { RED_FLAG_LABELS, SHED_WORDS, WORRY_WORDS } from "@/content/checkin";
import { PRODUCT_WORDS } from "@/content/today";
import RAW from "@/content/insights.json";
import { daysSince, pauseState } from "@/lib/pause";
import type { Season } from "@/lib/season";
import type { Channel, CheckIn, Intercept, Letter, ProductId, RedFlag } from "@/lib/storage/schema";
import { addDays, parseISODate, photoWindow, PHOTO_WEEKS, photoWeekDue, timeOfDay, toISODate, type ISODate } from "@/lib/time/journey";

/**
 * The reassurance engine (BUILD_DOC F8): the right sentence on the right day. Cards and
 * their triggers live in src/content/insights.json so the copy can be edited in one place.
 *
 * Selection: everything eligible; any serious card (red flags) wins outright; otherwise
 * the highest priority. Ambient cards (priority under 80) rest for seven days after being
 * shown, so the same line doesn't greet someone all week; today's pick stays put all day.
 * A stable hash of the date picks variant A or B.
 */

export type Tone = "warm" | "calm" | "direct" | "dry" | "serious";
export type Attach = "baseline" | "photos" | "letter" | "checkin" | "breathe" | "doctor" | "map";

export interface When {
  days?: [number, number];
  latest?: { eitherMin?: number; shedMin?: number; shedMax?: number; worryMin?: number; worryMax?: number; missedMin?: number; missedMax?: number; flags?: RedFlag[] };
  night?: boolean;
  morning?: boolean;
  baseline?: boolean;
  letter?: "none" | "sealed";
  season?: "overlap" | "dry";
  startMonths?: number[];
  channel?: Channel;
  product?: ProductId;
  photoWindow?: number;
  photoOverdue?: boolean;
  noCheckinDays?: number;
  keptGoingWithinDays?: number;
  restartedWithinDays?: number;
  paused?: boolean;
  rollerNight?: boolean;
  consistent?: boolean;
}

export interface Card {
  id: string;
  priority: number;
  tone: Tone;
  when: When;
  refs: string[];
  variants: [string, string];
  attach?: Attach;
  noNumbers?: boolean;
}

export const CARDS = RAW as Card[];

export interface InsightContext {
  day: number;
  now: Date;
  startDate: ISODate;
  channel: Channel;
  products: ProductId[];
  cityName: string | null;
  season: Season;
  checkins: CheckIn[];
  hasBaseline: boolean;
  /** Weeks that already have photos. */
  photoWeeks: number[];
  letter: Letter | null;
  intercepts: Intercept[];
  insightLog: { id: string; on: ISODate }[];
  rollerNights: number[];
}

export interface Insight {
  id: string;
  text: string;
  tone: Tone;
  attach: Attach | null;
  refs: string[];
  noNumbers: boolean;
  /** Plain-language reasons, for "Why am I seeing this?". */
  reasons: string[];
  /** The photo week a photo card is about, if any. */
  photoWeek: number | null;
}

const DAY = 86_400_000;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Everything the triggers need, worked out once. */
function derive(c: InsightContext) {
  const t = c.now.getTime();
  const past = c.checkins.filter((x) => Date.parse(x.at) <= t).sort((a, b) => a.at.localeCompare(b.at));
  const latest = past[past.length - 1] ?? null;
  const recent = latest && t - Date.parse(latest.at) < 7 * DAY ? latest : null;
  const pause = pauseState(c.intercepts, c.now);
  const dueWeek = photoWeekDue(c.day);
  const overdueWeek =
    PHOTO_WEEKS.find((w) => {
      const { to } = photoWindow(w);
      return c.day > to && c.day <= to + 10 && !c.photoWeeks.includes(w);
    }) ?? null;
  return { latest, recent, last2: past.slice(-2), pause, dueWeek, overdueWeek, startMonth: parseISODate(c.startDate).getMonth() + 1 };
}

type Derived = ReturnType<typeof derive>;

function matches(w: When, c: InsightContext, d: Derived): boolean {
  if (w.days && (c.day < w.days[0] || c.day > w.days[1])) return false;
  if (w.latest) {
    const r = d.recent;
    if (!r) return false;
    const l = w.latest;
    if (l.eitherMin !== undefined && !(r.shed >= l.eitherMin || r.worry >= l.eitherMin)) return false;
    if (l.shedMin !== undefined && r.shed < l.shedMin) return false;
    if (l.shedMax !== undefined && r.shed > l.shedMax) return false;
    if (l.worryMin !== undefined && r.worry < l.worryMin) return false;
    if (l.worryMax !== undefined && r.worry > l.worryMax) return false;
    if (l.missedMin !== undefined && r.missedDoses < l.missedMin) return false;
    if (l.missedMax !== undefined && r.missedDoses > l.missedMax) return false;
    if (l.flags && !r.redFlags.some((f) => l.flags!.includes(f))) return false;
  }
  if (w.night !== undefined && (timeOfDay(c.now) === "night") !== w.night) return false;
  if (w.morning !== undefined && (timeOfDay(c.now) === "morning") !== w.morning) return false;
  if (w.baseline !== undefined && c.hasBaseline !== w.baseline) return false;
  if (w.letter === "none" && c.letter) return false;
  if (w.letter === "sealed" && (!c.letter || c.letter.revealedAt)) return false;
  if (w.season === "overlap" && !c.season.overlapsShed) return false;
  if (w.season === "dry" && c.season.months.length > 0) return false;
  if (w.startMonths && !w.startMonths.includes(d.startMonth)) return false;
  if (w.channel && c.channel !== w.channel) return false;
  if (w.product && !c.products.includes(w.product)) return false;
  if (w.photoWindow !== undefined && (d.dueWeek !== w.photoWindow || c.photoWeeks.includes(w.photoWindow))) return false;
  if (w.photoOverdue && d.overdueWeek === null) return false;
  if (w.noCheckinDays !== undefined && d.latest && c.now.getTime() - Date.parse(d.latest.at) < w.noCheckinDays * DAY) return false;
  if (w.keptGoingWithinDays !== undefined && (!d.pause.keptGoingAt || c.now.getTime() - Date.parse(d.pause.keptGoingAt) > w.keptGoingWithinDays * DAY)) return false;
  if (w.restartedWithinDays !== undefined) {
    const on = d.pause.restartedOn;
    if (!on || d.pause.pausedUntil || daysSince(on, c.now) > w.restartedWithinDays) return false;
  }
  if (w.paused !== undefined && Boolean(d.pause.pausedUntil) !== w.paused) return false;
  if (w.rollerNight && !c.rollerNights.includes(c.now.getDay())) return false;
  if (w.consistent && (d.last2.length < 2 || d.last2.some((x) => x.missedDoses >= 3))) return false;
  return true;
}

/** "You're seeing this because ..." in plain words, from the card's trigger and the person's data. */
function reasonsFor(w: When, c: InsightContext, d: Derived): string[] {
  const out: string[] = [];
  const r = d.recent;
  if (w.days) out.push(`you're on day ${c.day}`);
  if (w.paused) out.push(`you paused until ${fmt(d.pause.pausedUntil!)}`);
  if (w.restartedWithinDays !== undefined && d.pause.restartedOn) out.push(`you restarted on ${fmt(d.pause.restartedOn)}`);
  if (w.keptGoingWithinDays !== undefined) out.push("you thought about stopping this week and kept going");
  if (w.latest && r) {
    const l = w.latest;
    if (l.flags) out.push(`you ticked ${r.redFlags.filter((f) => l.flags!.includes(f)).map((f) => RED_FLAG_LABELS[f].toLowerCase()).join(" and ")}`);
    if (l.eitherMin !== undefined || l.shedMin !== undefined || l.shedMax !== undefined) out.push(`you said hair fall is "${SHED_WORDS[r.shed]!.toLowerCase()}"`);
    if (l.eitherMin !== undefined || l.worryMin !== undefined || l.worryMax !== undefined) out.push(`you said worry is "${WORRY_WORDS[r.worry]!.toLowerCase()}"`);
    if (l.missedMin !== undefined) out.push(`you said you missed ${r.missedDoses} applications in the last week`);
  }
  if (w.night) out.push("it's late at night");
  if (w.morning) out.push("it's morning");
  if (w.baseline === true) out.push("you've taken your day-one photos");
  if (w.baseline === false) out.push("you haven't taken your day-one photos yet");
  if (w.letter === "sealed") out.push("you wrote a note for this stretch");
  if (w.letter === "none") out.push("you haven't written your note yet");
  if (w.season === "overlap") out.push(c.cityName ? `you're in ${c.cityName}'s monsoon months` : "your rains overlap the shed window");
  if (w.startMonths) out.push(`you started in ${parseISODate(c.startDate).toLocaleDateString("en-GB", { month: "long" })}`);
  if (w.channel === "quick-commerce") out.push("you bought on a quick-commerce app");
  if (w.product) out.push(`you use ${PRODUCT_WORDS[w.product].split(",")[0]!.toLowerCase()}`);
  if (w.photoWindow !== undefined) out.push(`it's week ${w.photoWindow}, a photo week`);
  if (w.photoOverdue && d.overdueWeek) out.push(`your week ${d.overdueWeek} photos haven't been taken`);
  if (w.noCheckinDays !== undefined) out.push(d.latest ? "you haven't checked in for a week" : "you haven't checked in yet");
  if (w.consistent) out.push("you've missed very few applications lately");
  if (w.rollerNight) out.push("tonight is a roller night");
  return out;
}

const fmt = (iso: ISODate) => parseISODate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

const FALLBACK: Card = {
  id: "fallback",
  priority: 0,
  tone: "warm",
  when: {},
  refs: [],
  variants: ["One day at a time. The map is drawn; you just have to keep walking it.", "Nothing new to say today. That's a good sign."],
};

const NOT_STARTED: Card = {
  id: "not-started",
  priority: 0,
  tone: "direct",
  when: {},
  refs: [],
  variants: [
    "Your plan hasn't started yet. Take your day-one photos before the first application, then let the clock run.",
    "Day one is coming. Take your three photos before you start, so you have something to compare against.",
  ],
};

/** Ambient cards rest for this many days after being shown. Cards at 80 and above can repeat. */
export const COOLDOWN_DAYS = 7;

function restingIds(log: { id: string; on: ISODate }[], now: Date): Set<string> {
  const today = toISODate(now);
  const from = toISODate(addDays(now, -COOLDOWN_DAYS));
  return new Set(log.filter((l) => l.on < today && l.on >= from).map((l) => l.id));
}

export function pickInsight(c: InsightContext): Insight {
  const d = derive(c);
  const today = toISODate(c.now);
  let card: Card;
  if (c.day <= 0) card = NOT_STARTED;
  else {
    const eligible = CARDS.filter((x) => matches(x.when, c, d)).sort((a, b) => b.priority - a.priority);
    const serious = eligible.find((x) => x.tone === "serious" && x.when.latest?.flags);
    const resting = restingIds(c.insightLog, c.now);
    card = serious ?? eligible.find((x) => x.priority >= 80 || !resting.has(x.id)) ?? eligible[0] ?? FALLBACK;
  }
  const variant = card.variants[hash(`${today}:${card.id}`) % 2]!;
  const photoWeek = card.when.photoWindow ?? (card.when.photoOverdue ? d.overdueWeek : null);
  const text = variant
    .replace("{w}", String(photoWeek ?? ""))
    .replace("{restart}", d.pause.pausedUntil ? fmt(d.pause.pausedUntil) : "");
  return {
    id: card.id,
    text,
    tone: card.tone,
    attach: card.attach ?? null,
    refs: card.refs,
    noNumbers: Boolean(card.noNumbers),
    reasons: reasonsFor(card.when, c, d),
    photoWeek,
  };
}

/** "you're on day 34 and you said hair fall is ..." joined into one sentence. */
export function reasonSentence(reasons: string[]): string {
  if (reasons.length === 0) return "It's a general note for anyone at this point in the plan.";
  const list = reasons.length === 1 ? reasons[0]! : `${reasons.slice(0, -1).join(", ")} and ${reasons[reasons.length - 1]}`;
  return `You're seeing this because ${list}.`;
}

/** The insight log after showing `id` today: one entry per day, the last 60 kept. */
export function logInsight(log: { id: string; on: ISODate }[], id: string, now: Date): { id: string; on: ISODate }[] {
  const today = toISODate(now);
  const rest = log.filter((l) => l.on !== today);
  return [...rest, { id, on: today }].slice(-60);
}

