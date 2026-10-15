import type { ProductId } from "@/lib/storage/schema";

/** Today copy. Source of truth: docs/CONTENT_BANK.md, "Home". */

export const TODAY = {
  progress: (pct: number) => `${pct}% of the way to a fair verdict`,
  progressSr: (day: number, pct: number) =>
    `Day ${day} of 168. ${pct} percent of the way to week 24. The shed window is days 15 to 56.`,
  notStarted: (n: number) => `Your plan starts in ${n} ${n === 1 ? "day" : "days"}.`,

  routine: "Today",
  morning: "Morning",
  evening: "Evening",
  markDone: "Mark done",
  done: "Done",
  streak: (n: number) => `${n} ${n === 1 ? "day" : "days"} in a row`,
  guidance: "General guidance. Follow your pack leaflet or your doctor.",
  nothingToday: "Nothing on a schedule today. Your products are on the You page.",

  mirror: "Day one and now",
  mirrorEmpty: "No photos yet. Two minutes, and future you will thank you.",
  takePhotos: "Take photos",
  openMirror: "Open the mirror",
  nextPhotos: (week: number, date: string) => `Week ${week} photos around ${date}.`,
  sample: "Sample drawings for the demo, not photos of anyone.",

  supply: "Supply",
  daysLeft: (n: number) => (n <= 0 ? "Probably finished." : `About ${n} ${n === 1 ? "day" : "days"} left.`),
  runsOut: (product: string, date: string) => `Your ${product} runs out around ${date}.`,
  ranOut: (product: string) => `Your ${product} has probably run out. Bought a new pack? Scan its code.`,
  reorder: "Reorder on Man Matters",
  snooze: "Remind me in 3 days",
  snoozed: "We'll bring it up again in 3 days.",
  noPack: "How big is your pack, and when did you buy it?",
  addPack: "Add a pack",

  mates: "People who started when you did",
  demoCommunity: "Demo community",
  matesLine: (n: number, week: number) => `${n} people in your start week are on week ${week} today.`,
  seeMates: "See them",

  projection: "What week 24 can look like.",
  projectionNote: "An illustration of a typical outcome, not a promise.",
  seeProjection: "See the illustration",

  stopTitle: "Thinking of stopping?",
  stopBody: "Look at three things first: your day-one photo, where you are on the map, and the note you wrote.",
  stopAction: "Before you stop",

  compare: "Compare with day one",
  takeDayOne: "Take day-one photos",
  takeWeek: (w: number) => `Week ${w} photos`,
  checkIn: "Check in",
  dayOne: "Day 1",
};

/** How products read in a sentence ("Your regrowth solution runs out"). */
export const PRODUCT_WORDS: Record<ProductId, string> = {
  solution: "Regrowth solution",
  foam: "Regrowth foam",
  gummies: "Hair gummies, with food",
  shampoo: "Shampoo",
  roller: "Derma roller",
  serum: "Serum",
  other: "Your other product",
};
