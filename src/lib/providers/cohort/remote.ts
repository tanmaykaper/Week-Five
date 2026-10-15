import type { CohortProvider } from "./types";

/**
 * RemoteCohort: the shape of a real community backend, shipped switched off. A real one would
 * need explicit opt-in, nicknames only, a city but never an address, no photos and no results,
 * and a way to leave that deletes everything. It would also break "nothing leaves this phone",
 * which is why the app ships without it.
 *
 *   GET  /cohort?start=yyyy-mm-dd           -> Mate[] (opted-in people within 14 days)
 *   GET  /cohort/events?day=n&limit=n       -> MateEvent[]
 *   POST /cohort/nudge { mateId, phraseId } -> 204 (phrases come from a fixed list)
 */
export class RemoteCohort implements CohortProvider {
  readonly id = "remote" as const;
  readonly isSimulated = false;

  async available() {
    return false;
  }

  async cohort(): Promise<never> {
    throw new Error("The remote cohort is not available in this build.");
  }

  async events(): Promise<never> {
    throw new Error("The remote cohort is not available in this build.");
  }

  async nudge(): Promise<never> {
    throw new Error("The remote cohort is not available in this build.");
  }
}
