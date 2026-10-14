import { toISODate } from "@/lib/time/journey";
import type { Mode } from "./keys";
import { listPhotos } from "./photos";
import type { AppState } from "./schema";

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Everything on this device in one JSON file: the plan, check-ins and every photo. */
export async function buildExport(mode: Mode, state: AppState): Promise<Blob> {
  const photos = await listPhotos(mode);
  const payload = {
    app: "Week Five",
    exportedAt: new Date().toISOString(),
    mode,
    state,
    photos: await Promise.all(
      photos.map(async ({ blob, ...meta }) => ({ ...meta, dataUrl: await blobToDataUrl(blob) })),
    ),
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export function exportFileName(now = new Date()) {
  return `week-five-export-${toISODate(now)}.json`;
}

/** Hands the user a file to save, without any network. */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
