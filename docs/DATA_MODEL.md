# Data model and storage

Everything is stored in the user's own browser. Nothing is sent anywhere. The app ships with no one's data in it.

## Storage map

| What | Where | Key or store | Why there |
|---|---|---|---|
| Profile, routine, check-ins, doses, letter, intercepts, settings, insight history | localStorage | `weekfive:v1` (one JSON document) | Small, synchronous, read on first paint so Home renders without a flash |
| Photos (JPEG blobs), worry-area masks (PNG alpha), projections | IndexedDB | database `weekfive`, stores `photos`, `masks`, `projections` | Blobs are too big for localStorage, IDB stores them natively |
| Demo mode data | localStorage `weekfive-demo:v1` and IndexedDB `weekfive-demo` | separate namespace | Demo can never overwrite or mix with real data, and "leave demo" is a clean switch |
| Intro seen flag | inside `settings` in the main document | | Per namespace |
| Theme (`system`, `light`, `dark`) | localStorage | `weekfive:theme` | Read by an inline head script before first paint; shared by real and demo |
| Active namespace (`real` or `demo`) | localStorage | `weekfive:mode` | Survives reloads, so a reviewer stays in demo |

On first run the app calls `navigator.storage.persist()` so the browser is less likely to evict data. See the risk list in BUILD_DOC for Safari's 7-day eviction rule.

## Types (TypeScript, validated with Zod on every read)

```ts
type ISODate = string;          // "2026-10-14" (calendar date, local time)
type ISODateTime = string;      // "2026-10-14T21:05:00.000+05:30"

type ProductId = "solution" | "foam" | "gummies" | "shampoo" | "roller" | "serum" | "other";
type Channel = "assessment" | "quick-commerce" | "pharmacy-other";
type AgeBand = "18-24" | "25-34" | "35-44" | "45-plus";
type Worry = "shedding" | "visible-scalp" | "hairline" | "crown" | "other";
type View = "crown" | "hairline" | "parting";
type Level = 0 | 1 | 2 | 3 | 4;  // shed: barely any, a few, normal for me, more than usual, handfuls
                                 // worry: calm, a little, some, a lot, very
type RedFlag = "pain" | "burning" | "rash" | "swelling" | "dizzy-or-racing-heart" | "other-unusual";

interface PackScan {            // from the QR code, no personal data
  sku: string;                  // "WF-SOL-60"
  reg: ISODate;                 // purchase or registration date printed in the QR
  batch?: string;
  scannedAt: ISODateTime;
}

interface Profile {
  nickname: string;             // 1 to 24 chars, shown in greetings only
  ageBand: AgeBand | null;
  cityId: string | null;        // id from src/content/cities.ts, or null if skipped
  products: ProductId[];
  packs: PackScan[];            // every pack scanned or entered, newest last
  channel: Channel;
  startDate: ISODate;           // day 1 of the plan
  worries: Worry[];
  seasonOverride: "monsoon" | "no-monsoon" | null;
  createdAt: ISODateTime;
}

interface Routine {
  morning: string;              // "08:00"
  evening: string;              // "21:30"
  rollerNights: number[];       // 0 to 6 (Sun to Sat), only if roller in products
}

interface DoseLog { date: ISODate; slot: "am" | "pm"; done: boolean; at: ISODateTime }  // one entry per date and slot; toggling replaces it. Counts only if `at` is at or before now (demo plans carry future entries)

interface CheckIn {
  id: string;
  at: ISODateTime;
  day: number;                  // journey day at time of check-in
  shed: Level;
  worry: Level;
  missedDoses: number;          // user-reported for the last 7 days, 0 to 14
  redFlags: RedFlag[];
  note?: string;                // max 280 chars
}

interface Letter { text: string; writtenAt: ISODateTime; revealedAt?: ISODateTime; revealedIn?: "week-4" | "pause" }

// Phase 6: intercepts are written by the stop flow ("closed" when it is left without a choice);
// a pause's restartDate drives the paused and restart notes. Day counts never reset.
interface Intercept {
  id: string;
  at: ISODateTime;
  day: number;
  choice: "keep-going" | "pause" | "doctor" | "closed";
  restartDate?: ISODate;        // when choice is "pause"
}

interface Photo {               // IndexedDB "photos"
  id: string;
  view: View;
  week: number;                 // 0 for baseline, then 4, 8, 12, 16, 20, 24 (or any week for extra shots)
  takenAt: ISODateTime;
  blob: Blob;                   // JPEG, the centred square of the frame, at most 1600px, EXIF stripped by re-encoding through canvas, never mirrored
  width: number; height: number;
  luminance: number;            // 0 to 255 mean, recorded so comparisons can warn about lighting
}

interface Mask { photoId: string; blob: Blob }            // IndexedDB "masks", 512px PNG with alpha = painted area; one per photo
interface Projection { id: string; photoId: string; createdAt: ISODateTime; provider: "local-sim" | "remote"; strength: number; blob: Blob }

interface Settings {
  lang: "en" | "hinglish";
  notifications: boolean;
  introSeen: boolean;
  photoHour?: number;           // 0 to 23, the hour the day-one photos were taken, so monthly retakes match the light
  reorder: { snoozedUntil?: ISODate; lastShownAt?: ISODateTime };
}

interface Onboarding {
  step: number;                 // next question, 0 to 8; 9 once the plan is saved
  draft?: Draft;                // answers so far, so setup resumes where it was left
  completedAt?: ISODateTime;    // set when the last question is answered and the plan is saved
  briefingSeenAt?: ISODateTime;
  baselineDoneAt?: ISODateTime;
}

interface Draft {               // every field optional; null means "skipped"
  nickname?: string; ageBand?: AgeBand | null; cityId?: string | null;
  seasonOverride?: "monsoon" | "no-monsoon" | null; products?: ProductId[]; channel?: Channel;
  startDate?: ISODate; worries?: Worry[]; letter?: string;
  morning?: string; evening?: string; notifications?: boolean; pack?: PackScan;
}

interface AppState {
  schemaVersion: 1;
  profile: Profile | null;
  routine: Routine;
  doses: DoseLog[];
  checkins: CheckIn[];
  letter: Letter | null;
  intercepts: Intercept[];
  insightLog: { id: string; on: ISODate }[];   // last 60 entries, used to avoid repeats
  nudgesSent: { mateId: string; on: ISODate }[];
  onboarding: Onboarding;
  settings: Settings;
}

// In the demo namespace AppState also carries: demo: { day: number; persona: "steady" | "worried" | "monsoon-quick-commerce" }
```

