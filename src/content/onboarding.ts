import type { AgeBand, Channel, ProductId, Worry } from "@/lib/storage/schema";

/**
 * Setup copy. Source of truth: docs/CONTENT_BANK.md, "Onboarding story".
 * Each question is a headline in two voices: the question, then why we ask.
 */

export type StepId = "name" | "age" | "city" | "products" | "channel" | "start" | "worries" | "letter" | "reminders";

export const STEP_IDS: StepId[] = ["name", "age", "city", "products", "channel", "start", "worries", "letter", "reminders"];

export const STEP_COPY: Record<StepId, { title: string; turn: string; chapter: string; skip?: string }> = {
  name: { chapter: "Your name", title: "What should we call you?", turn: "Only for greetings. A nickname is fine." },
  age: { chapter: "Age", title: "Which age band are you in?", turn: "It changes a few tips. Never your dose.", skip: "Skip" },
  city: { chapter: "Your rains", title: "Which city are you in?", turn: "Only to know when your rains come.", skip: "Skip" },
  products: { chapter: "Your routine", title: "What are you using?", turn: "So your day shows the right things." },
  channel: { chapter: "How you bought it", title: "How did you buy it?", turn: "If nobody briefed you, we will." },
  start: { chapter: "Day one", title: "When did you start?", turn: "Everything on your map counts from this day." },
  worries: { chapter: "Your worry", title: "What bothers you most?", turn: "We'll keep an eye on it in your photos.", skip: "Skip" },
  letter: { chapter: "A note", title: "Write a note for week five.", turn: "Your own words will land better than ours.", skip: "I'll write it later" },
  reminders: { chapter: "Reminders", title: "When do you want reminders?", turn: "So your day shows the right times." },
};

/** With a pack scanned, step 4 opens differently. */
export const PRODUCTS_WITH_PACK = { title: "Here's what's on your pack.", turn: "Using anything else as well?" };

export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "18-24", label: "18 to 24" },
  { value: "25-34", label: "25 to 34" },
  { value: "35-44", label: "35 to 44" },
  { value: "45-plus", label: "45 and up" },
];

export const PRODUCT_OPTIONS: { value: ProductId; label: string }[] = [
  { value: "solution", label: "Regrowth solution" },
  { value: "foam", label: "Regrowth foam" },
  { value: "gummies", label: "Hair gummies" },
  { value: "shampoo", label: "Shampoo" },
  { value: "roller", label: "Derma roller" },
  { value: "serum", label: "Serum" },
  { value: "other", label: "Something else" },
];

export const CHANNEL_OPTIONS: { value: Channel; label: string; note: string }[] = [
  { value: "assessment", label: "Hair assessment and kit", note: "You answered questions, maybe spoke to a doctor." },
  { value: "quick-commerce", label: "A quick-commerce app", note: "Ten-minute delivery. Nobody gave you the talk." },
  { value: "pharmacy-other", label: "A pharmacy or somewhere else", note: "Off the shelf, or a friend's suggestion." },
];

export const WORRY_OPTIONS: { value: Worry; label: string }[] = [
  { value: "shedding", label: "Shedding" },
  { value: "visible-scalp", label: "Seeing my scalp" },
  { value: "hairline", label: "Hairline" },
  { value: "crown", label: "Crown" },
  { value: "other", label: "Something else" },
];

export const SOMEWHERE_ELSE = {
  label: "Somewhere else",
  question: "Does it rain hard where you are, roughly June to September?",
  options: [
    { value: "monsoon", label: "Yes" },
    { value: "no-monsoon", label: "No" },
    { value: "unsure", label: "Not sure" },
  ],
} as const;

export const LETTER = {
  placeholder: "Dear week-five me, you started this because",
  hint: "Week five is when most people want to stop. We'll keep this hidden until then.",
  saved: "Note saved. We'll hand it back in week four.",
};

export const REMINDERS = {
  morning: "Morning",
  evening: "Evening",
  notifications: "Notifications on this phone",
  notificationsNote: "Only while the app is open or installed. The calendar file in You works everywhere.",
  denied: "Notifications are off in your browser settings. The calendar file works instead.",
};

export const FINISH = {
  title: "Your plan",
  turn: "is ready.",
  lead: "One more thing before you start: the bit nobody tells you.",
  action: "Read the briefing",
};

/** Briefing cards. The full set for people nobody briefed; three for the assessment route. */
export interface BriefingCard {
  title: string;
  body: string;
  /** Weeks to light up on the rings while this card is showing. */
  weeks?: [number, number];
}

export const BRIEFING_CARDS: BriefingCard[] = [
  {
    title: "It works on the roots.",
    body: "Minoxidil works on the follicles under your skin, not on the hair you can see. That's why it's slow.",
    weeks: [1, 2],
  },
  {
    title: "Expect a shed.",
    body: "Between about week two and week eight, many people see more hair fall. Older resting hairs make way for new growing ones.",
    weeks: [3, 8],
  },
  {
    title: "It passes.",
    body: "For most people the shed settles within a few weeks. If it's still heavy around week twelve to sixteen, talk to a doctor.",
    weeks: [9, 16],
  },
  {
    title: "It doesn't mean it's failing.",
    body: "A shed in the early weeks is not a sign the product is damaging your hair. Stopping now resets the clock.",
    weeks: [3, 8],
  },
  {
    title: "Judge at six months.",
    body: "Hair grows about a centimetre a month. Fair judgement is around week 24, with your photos side by side.",
    weeks: [24, 24],
  },
];

export const BRIEFING = {
  full: {
    title: "The briefing you skipped.",
    lead: "You bought this in ten minutes, so nobody gave you the talk. Here's the short version.",
    cards: [0, 1, 2, 3, 4],
  },
  short: {
    title: "A quick reminder.",
    lead: "You heard this at the start. It's easy to forget by week five.",
    cards: [1, 3, 4],
  },
  done: "Got it. Take my day-one photos.",
};
