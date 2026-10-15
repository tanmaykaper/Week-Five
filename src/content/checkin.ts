import type { RedFlag } from "@/lib/storage/schema";

/** Check-in copy. Source of truth: docs/CONTENT_BANK.md, "Check-in". */

export const CHECKIN = {
  title: "How is your scalp today?",
  turn: "Thirty seconds. We'll tell you what's normal.",
  shed: "Hair fall this week",
  worry: "How worried are you",
  missed: "Missed applications in the last 7 days",
  flags: "Anything like this?",
  note: "Anything else? (optional)",
  notePlaceholder: "A line for yourself, if you like",
  save: "Save check-in",
  saved: "Check-in saved.",
  done: "Done",
  close: "Close",
  privacy: "Saved on this phone only.",
};

export const SHED_WORDS = ["Barely any", "A few", "Normal for me", "More than usual", "Handfuls"] as const;
export const WORRY_WORDS = ["Calm", "A little", "Some", "A lot", "Very"] as const;

export const RED_FLAG_LABELS: Record<RedFlag, string> = {
  pain: "Pain on the scalp",
  burning: "Burning",
  rash: "Rash or flaking",
  swelling: "Swelling in face, hands or feet",
  "dizzy-or-racing-heart": "Dizzy or racing heart",
  "other-unusual": "Something else unusual",
};

/**
 * What the app says back, by phase and by whether the check-in carries doubt (hair fall
 * or worry at 3 or more). Red flags replace all of this with a doctor card.
 */
export const RESPONSES = {
  calm: {
    easy: "Quiet start, as expected. See you next week.",
    uneasy: "Early to be seeing much. If it's more hair, the shed window usually opens around week three. Here's your plan.",
  },
  shed: {
    easy: "A calm week in the shed window. Not everyone sheds a lot.",
    uneasy: "This is the part that feels worst and is the most expected. Here's your day-one photo. Here's what week {w} looks like for most people.",
  },
  settling: {
    easy: "Settling down. That's the direction you want.",
    uneasy: "Still a lot? It can take a few weeks longer, especially in the rains. If it's still heavy around week twelve to sixteen, see a doctor.",
  },
  "first-hairs": {
    easy: "Good time to look closely at your hairline in daylight.",
    uneasy: "Nothing visible yet is still on schedule. Week 24 is the fair point to judge.",
  },
  later: {
    easy: "Steady. That's what month five should feel like.",
    uneasy: "If shedding is heavy this late, a doctor should take a look.",
  },
} as const;

export const RESPONSE_TITLES = {
  easy: { title: "Thanks.", turn: "That's on schedule." },
  uneasy: { title: "Heard.", turn: "Here's where you are." },
  red: { title: "Please see a doctor.", turn: "" },
};

export const RED_CARDS = {
  irritation: "You mentioned pain, burning or a rash. Please speak to a doctor before your next application. Show them this list.",
  systemic: "Dizziness, a racing heart, or swelling in your face, hands or feet needs a doctor today. Don't wait for the next check-in.",
  lateHeavy: "Heavy shedding this far in isn't the usual pattern. Book a doctor's appointment so someone can take a proper look.",
  other: "You noticed something unusual. Trust that. A doctor can tell you if it's related.",
};
