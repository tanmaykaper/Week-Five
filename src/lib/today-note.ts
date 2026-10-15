import type { ReferenceKey } from "@/content/references";
import { redCard } from "@/lib/checkin";
import type { Season } from "@/lib/season";
import type { Channel, CheckIn } from "@/lib/storage/schema";
import { photoWeekDue, timeOfDay } from "@/lib/time/journey";

/**
 * The one sentence Today opens with. Phase 5 uses this compact, priority-ordered subset of
 * the insight cards in docs/CONTENT_BANK.md (variant A, same ids). Phase 6 replaces it with
 * the full engine: insights.json, both variants, the seven-day cooldown and "Why am I seeing
 * this?". Red flags always win.
 */

export type NoteTone = "warm" | "calm" | "direct" | "dry" | "serious";
/** What the note points at: the day-one photo, the photos due, the check-in bar, or nothing. */
export type NoteAttach = "baseline" | "photos" | "checkin" | null;

export interface Note {
  id: string;
  text: string;
  tone: NoteTone;
  attach: NoteAttach;
  ref?: ReferenceKey;
}

export interface NoteContext {
  day: number;
  now: Date;
  channel: Channel;
  season: Season;
  checkins: CheckIn[];
  /** The latest check-in at or before now. */
  latest: CheckIn | null;
  hasBaseline: boolean;
  /** Weeks that already have photos. */
  photoWeeks: number[];
}

const DAY = 86_400_000;

interface Rule {
  id: string;
  priority: number;
  tone: NoteTone;
  attach?: NoteAttach;
  ref?: ReferenceKey;
  when: (c: NoteContext & { recent: CheckIn | null }) => boolean;
  text: string | ((c: NoteContext) => string);
}

const between = (d: number, a: number, b: number) => d >= a && d <= b;

