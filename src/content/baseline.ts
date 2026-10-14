import type { View } from "@/lib/storage/photos";

/**
 * Day-one photo copy. Source of truth: docs/CONTENT_BANK.md, "Baseline capture".
 * Like setup, every screen is a headline in two voices: what to do, then why.
 */

export const VIEWS: View[] = ["crown", "hairline", "parting"];

export const VIEW_COPY: Record<
  View,
  { name: string; title: string; turn: string; how: string; shutter: string; facing: "user" | "environment"; timer: boolean }
> = {
  crown: {
    name: "Crown",
    title: "Your crown, from above.",
    turn: "The bit you never see yourself.",
    how: "Hold the phone above your head, camera facing down. Line the top of your head up with the outline.",
    shutter: "Take crown photo",
    facing: "environment",
    timer: true,
  },
  hairline: {
    name: "Hairline",
    title: "Your hairline, face on.",
    turn: "The one everybody else sees.",
    how: "Face the camera, hair pushed back, eyebrows on the line.",
    shutter: "Take hairline photo",
    facing: "user",
    timer: false,
  },
  parting: {
    name: "Parting",
    title: "Your parting, head down.",
    turn: "The easiest place to see density.",
    how: "Tilt your head down. Part your hair where you normally would.",
    shutter: "Take parting photo",
    facing: "environment",
    timer: true,
  },
};

/** Longer names for lists, where there is room. */
export const VIEW_LABEL: Record<View, string> = {
  crown: "Crown",
  hairline: "Hairline and temples",
  parting: "Parting",
};

export const INTRO = {
  chapter: "Day-one photos",
  title: "Three photos, two minutes.",
  turn: "Your day one, on the record.",
  lead: "Same spot, same time of day, every month. A window in daylight is perfect. Bathroom light is not.",
  start: "Open the camera",
  resume: (view: string) => `Carry on with the ${view.toLowerCase()}`,
  later: "I'll do it later",
  privacy: "Photos stay on this phone. Nothing is sent anywhere.",
};

export const LIGHT = {
  reading: "Checking the light",
  dark: "Too dark. Move closer to a window.",
  good: "Good light.",
  bright: "Too bright. Step out of direct sun.",
  /** Shown under a still that came out dark or bright. */
  stillDark: "This one is dark. A retake by a window will compare better.",
  stillBright: "This one is bright. Out of direct sun will compare better.",
};

export const CAPTURE = {
  timer: "Timer",
  timerNote: "Three seconds to get the phone into place.",
  flip: "Switch camera",
  choose: "Choose a photo",
  keep: "Keep",
  retake: "Retake",
  review: "Sharp, and the outline roughly lined up? Keep it.",
  savedReview: "Already saved. Keep it, or take it again.",
  unreadable: "We couldn't read that photo. Try another one.",
  unsaved: "We couldn't save that photo. Your phone may be low on space.",
  saved: "Photo saved. It stays on this phone.",
  starting: "Opening the camera",
  denied: "No camera access. You can still pick photos from your gallery.",
  unavailable: "This browser can't open the camera. Choose a photo instead.",
  countdown: (n: number) => `Taking the photo in ${n}`,
  cancel: "Cancel the timer",
  cropNote: "We keep the middle square, the same every month.",
};

export const PAINTER = {
  chapter: "Your area",
  title: "Show us the area you watch.",
  turn: "Only for the projection, nothing else.",
  lead: "Paint over it with your finger. Rough is fine.",
  leadPointer: "Paint over it with the pointer. Rough is fine.",
  brush: "Brush",
  sizes: [
    { id: "s", label: "Small", radius: 0.035 },
    { id: "m", label: "Medium", radius: 0.06 },
    { id: "l", label: "Large", radius: 0.1 },
  ],
  undo: "Undo",
  clear: "Clear",
  middle: "Mark the middle for me",
  done: "Done",
  skip: "Skip",
  empty: "Nothing painted yet. Skip if you'd rather not.",
  saved: "Area saved.",
};

export const DONE = {
  chapter: "Day one",
  title: "Day one, recorded.",
  partialTitle: "Day one, nearly recorded.",
  partialTurn: "Take the rest when you can.",
  confirmDelete: "Delete it",
  turn: (week: number) => `See you in week ${week}.`,
  lead: (date: string, time: string) => `Next photos around ${date}, at about ${time}. Same spot, same light.`,
  go: "Go to Today",
  paint: "Mark the area you watch",
  repaint: "Change the marked area",
  retake: "Retake",
  delete: "Delete",
  deleted: "Photo deleted.",
  take: (view: string) => `Take ${view.toLowerCase()} photo`,
  install: "Add Week Five to your home screen. It keeps your photos safer on this phone.",
  installButton: "Add to home screen",
  installIos: "On iPhone: Share, then Add to Home Screen.",
};
