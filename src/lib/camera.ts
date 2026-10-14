/**
 * Photo capture helpers. The maths is pure and unit tested; the canvas parts run only
 * in the browser. Every photo is re-encoded through a canvas, which drops EXIF (and with
 * it any location) and keeps the longest side at 1600 px.
 */

export const MAX_SIDE = 1600;
export const LIGHT_DARK = 70;
export const LIGHT_BRIGHT = 190;

export type LightStatus = "dark" | "good" | "bright";

/** Mean luminance 0 to 255 under 70 is too dark, over 190 too bright (BUILD_DOC F5). */
export function lightStatus(luminance: number): LightStatus {
  if (luminance < LIGHT_DARK) return "dark";
  if (luminance > LIGHT_BRIGHT) return "bright";
  return "good";
}

/** Mean Rec. 709 luma of RGBA pixels, 0 to 255. Transparent pixels are skipped. */
export function meanLuminance(rgba: ArrayLike<number>): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3]! === 0) continue;
    sum += 0.2126 * rgba[i]! + 0.7152 * rgba[i + 1]! + 0.0722 * rgba[i + 2]!;
    n++;
  }
  return n ? sum / n : 0;
}

/** The centred square of a w by h frame: what the round lens shows and what we keep. */
export function centreSquare(w: number, h: number): { sx: number; sy: number; side: number } {
  const side = Math.min(w, h);
  return { sx: Math.round((w - side) / 2), sy: Math.round((h - side) / 2), side };
}

/** Output edge for a square crop: never upscaled, never above MAX_SIDE. */
export function outputSide(side: number): number {
  return Math.max(1, Math.min(MAX_SIDE, Math.round(side)));
}

/** Where 0 to 255 sits on the meter, 0 to 1. */
export const meterPosition = (luminance: number) => Math.min(1, Math.max(0, luminance / 255));

export interface Still {
  blob: Blob;
  width: number;
  height: number;
  luminance: number;
}

type Source = CanvasImageSource & { width?: number; height?: number };

function sourceSize(src: Source): { w: number; h: number } {
  if (typeof HTMLVideoElement !== "undefined" && src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight };
  if (typeof HTMLImageElement !== "undefined" && src instanceof HTMLImageElement) return { w: src.naturalWidth, h: src.naturalHeight };
  return { w: Number(src.width ?? 0), h: Number(src.height ?? 0) };
}

/** Reads the light in a frame from a 64 by 48 copy, as the meter does every 250 ms. */
export function sampleLuminance(src: Source, scratch?: HTMLCanvasElement): number {
  const { w, h } = sourceSize(src);
  if (!w || !h) return 0;
  const c = scratch ?? document.createElement("canvas");
  c.width = 64;
  c.height = 48;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  const { sx, sy, side } = centreSquare(w, h);
  // The middle of the square is what matters; edges are often the room.
  ctx.drawImage(src, sx + side * 0.1, sy + side * 0.1, side * 0.8, side * 0.8, 0, 0, 64, 48);
  return meanLuminance(ctx.getImageData(0, 0, 64, 48).data);
}

/** Crops the centred square, scales it to at most 1600 px and encodes a JPEG. */
export async function encodeStill(src: Source): Promise<Still> {
  const { w, h } = sourceSize(src);
  if (!w || !h) throw new Error("empty frame");
  const { sx, sy, side } = centreSquare(w, h);
  const out = outputSide(side);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, sx, sy, side, side, 0, 0, out, out);
  const luminance = sampleLuminance(canvas);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("encode failed");
  return { blob, width: out, height: out, luminance: Math.round(luminance) };
}

/** A photo picked from the gallery: decoded upright (EXIF orientation applied), then treated like a camera frame. */
export async function stillFromFile(file: File): Promise<Still> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      try {
        return await encodeStill(bitmap);
      } finally {
        bitmap.close();
      }
    } catch {
      /* fall through to an <img>, which some browsers decode more formats with */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return await encodeStill(img);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** A short, unique enough id without crypto.randomUUID, which needs a secure origin. */
export const photoId = (view: string, week: number) =>
  `p-${view}-w${week}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
