import { localSimulation } from "./local-sim";
import { remoteModel } from "./remote";
import type { PredictionProvider } from "./types";

export type { PredictionInput, PredictionProvider, PredictionResult, PredictionStage } from "./types";
export { PREDICTION_LABEL } from "./types";

/** In order of preference. The remote model never reports itself available in this build. */
const PROVIDERS: PredictionProvider[] = [localSimulation, remoteModel];

/** The provider to use on this device, or null if none can run here. */
export async function predictionProvider(): Promise<PredictionProvider | null> {
  for (const p of PROVIDERS) if (await p.available()) return p;
  return null;
}
