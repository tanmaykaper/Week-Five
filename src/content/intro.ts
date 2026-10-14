/**
 * The intro's six beats. Source of truth: docs/CONTENT_BANK.md.
 * Each beat is a headline in two voices (what happens, then how it feels), a short note,
 * and a chapter name shown beside the 24-week progress line.
 */
export interface IntroBeat {
  chapter: string;
  title: string;
  turn: string;
  note: string;
}

export const INTRO_BEATS: readonly IntroBeat[] = [
  {
    chapter: "The roots",
    title: "It works on hair",
    turn: "that hasn't grown yet.",
    note: "What's in the bottle works on the roots under your skin. The hair you can see today was decided months ago.",
  },
  {
    chapter: "The shed",
    title: "Around week three,",
    turn: "more hair falls, not less.",
    note: "For many people, that's the treatment starting. Older resting hairs make way for new ones.",
  },
  {
    chapter: "Six months",
    title: "Judge it at six months.",
    turn: "Not week five. Not day nine.",
    note: "Hair grows about a centimetre a month. Anything you decide sooner is a guess.",
  },
  {
    chapter: "The photo",
    title: "Memory is a bad judge.",
    turn: "A photo is a good one.",
    note: "Same spot, same light, once a month. Your day-one photo does the remembering for you.",
  },
  {
    chapter: "The map",
    title: "24 weeks.",
    turn: "A ring for each one.",
    note: "So here's the plan, with a map for every week of it. The shed window is drawn on from day one.",
  },
  {
    chapter: "Not alone",
    title: "You're not the only one.",
    turn: "Others started this week too.",
    note: "Plenty of people began the same week you did. You'll see them along the way.",
  },
] as const;

export const INTRO_FINAL = "Let's set up your plan.";
export const INTRO_FINAL_NOTE = "About two minutes. Nothing leaves this phone.";

/** Labels laid on the rings while the map is on screen. */
export const INTRO_LABELS = {
  start: "Day one",
  shed: "Weeks 3 to 8, the shed window",
  photos: "Photo days",
  hairs: "Week 13, fine hairs often show",
  verdict: "Week 24, a fair verdict",
} as const;