const RULES: Rule[] = [
  { id: "red", priority: 100, tone: "serious", when: (c) => Boolean(c.recent && redCard(c.recent, c.day)), text: (c) => redCard(c.latest!, c.day)! },
  {
    id: "night-worry",
    priority: 88,
    tone: "calm",
    when: (c) => timeOfDay(c.now) === "night" && (c.recent?.worry ?? 0) >= 3,
    text: "It's late, and hair always looks worse at this hour. Breathe slowly for a minute. Look again in daylight.",
  },
  {
    id: "calm-no-baseline",
    priority: 90,
    tone: "direct",
    attach: "photos",
    ref: "kahneman1979",
    when: (c) => c.day <= 21 && !c.hasBaseline,
    text: "You haven't taken your day-one photos yet. Two minutes, and it's the most useful thing you'll do this month.",
  },
  {
    id: "judge-day",
    priority: 85,
    tone: "calm",
    attach: "baseline",
    ref: "aafp",
    when: (c) => between(c.day, 165, 175),
    text: "Week 24. Time to judge fairly: day one next to today. If you're not sure what you're seeing, a doctor can read it with you.",
  },
  {
    id: "photo-due",
    priority: 82,
    tone: "direct",
    attach: "photos",
    ref: "kivetz2006",
    when: (c) => {
      const w = photoWeekDue(c.day);
      return w !== null && !c.photoWeeks.includes(w);
    },
    text: (c) => {
      const w = photoWeekDue(c.day)!;
      if (w === 4) return "First monthly photo day. Same spot, same light, same time as day one. Expect no visible change yet.";
      if (w === 8) return "Week eight photos tonight. Compare with day one, not with yesterday.";
      if (w === 12) return "Week twelve photos. Some people see a little, many see nothing yet. Both are on schedule.";
      if (w === 16) return "Week sixteen photos. This is often the first comparison where people spot something.";
      if (w === 20) return "Week twenty photos. One more set after this, and then you get to judge properly.";
      return "Week 24 photos. Same spot, same light, no rush. This is the set you judge with.";
    },
  },
  {
    id: "shed-high",
    priority: 80,
    tone: "calm",
    attach: "baseline",
    ref: "oliver1980",
    when: (c) => between(c.day, 14, 56) && Boolean(c.recent && (c.recent.shed >= 3 || c.recent.worry >= 3)),
    text: "This is the shed window. If more hair is coming out right now, that is the pattern most people describe. Here is your day-one photo to compare against.",
  },
  {
    id: "settle-still-heavy",
    priority: 80,
    tone: "serious",
    ref: "aafp",
    when: (c) => between(c.day, 57, 84) && (c.recent?.shed ?? 0) >= 3,
    text: "Still shedding a lot past week eight? It can take a while to settle, especially in a rainy season. If it's still heavy by week twelve, check in with a doctor.",
  },
  {
    id: "shed-monsoon",
    priority: 78,
    tone: "calm",
    ref: "kunz2009",
    when: (c) => between(c.day, 15, 56) && c.season.overlapsShed,
    text: "Two sheds are overlapping. The season is part of this, not just the bottle.",
  },
  {
    id: "missed-many",
    priority: 76,
    tone: "calm",
    ref: "kaliyadan2013",
    when: (c) => (c.recent?.missedDoses ?? 0) >= 7,
    text: "Life got in the way for a bit. When you restart, you may see a small shed again. That's normal, not a step back.",
  },
  {
    id: "shed-week-five",
    priority: 75,
    tone: "warm",
    ref: "shadi2023",
    when: (c) => between(c.day, 29, 35),
    text: "Week five. The week most people find hardest, and the week a lot of people quit. You're still here.",
  },
  {
    id: "missed-few",
    priority: 74,
    tone: "warm",
    ref: "odonoghue1999",
    when: (c) => between(c.recent?.missedDoses ?? 0, 3, 6),
    text: "Missed a few days? It happens. Pick it up again tonight. No catching up, no doubling, just carry on.",
  },
  {
    id: "calm-heads-up",
    priority: 70,
    tone: "direct",
    ref: "mcguire1961",
    when: (c) => between(c.day, 10, 16),
    text: "Heads up. Over the next few weeks, many people notice more hair in the shower. If that happens, it's the expected part.",
  },
  {
    id: "fine-not-late",
    priority: 70,
    tone: "calm",
    ref: "aafp",
    when: (c) => between(c.day, 90, 126) && (c.recent?.worry ?? 0) >= 3,
    text: "If you can't see a difference yet, you're not late. The fair point to judge is around week 24.",
  },
  {
    id: "calm-quick-commerce",
    priority: 65,
    tone: "dry",
    ref: "mcguire1961",
    when: (c) => between(c.day, 1, 10) && c.channel === "quick-commerce",
    text: "You bought this in ten minutes, so nobody gave you the talk. Short version: expect a shed, judge at six months.",
  },
  { id: "settle-halfway", priority: 65, tone: "warm", ref: "kivetz2006", when: (c) => between(c.day, 84, 90), text: "Halfway to judgement day. Half the waiting is done, and none of it was wasted." },
  { id: "calm-day-one", priority: 60, tone: "warm", ref: "aafp", when: (c) => c.day === 1, text: "Day one. The clock has started. Nothing will look different for a while, and that's the plan." },
  { id: "shed-open", priority: 60, tone: "direct", ref: "kaliyadan2013", when: (c) => between(c.day, 15, 21), text: "You're in the shed window now. More hair coming out over the next few weeks is the pattern most people describe." },
  { id: "fine-hairs", priority: 60, tone: "warm", ref: "bernstein", when: (c) => between(c.day, 100, 130), text: "The first fine hairs often show up around now. Retake your photos tonight." },
  {
    id: "no-checkin-week",
    priority: 58,
    tone: "dry",
    attach: "checkin",
    when: (c) => c.day >= 8 && (!c.latest || c.now.getTime() - Date.parse(c.latest.at) >= 7 * DAY),
    text: "No check-in for a week. Thirty seconds, the bar at the bottom.",
  },
  { id: "settle-open", priority: 55, tone: "calm", ref: "kaliyadan2013", when: (c) => between(c.day, 57, 63), text: "The shed window is closing. For many people hair fall eases over the next few weeks." },
  { id: "build-almost", priority: 55, tone: "warm", ref: "kivetz2006", when: (c) => between(c.day, 150, 164), text: "Two weeks to judgement day. Plan a proper photo session: same spot, same light, no rush." },
  {
    id: "calm-photo-remembers",
    priority: 50,
    tone: "warm",
    attach: "baseline",
    ref: "kahneman1979",
    when: (c) => between(c.day, 2, 14) && c.hasBaseline,
    text: "Nothing to see yet, and that is the plan. Your photo is doing the remembering for you.",
  },
  { id: "shed-peak", priority: 50, tone: "calm", ref: "kaliyadan2013", when: (c) => between(c.day, 36, 49), text: "For many people the shed peaks around now and then eases. You're closer to the end of this part than the start." },
  { id: "shed-why", priority: 45, tone: "warm", ref: "bernstein", when: (c) => between(c.day, 15, 56), text: "Why shed at all? Older resting hairs get pushed out to make room for new growing ones. Out with the old, slowly." },
  { id: "beyond-keep", priority: 45, tone: "calm", ref: "aafp", when: (c) => c.day >= 176, text: "Many people keep going past six months, because the full effect can take closer to a year." },
  { id: "fine-growth-rate", priority: 40, tone: "calm", ref: "bernstein", when: (c) => between(c.day, 85, 126), text: "Hair grows about a centimetre a month. New hairs need a few months to be long enough to notice." },
  { id: "calm-roots", priority: 40, tone: "warm", ref: "kaliyadan2013", when: (c) => between(c.day, 2, 14), text: "It works on the roots, not the hair you can see. The hair on your head today started growing months ago." },
  { id: "settle-boring", priority: 35, tone: "dry", when: (c) => between(c.day, 64, 84), text: "This part is boring. Boring is good. Nothing dramatic is meant to happen yet." },
  { id: "build-long-middle", priority: 35, tone: "dry", when: (c) => between(c.day, 127, 164), text: "The long middle. Nobody writes songs about month five. Keep going anyway." },
];

export function todayNote(c: NoteContext): Note {
  if (c.day <= 0) {
    return {
      id: "not-started",
      text: "Your plan hasn't started yet. Take your day-one photos before the first application, then let the clock run.",
      tone: "direct",
      attach: c.hasBaseline ? null : "photos",
    };
  }
  // Check-in signals count for a week; older ones no longer describe how things are.
  const recent = c.latest && c.now.getTime() - Date.parse(c.latest.at) < 7 * DAY ? c.latest : null;
  const ctx = { ...c, recent };
  const hit = RULES.filter((r) => r.when(ctx)).sort((a, b) => b.priority - a.priority)[0];
  if (!hit) return { id: "fallback", text: "One day at a time. The map is drawn; you just have to keep walking it.", tone: "warm", attach: null };
  return { id: hit.id, text: typeof hit.text === "string" ? hit.text : hit.text(c), tone: hit.tone, attach: hit.attach ?? null, ...(hit.ref ? { ref: hit.ref } : {}) };
}
