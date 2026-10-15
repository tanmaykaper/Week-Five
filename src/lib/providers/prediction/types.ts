import type { View } from "@/lib/storage/photos";

/**
 * Where the week-24 illustration comes from (BUILD_DOC section 10). The app ships with one
 * provider switched on, the on-device simulation. A server model is described, not built:
 * it would mean sending a photo off the phone, which the app promises never to do.
 */

export type PredictionStage = "reading" | "marking" | "estimating";

export interface PredictionInput {
  /** The day-one photo: a square JPEG. */
  baseline: Blob;
  /** The painted area: a 512 px PNG whose alpha is the area. */
  mask: Blob;
  view: View;
  /** The person's journey day. The illustration is always of week 24; a server model could use it. */
  day: number;
}

export interface PredictionResult {
  image: Blob;
  /** 0 to 1. The local simulation always uses the same small strength. */
  strength: number;
  /** Shown with the picture, always. */
  label: string;
  provider: "local-sim" | "remote";
}

export interface PredictionProvider {
  id: "local-sim" | "remote";
  available(): Promise<boolean>;
  predict(input: PredictionInput, onStage?: (stage: PredictionStage) => void): Promise<PredictionResult>;
}

/** The words that always travel with the picture. Source: docs/CONTENT_BANK.md. */
export const PREDICTION_LABEL = "An illustration of a typical outcome, not a promise. Results vary.";
