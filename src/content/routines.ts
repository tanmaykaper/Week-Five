import type { AgeBand, ProductId } from "@/lib/storage/schema";

/**
 * The routine rule table (kickoff 3.3, BUILD_DOC F13): when and how to fit each product into
 * a day. Timing and handling only. Never a dose, a strength or a prescription; age band and
 * city change the wording and the default times, nothing else. Every suggestion is shown
 * under "General guidance. Follow your pack leaflet or your doctor."
 */

export interface RoutineRule {
  id: string;
  /** Shown when any of these products is in the routine (any routine when left out). */
  products?: ProductId[];
  /** Only for these age bands. */
  ages?: AgeBand[];
  /** Only while the person's city is in its rainy months. */
  rains?: boolean;
  /** Only when the two daily times are this far apart or more (hours, either side of 12). */
  gapOff?: number;
  title: string;
  /** {morning}, {evening} and {gap} are filled in from the person's own times. */
  body: string;
}

const TOPICAL: ProductId[] = ["solution", "foam"];

export const ROUTINE_RULES: RoutineRule[] = [
  {
    id: "spacing",
    products: TOPICAL,
    title: "Two times, about twelve hours apart.",
    body: "Many people space the two applications roughly 12 hours apart. Yours are {morning} and {evening}.",
  },
  {
    id: "gap-off",
    products: TOPICAL,
    gapOff: 4,
    title: "Your times are {gap} hours apart.",
    body: "That works, but an even gap is easier to keep. Moving one of them closer to twelve hours apart is the usual tweak.",
  },
  {
    id: "dry-scalp",
    products: TOPICAL,
    title: "On a dry scalp, then let it dry.",
    body: "Put it on a dry scalp and give it time to dry before a pillow, a helmet or a cap. Wash your hands after.",
  },
  {
    id: "evening-early",
    products: TOPICAL,
    title: "Evening, not the last thing at night.",
    body: "Give the evening one a while to dry before you lie down, so it stays on your scalp and not on the pillow.",
  },
  {
    id: "roller-nights",
    products: ["roller"],
    title: "Keep roller nights apart.",
    body: "On the nights you use the roller, keep it and your solution apart. Your pack leaflet or your doctor says by how long. Pick fixed nights so you never have to think about it.",
  },
  {
    id: "gummies-food",
    products: ["gummies"],
    title: "Gummies with food.",
    body: "They sit better with a meal, so tie them to one you never skip. Dinner is in your evening slot already.",
  },
  {
    id: "shampoo-first",
    products: ["shampoo"],
    title: "Wash first, then apply.",
    body: "On wash days, shampoo, dry your scalp properly, then put the solution on. Not the other way round.",
  },
  {
    id: "serum-own-slot",
    products: ["serum"],
    title: "One product at a time.",
    body: "If you use a serum as well, give it its own moment and follow its pack. Layering everything at once makes it hard to tell what's doing what.",
  },
  {
    id: "travel",
    products: [...TOPICAL, "gummies"],
    title: "Travel days.",
    body: "On travel days, keep the times close to normal and pack it in your cabin bag. A time zone away? Move one slot a little each day.",
  },
  {
    id: "missed",
    title: "Missed one?",
    body: "Skip it and carry on at the next time. No catching up and no doubling.",
  },
  {
    id: "late-evenings",
    ages: ["18-24"],
    products: TOPICAL,
    title: "Late evenings.",
    body: "If your nights run late, set the evening time to when you get home, not when you sleep. Same time most days beats a perfect time some days.",
  },
  {
    id: "early-evenings",
    ages: ["45-plus", "35-44"],
    products: TOPICAL,
    title: "An earlier evening.",
    body: "An evening time a couple of hours before bed leaves room for it to dry. Yours is {evening}.",
  },
  {
    id: "rains",
    rains: true,
    products: TOPICAL,
    title: "Rainy days.",
    body: "Humid days mean a damp scalp. Dry it properly before you apply, and keep a cap or helmet off until it has dried.",
  },
];

export const ROUTINE_COPY = {
  title: "Your routine",
  turn: "When, not how much.",
  guidance: "General guidance. Follow your pack leaflet or your doctor.",
  doctor: "Talk to a doctor",
  morning: "Morning",
  evening: "Evening",
  roller: "Roller night",
  rollerHint: "Tap the nights you use the roller. Those evenings keep it apart from the solution.",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  /** Long names for screen readers, same order. */
  dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  apart: (h: number) => `${h} hours apart`,
  saved: "Saved. Today shows the new times.",
  calendarDaily: "Add the daily times to my calendar",
};
