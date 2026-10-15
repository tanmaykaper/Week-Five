import type { ReferenceKey } from "./references";

/**
 * What to expect, week by week (BUILD_DOC F7). Written in the voice guide: "commonly",
 * "for many people", never "will"; never a dose. Weeks share their phase's text, and the
 * weeks that matter (the shed window's middle, photo weeks, week 24) have their own.
 */

export interface WeekText {
  /** The serif turn under "Week n." */
  turn: string;
  /** One line for the map's list. */
  line: string;
  happens: string;
  todo: string;
  notWorry: string;
  doctor: string;
  refs: ReferenceKey[];
}

const RED_FLAGS =
  "Pain, burning, or a rash or flaking that doesn't settle. Swelling in your face, hands or feet. Feeling dizzy or a racing heart. If any of these happen, stop and talk to a doctor before the next application.";

const PHASES = {
  quiet: {
    happens:
      "Very little you can see. It works on the roots under your skin, and the hair on your head right now started growing months ago.",
    todo: "Use it at the times on your pack, every day. Take your day-one photos if you haven't, and write a few lines to yourself for week five.",
    notWorry: "No change in the mirror. For the first weeks that is the plan, not a sign it isn't working.",
    doctor: RED_FLAGS,
    refs: ["kaliyadan2013", "bernstein"] as ReferenceKey[],
  },
  shed: {
    happens:
      "Many people notice more hair in the shower, on the pillow or on the comb. Older resting hairs are making way for new growing ones.",
    todo: "Keep going at the same times. When it feels heavy, check in: the app answers with your day-one photo and your place on the map.",
    notWorry:
      "More hair fall in these weeks is the commonly reported pattern, not damage. Counting hairs on the pillow will make it feel worse than it is.",
    doctor: `${RED_FLAGS} Also see one for bald patches, or redness and soreness on the scalp.`,
    refs: ["kaliyadan2013", "oliver1980", "bernstein"] as ReferenceKey[],
  },
  settling: {
    happens: "For many people hair fall eases over these weeks. Nothing much is visible yet, and that is still on schedule.",
    todo: "Same times, same spot for photos. Week 12 photos are the first comparison with day one worth looking at closely.",
    notWorry: "No new hair to see yet. Hair grows about a centimetre a month, so new hairs need time before they're long enough to notice.",
    doctor: `${RED_FLAGS} Also see one if shedding is still heavy, or getting heavier, by week twelve.`,
    refs: ["kaliyadan2013", "bernstein"] as ReferenceKey[],
  },
  fine: {
    happens: "Some people start to see fine, short hairs, often at the hairline or the crown. Many see nothing yet. Both are common.",
    todo: "Look in daylight, not bathroom light. Week 16 photos are often the first set where people spot a difference.",
    notWorry: "Fine, light hairs are how new growth usually starts. They thicken over months, not weeks.",
    doctor: `${RED_FLAGS} Heavy shedding past week sixteen is worth a doctor's look too.`,
    refs: ["bernstein", "aafp"] as ReferenceKey[],
  },
  middle: {
    happens: "Slow, steady weeks. Change, if it comes, is gradual enough that you won't see it day to day.",
    todo: "Keep the routine. Week 20 photos, then one more set at week 24.",
    notWorry: "Some days looking better and some worse. Light, a haircut and how you slept all change how hair looks.",
    doctor: `${RED_FLAGS} Heavy shedding this late is not the usual pattern; book a doctor.`,
    refs: ["aafp", "kivetz2006"] as ReferenceKey[],
  },
};

type PhaseKey = keyof typeof PHASES;

const phaseOfWeek = (n: number): PhaseKey => (n <= 2 ? "quiet" : n <= 8 ? "shed" : n <= 12 ? "settling" : n <= 18 ? "fine" : "middle");

