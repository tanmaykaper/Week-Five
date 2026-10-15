/** Copy for the reassurance UI, the letter, the map and the stop flow. Source: docs/CONTENT_BANK.md. */

export const WHY = {
  link: "Why am I seeing this?",
  title: "Why this note?",
  turn: "Because of what you told us.",
  from: "Where this comes from",
  done: "Got it",
};

export const BREATHE = {
  in: "Breathe in",
  out: "Breathe out",
  still: "Breathe in slowly, then out even more slowly.",
};

export const LETTER = {
  writeTitle: "Write a note for week five.",
  writeTurn: "Your own words will land better than ours.",
  placeholder: "Dear week-five me, you started this because",
  hint: "Week five is when most people want to stop. We'll keep this hidden until then.",
  seal: "Seal it",
  sealedTitle: "Your note is sealed.",
  sealedTurn: (date: string) => `It opens on ${date}.`,
  sealedBody: "You'll get it at the start of week four, or sooner if you ever open \"Before you stop\".",
  readyTitle: "Your note is ready.",
  readyTurn: "You wrote it for this stretch.",
  read: "Read your note",
  wroteOn: (date: string) => `You wrote this on ${date}.`,
  readTitle: "From you, on day one.",
  close: "Close",
  noneShort: "Write your note",
};

export const MAP = {
  title: "Your 24 weeks.",
  turn: "A ring for each one.",
  lead: "What's normal, week by week, drawn before it happens.",
  prev: "Previous week",
  next: "Next week",
  read: (w: number) => `Read week ${w}`,
  here: "You are here",
  rainsOverlap: (a: number, b: number) =>
    `Rains on ${a === b ? `week ${a}` : `weeks ${a} to ${b}`}, on top of the shed window. Some of the hair fall then is the season, not the bottle.`,
  rainsClear: (a: number, b: number) => `Rains on ${a === b ? `week ${a}` : `weeks ${a} to ${b}`}, clear of the shed window.`,
  rainsNone: "No rainy months inside your 24 weeks.",
  listTitle: "Week by week",
  photos: "Photos",
  rains: "Rains",
  letterWeek: "Your note",
  legendShed: "Shed window",
  legendPhotos: "Photo days",
  legendRains: "Rains",
  legendHere: "You are here",
};

export const WEEK = {
  happens: "What often happens",
  todo: "What to do this week",
  notWorry: "Not a reason to worry",
  doctor: "When to see a doctor",
  sources: "Sources",
  back: "Your 24 weeks",
  here: "You're in this week.",
  photoWeek: "A photo week: same spot, same light, same time as day one.",
  rainWeek: "Your rains fall on this week.",
};

export const PAUSE = {
  entry: "I'm thinking of stopping",
  steps: ["Day one", "Where you are", "Your note", "Your choice"],
  dayOneTitle: "This was day one.",
  dayOneTurn: "Before you decide, here's where you started.",
  dayOneNone: "No day-one photo was taken. That's all right; the map still holds.",
  whereTitle: (d: number, w: number) => `You're on day ${d}, week ${w}.`,
  whereTurn: "The shed window runs to about week eight. Fair judgement is week 24.",
  whereEarly: "Your plan hasn't started yet. Day one is still ahead.",
  letterTitle: (date: string) => `You wrote this on ${date}.`,
  letterTurn: "To whoever you'd be this week.",
  factTitle: "Most people who feel this way are in weeks three to seven.",
  factTurn: "It's the most common time to stop, and the least informative time to judge.",
  next: "Next",
  back: "Back",
  close: "Close without choosing",
  keep: { label: "Keep going", note: "Back to your plan.", done: "Kept going. That was the hard bit.", doneTitle: "Kept going.", doneTurn: "That was the hard bit." },
  pause: {
    label: "Pause with a plan",
    note: "Pick a date to restart. You can add it to your calendar.",
    pick: "Restart on",
    confirm: "Pause until then",
    done: (date: string) => `Paused until ${date}. Restarting can bring a small shed again; that's expected.`,
    doneTitle: (date: string) => `Paused until ${date}.`,
    doneTurn: "Restarting can bring a small shed again.",
    doneBody: "That's expected. Your map keeps its place, and day one stays day one.",
    calendar: "Add the restart to my calendar",
  },
  doctor: {
    label: "Talk to a doctor",
    note: "Bring your photos and check-ins. We'll put them on one page.",
  },
  home: "Back to Today",
};

export const DOCTOR = {
  title: "For your doctor.",
  turn: "One page, from this phone.",
  lead: "Show this to a dermatologist or your GP. It has your dates, what you use and how the weeks have felt, and nothing else.",
  print: "Print this page",
  started: "Started",
  day: "Today",
  products: "Using",
  channel: "Bought through",
  checkins: "Check-ins",
  flags: "Flagged",
  none: "No check-ins yet.",
  noFlags: "Nothing flagged.",
  ask: "Questions worth asking",
  questions: [
    "Is what I'm seeing the usual shed, or something else?",
    "Is this the right product and routine for me?",
    "When should I judge whether it's working?",
  ],
  disclaimer: "Week Five is not medical advice and doesn't diagnose anything. This page is a summary of what you entered.",
};
