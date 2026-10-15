import type { ISODate } from "@/lib/time/journey";
import { LocalSimCohort } from "./local-sim";
import type { CohortProvider } from "./types";

export type { CohortProvider, Mate, MateEvent, MateEventKind } from "./types";
export { LocalSimCohort, simulatedCohort, simulatedEvents, startWeekOf } from "./local-sim";
export { RemoteCohort } from "./remote";

/** The provider in use. Only the simulated one ships; see remote.ts for why. */
export function cohortProvider(startDate: ISODate): CohortProvider {
  return new LocalSimCohort(startDate);
}