const OWN: Record<number, Partial<WeekText> & Pick<WeekText, "turn" | "line">> = {
  1: { turn: "Day one, and the quiet start.", line: "The clock starts. Nothing to see, on purpose." },
  2: { turn: "Nothing to see yet, on purpose.", line: "Still quiet. Habits matter more than mirrors." },
  3: {
    turn: "The shed window opens.",
    line: "More hair fall often starts around now.",
    happens: "The shed window opens. Over the next few weeks many people notice more hair falling, and some notice none. Both are common.",
  },
  4: {
    turn: "First monthly photos.",
    line: "Photo week. More hair fall is common.",
    todo: "Take your week 4 photos: same spot, same light, same time as day one. Don't expect them to show growth; they're for week 12 to compare against.",
  },
  5: {
    turn: "The part everyone finds hardest.",
    line: "The week most people want to stop.",
    happens:
      "For many people this is the heaviest-feeling week: more hair falling, nothing new to see. In the interviews behind this app, it was the most common week to stop.",
    todo: "Read the note you wrote on day one. Look at your day-one photo next to today, in daylight. Then decide nothing tonight.",
  },
  6: { turn: "Past the middle of the shed window.", line: "Past the middle. The shed often peaks soon." },
  7: { turn: "For many people, the peak.", line: "Often the peak of the shed." },
  8: {
    turn: "Photos, and the window starts to close.",
    line: "Photo week. The shed window starts to close.",
    todo: "Take your week 8 photos and compare them with day one, not with yesterday.",
  },
  9: { turn: "Things settling down.", line: "Hair fall often eases from here." },
  10: { turn: "Quieter weeks.", line: "Quieter. Nothing dramatic is meant to happen." },
  11: { turn: "Boring, on purpose.", line: "Boring is good." },
  12: {
    turn: "Third photos, and a first real look.",
    line: "Photo week. Halfway to a fair verdict.",
    todo: "Take your week 12 photos and look at them next to day one. Some people see a little, many see nothing yet.",
  },
  13: { turn: "When fine hairs often show up.", line: "Fine hairs often start around now." },
  14: { turn: "Look in daylight.", line: "Check the hairline and crown in daylight." },
  15: { turn: "A centimetre a month.", line: "Growth is slow. Patience is the method." },
  16: {
    turn: "Photos worth comparing.",
    line: "Photo week. Often the first visible difference.",
    todo: "Take your week 16 photos. This is often the first comparison where people spot something.",
  },
  17: { turn: "Keep the routine.", line: "Same times, same spot." },
  18: { turn: "Two thirds of the way.", line: "Two thirds done." },
  19: { turn: "The long middle.", line: "Nobody writes songs about month five." },
  20: {
    turn: "Photos, one set to go.",
    line: "Photo week. One more set after this.",
    todo: "Take your week 20 photos. One more set at week 24, and then you get to judge properly.",
  },
  21: { turn: "Steady.", line: "Steady weeks." },
  22: { turn: "Plan the last photos.", line: "Plan a proper week 24 photo session." },
  23: { turn: "Almost there.", line: "One week to a fair verdict." },
  24: {
    turn: "A fair verdict.",
    line: "Judge it now: day one next to today.",
    happens: "About six months in: the fair point to judge. Put day one next to today, same spot, same light.",
    todo: "Take your week 24 photos and compare them with day one. If you're not sure what you're seeing, a doctor can read them with you. Many people keep going, because the full effect can take closer to a year.",
    notWorry: "A modest change. For many people results are gradual, and two photos side by side are fairer than the mirror.",
    doctor: "If you're unsure what you see, or want to talk about what comes next, a doctor can look at your photos with you. And as always: pain, burning, a rash, swelling, dizziness or a racing heart need a doctor first.",
    refs: ["aafp", "kivetz2006"],
  },
};

export function weekText(n: number): WeekText {
  const phase = PHASES[phaseOfWeek(n)];
  const own = OWN[n]!;
  return { ...phase, ...own } as WeekText;
}

/** The phase names shown as groups on the map. */
export const WEEK_GROUPS = [
  { label: "Quiet start", from: 1, to: 2 },
  { label: "The shed window", from: 3, to: 8 },
  { label: "Settling", from: 9, to: 12 },
  { label: "First fine hairs", from: 13, to: 18 },
  { label: "The long middle", from: 19, to: 23 },
  { label: "A fair verdict", from: 24, to: 24 },
] as const;
