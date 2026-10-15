import type { Mate, MateEvent } from "@/lib/providers/cohort";

/** Journey mates copy. Source of truth: docs/CONTENT_BANK.md, "Journey mates". */
export const MATES = {
  kicker: "Mates",
  title: "People who started when you did.",
  turn: (n: number, w: number) => `${n} of them are in week ${w} with you.`,
  turnBefore: "They're getting ready too.",
  demo: "Demo community",
  lead: "First names and cities only. No rankings, no photos, and nobody's results. Just the company.",
  feedTitle: "This fortnight",
  nudge: "Nudge",
  nudged: "Nudged",
  sheetTitle: (name: string) => `Send ${name} a nudge.`,
  sheetLead: "Pick one. It's a small thing, and that's the point.",
  phrases: ["Keep going", "Week five is the worst one", "Photos don't lie", "Same here"],
  emoji: ["👊", "🌱", "🙌", "💧"],
  sent: "Sent.",
  sentNote: "In the demo, nudges stay on this phone. Nothing is sent to anyone.",
  realTitle: "How this would work for real.",
  realBody:
    "Opt in only. Nicknames, never full names. Cities, never addresses. No photos are ever shared, and nobody sees anyone's results. Right now these people are simulated so you can see the idea.",
  realPoints: [
    "You choose to join, and you can leave at any time. Leaving deletes you from the list.",
    "A nickname and a city. Nothing else about you is shown.",
    "Only a few fixed phrases can be sent, so nobody can be unkind.",
    "No photos, no results, no streaks to compare. Ever.",
  ],
  inviteTitle: "Invite a friend.",
  inviteBody: "Know someone who just started? The first six months are easier with the map.",
  invite: "Invite a friend",
  copied: "Link copied. Paste it anywhere.",
  shareText:
    "I'm using Week Five to get through the first six months of hair treatment without losing my mind. It's free and keeps everything on your phone.",
  you: "You",
  today: "Today",
  yesterday: "Yesterday",
  daysAgo: (n: number) => `${n} days ago`,
};

/** One event as a sentence. */
export function eventText(e: MateEvent, mate: Mate | undefined): string {
  const who = mate ? `${mate.firstName} from ${mate.city}` : "Someone";
  switch (e.kind) {
    case "finished-week":
      return `${who} finished week ${e.week}.`;
    case "took-photo":
      return `${who} took their week ${e.week} photos.`;
    case "checked-in":
      return `${who} checked in.`;
    case "wrote-letter":
      return `${who} wrote a note to their week-five self.`;
    case "started":
      return `${who} started today. Day one.`;
    case "cohort-count":
      return `${e.count} people in your start week are on week ${e.week} today.`;
  }
}
