// @vitest-environment happy-dom
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { baselinePhotos, deleteMask, deletePhotoDatabase, getMask, keepPhoto, listPhotos, putMask, type PhotoRecord } from "@/lib/storage/photos";

const photo = (id: string, view: PhotoRecord["view"], week = 0, takenAt = "2026-10-14T09:00:00.000Z"): PhotoRecord => ({
  id,
  view,
  week,
  takenAt,
  blob: new Blob([id], { type: "image/jpeg" }),
  width: 800,
  height: 800,
  luminance: 120,
});

describe("day-one photos", () => {
  beforeEach(async () => {
    await deletePhotoDatabase("real");
    await deletePhotoDatabase("demo");
  });

  it("keeps one baseline per view: a retake replaces the old photo and its mask", async () => {
    await keepPhoto("real", photo("a", "crown"));
    await putMask("real", { photoId: "a", blob: new Blob(["m"]) });
    await keepPhoto("real", photo("b", "crown", 0, "2026-10-14T10:00:00.000Z"));
    const all = await listPhotos("real");
    expect(all.map((p) => p.id)).toEqual(["b"]);
    expect(await getMask("real", "a")).toBeUndefined();
  });

  it("leaves other views and later weeks alone", async () => {
    await keepPhoto("real", photo("c", "crown"));
    await keepPhoto("real", photo("h", "hairline"));
    await keepPhoto("real", photo("c4", "crown", 4));
    const base = await baselinePhotos("real");
    expect(Object.keys(base).sort()).toEqual(["crown", "hairline"]);
    expect(base.crown?.id).toBe("c");
    expect((await listPhotos("real")).length).toBe(3);
  });

  it("deletes a mask on its own", async () => {
    await keepPhoto("real", photo("p", "parting"));
    await putMask("real", { photoId: "p", blob: new Blob(["m"]) });
    await deleteMask("real", "p");
    expect(await getMask("real", "p")).toBeUndefined();
    expect((await listPhotos("real")).length).toBe(1);
  });

  it("keeps the demo's photos apart from the real ones", async () => {
    await keepPhoto("demo", photo("d", "crown"));
    expect(await baselinePhotos("real")).toEqual({});
    expect((await baselinePhotos("demo")).crown?.id).toBe("d");
  });
});
