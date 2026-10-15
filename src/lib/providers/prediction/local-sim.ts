import { hashString } from "@/lib/rng";
import { maskArea, prepareMask, simulateAsync, SIM_STRENGTH } from "./sim-core";
import { PREDICTION_LABEL, type PredictionProvider } from "./types";

/** Working size: plenty for a phone screen, small enough to finish in a blink. */
const MAX_SIDE = 1024;

/** Let the page draw a frame between the heavy steps, so the thinking animation never stalls. */
const breathe = () => new Promise<void>((resolve) => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(() => resolve()) : setTimeout(resolve, 0)));

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas");
  return { c, ctx };
}

async function pixels(blob: Blob, size: number): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  try {
    const { ctx } = canvas(size);
    ctx.imageSmoothingQuality = "high";
    // Photos are kept square; anything else is centred, as the lens shows it.
    const side = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
    return ctx.getImageData(0, 0, size, size);
  } finally {
    bitmap.close();
  }
}

/**
 * The on-device illustration (kickoff 3.6): a canvas pipeline around `simulate`. No upload,
 * no model, no network. Deterministic: the same photo and area always give the same picture.
 */
export const localSimulation: PredictionProvider = {
  id: "local-sim",
  available: async () => typeof document !== "undefined" && typeof createImageBitmap === "function",
  async predict(input, onStage) {
    onStage?.("reading");
    const probe = await createImageBitmap(input.baseline);
    const size = Math.min(MAX_SIDE, probe.width, probe.height);
    probe.close();
    const photo = await pixels(input.baseline, size);
    await breathe();

    onStage?.("marking");
    const painted = await pixels(input.mask, size);
    const alpha = new Uint8ClampedArray(size * size);
    for (let i = 0; i < alpha.length; i++) alpha[i] = painted.data[i * 4 + 3]!;
    const mask = prepareMask(alpha, size);
    if (maskArea(mask) < 0.001) throw new Error("nothing painted");
    await breathe();

    onStage?.("estimating");
    const seed = hashString(`${input.view}:${input.baseline.size}:${input.mask.size}`);
    const { rgba } = await simulateAsync({ rgba: photo.data, mask, size, view: input.view, seed, strength: SIM_STRENGTH });
    await breathe();
    const { c, ctx } = canvas(size);
    ctx.putImageData(new ImageData(rgba, size, size), 0, 0);
    const image = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/jpeg", 0.9));
    if (!image) throw new Error("encode failed");
    return { image, strength: SIM_STRENGTH, label: PREDICTION_LABEL, provider: "local-sim" };
  },
};
