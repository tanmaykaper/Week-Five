import type { PredictionProvider } from "./types";

/**
 * A server-side image model, for a future where someone builds one properly. It is off, and
 * stays off in this build: using it would send a photo off the phone, which breaks the
 * promise on the first screen. This file only records the contract such a server would keep.
 *
 * Request: POST /v1/projections, multipart/form-data
 *   baseline  image/jpeg, square, at most 1600 px, EXIF already stripped on the device
 *   mask      image/png, 512 px, alpha is the painted area
 *   view      "crown" | "hairline" | "parting"
 *   day       the journey day, an integer
 * Conditions: a separate, explicit consent for each request; the server keeps neither image
 * and logs neither; the model returns one typical case at a modest, fixed strength.
 * Response 200: image/jpeg at the baseline's size, with headers X-Strength (0 to 1) and X-Model.
 * Any other response: the app falls back to the on-device illustration and says so.
 */
export const remoteModel: PredictionProvider = {
  id: "remote",
  available: async () => false,
  predict: async () => {
    throw new Error("The remote model is not part of this build.");
  },
};
