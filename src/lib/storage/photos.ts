import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { PHOTO_DB, type Mode } from "./keys";

export type View = "crown" | "hairline" | "parting";

export interface PhotoRecord {
  id: string;
  view: View;
  /** 0 for the baseline, then 4, 8, 12, 16, 20, 24, or any week for extra shots. */
  week: number;
  takenAt: string;
  blob: Blob;
  width: number;
  height: number;
  /** Mean luminance 0 to 255 at capture, used to warn when two photos had different light. */
  luminance: number;
}

export interface MaskRecord {
  photoId: string;
  blob: Blob;
}

export interface ProjectionRecord {
  id: string;
  photoId: string;
  createdAt: string;
  provider: "local-sim" | "remote";
  strength: number;
  blob: Blob;
}

interface PhotoDB extends DBSchema {
  photos: { key: string; value: PhotoRecord; indexes: { byWeek: number; byView: View } };
  masks: { key: string; value: MaskRecord };
  projections: { key: string; value: ProjectionRecord; indexes: { byPhoto: string } };
}

const DB_VERSION = 1;
const cache = new Map<Mode, Promise<IDBPDatabase<PhotoDB>>>();

export function photoDb(mode: Mode): Promise<IDBPDatabase<PhotoDB>> {
  let db = cache.get(mode);
  if (!db) {
    db = openDB<PhotoDB>(PHOTO_DB[mode], DB_VERSION, {
      upgrade(database, oldVersion) {
        // Upgrades only ever add stores or indexes. Blobs are never rewritten.
        if (oldVersion < 1) {
          const photos = database.createObjectStore("photos", { keyPath: "id" });
          photos.createIndex("byWeek", "week");
          photos.createIndex("byView", "view");
          database.createObjectStore("masks", { keyPath: "photoId" });
          const projections = database.createObjectStore("projections", { keyPath: "id" });
          projections.createIndex("byPhoto", "photoId");
        }
      },
    });
    cache.set(mode, db);
  }
  return db;
}

export async function putPhoto(mode: Mode, photo: PhotoRecord): Promise<void> {
  await (await photoDb(mode)).put("photos", photo);
}

export async function getPhoto(mode: Mode, id: string): Promise<PhotoRecord | undefined> {
  return (await photoDb(mode)).get("photos", id);
}

export async function listPhotos(mode: Mode): Promise<PhotoRecord[]> {
  const all = await (await photoDb(mode)).getAll("photos");
  return all.sort((a, b) => a.week - b.week || a.takenAt.localeCompare(b.takenAt));
}

export async function deletePhoto(mode: Mode, id: string): Promise<void> {
  const db = await photoDb(mode);
  const tx = db.transaction(["photos", "masks", "projections"], "readwrite");
  await tx.objectStore("photos").delete(id);
  await tx.objectStore("masks").delete(id);
  const projections = await tx.objectStore("projections").index("byPhoto").getAllKeys(id);
  await Promise.all(projections.map((key) => tx.objectStore("projections").delete(key)));
  await tx.done;
}

export async function putMask(mode: Mode, mask: MaskRecord): Promise<void> {
  await (await photoDb(mode)).put("masks", mask);
}

export async function getMask(mode: Mode, photoId: string): Promise<MaskRecord | undefined> {
  return (await photoDb(mode)).get("masks", photoId);
}

export async function deletePhotoDatabase(mode: Mode): Promise<void> {
  const open = cache.get(mode);
  if (open) {
    (await open).close();
    cache.delete(mode);
  }
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(PHOTO_DB[mode]);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}

/** Rough bytes used by photos in a namespace, for the data screen. */
export async function photoBytes(mode: Mode): Promise<number> {
  const photos = await listPhotos(mode);
  return photos.reduce((sum, p) => sum + p.blob.size, 0);
}