## Derived values (never stored, always computed)

| Value | Function | Notes |
|---|---|---|
| Journey day | `journeyDay(startDate, now)` | Day 1 is the start date. Negative or zero means the plan starts in the future. Uses calendar days in local time, so DST and time of day never shift it. |
| Week | `weekOf(day) = ceil(day / 7)` | Day 34 is week 5. Capped display at 24, with "past week 24" after day 168. |
| Phase | `phaseOf(day)` | calm 1 to 14, shed 15 to 56, settling 57 to 84, first-hairs 85 to 126, building 127 to 167, judgement 168 to 175, beyond 176+ |
| Progress to judgement | `min(day, 168) / 168` | Shown as a percent in the ring |
| Season overlap | `seasonFor(startDate, cityId, override)` | Does the shed window (days 15 to 56) overlap the region's monsoon months? |
| Runway | `runway(packs, sku table, now)` | Days of supply left from the newest pack's reg date |
| Streak | `streak(doses, routine, now)` | Consecutive days with every slot done |
| Monthly photo due | `photoDue(photos, day)` | Weeks 4, 8, 12, 16, 20, 24, window opens 2 days before and stays open 5 days after |

`now` always comes from `clock.now()`. In demo mode the clock returns `startDate + demo.day - 1` at the real time of day, so every derived value follows the jumper.

## Versioning and migrations

- The document carries `schemaVersion`. On load: parse JSON, read the version, run `migrations[v]` in order up to the current version, then validate with the current Zod schema.
- Each migration is a pure function `(old: unknown) => unknown` with a unit test that feeds a frozen fixture of the old shape.
- If validation fails, the raw string is copied to `weekfive:backup:<timestamp>` and the user sees "We couldn't read your saved data. A copy is kept on this phone. You can export it from Profile, Data." The app then starts clean. Data is never silently thrown away.
- IndexedDB uses `idb`'s `upgrade` callback with its own version number. Store changes only add stores or indexes; blobs are never rewritten during an upgrade.

## Export and delete

- Export: a JSON file `week-five-export-<date>.json` with the full state plus photos as base64 data URLs. Optional ZIP of raw photos is a stretch goal.
- Import is out of scope for the MVP (noted in DECISIONS).
- Delete everything: clears both localStorage keys, deletes both IndexedDB databases, unregisters nothing (the service worker holds only app code), then sends the user to the intro. Confirmation needs a deliberate second tap.

## What is never stored
Phone numbers, emails, exact addresses, birth dates, order IDs, anything from the URL beyond `sku`, `reg` and `batch`, and anything sent to a server (there is no server).
