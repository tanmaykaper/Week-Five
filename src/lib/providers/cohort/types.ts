import type { ISODate } from "@/lib/time/journey";

/**
 * The journey mates contract (BUILD_DOC F16). A provider supplies people who started near
 * the user and small, warm things that happened to them. Never rankings, scores, results
 * or photos: nothing here can carry them.
 */
export interface Mate {
  id: string;
  firstName: string;
  city: string;
  /** Days between the user's start and theirs: positive means they started later. */
  offset: number;
}

export type MateEventKind = "finished-week" | "took-photo" | "checked-in" | "wrote-letter" | "started" | "cohort-count";

export interface MateEvent {
  id: string;
  /** Null for events about the whole start week. */
  mateId: string | null;
  kind: MateEventKind;
  week?: number;
  count?: number;
  /** The user's journey day it happened on. */
  at: number;
}

export interface CohortProvider {
  id: "local-sim" | "remote";
  /** Drives the "Demo community" label: on whenever the people are simulated. */
  isSimulated: boolean;
  available(): Promise<boolean>;
  cohort(): Promise<Mate[]>;
  events(userDay: number, limit: number): Promise<MateEvent[]>;
  /** Sends a pre-written phrase. The simulated provider only plays a local animation. */
  nudge(mateId: string, message: string): Promise<void>;
}

export interface CohortConfig {
  startDate: ISODate;
}
