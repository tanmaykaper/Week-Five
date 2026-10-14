// @vitest-environment happy-dom
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { buildDemoState, PERSONAS, type Persona } from "@/lib/demo/personas";
import { MODE_KEY, PHOTO_DB, STATE_KEY } from "@/lib/storage/keys";
import { loadState, migrations } from "@/lib/storage/migrations";
import { deletePhoto, getPhoto, listPhotos, putMask, putPhoto, getMask } from "@/lib/storage/photos";
import { appStateSchema, emptyState, SCHEMA_VERSION } from "@/lib/storage/schema";
import { useApp } from "@/lib/storage/store";
import { journeyDay } from "@/lib/time/journey";
import { effectiveNow } from "@/lib/time/clock";

describe("loadState", () => {
  it("treats nothing saved as empty, not as an error", () => {
    expect(loadState(null)).toEqual({ ok: false, reason: "empty" });
    expect(loadState("")).toEqual({ ok: false, reason: "empty" });
  });

  it("round-trips the empty state", () => {
    const result = loadState(JSON.stringify(emptyState()));
    expect(result.ok).toBe(true);
  });

  it("reports broken JSON as unreadable and keeps the raw text", () => {
    const result = loadState("{not json");
    expect(result).toMatchObject({ ok: false, reason: "unreadable", raw: "{not json" });
  });

  it("rejects a document that fails validation", () => {
    const bad = { ...emptyState(), routine: { morning: "8am", evening: "21:30", rollerNights: [] } };
    expect(loadState(JSON.stringify(bad))).toMatchObject({ ok: false, reason: "unreadable" });
  });

  it("refuses data written by a newer version instead of guessing", () => {
    const future = { ...emptyState(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(loadState(JSON.stringify(future))).toMatchObject({ ok: false, reason: "unreadable" });
  });

  it("has a migration for every version below the current one", () => {
    // Version 0 is "no version field"; there is no shipped version 0 yet, so v1 needs no migrations.
    for (let v = 1; v < SCHEMA_VERSION; v++) expect(migrations[v]).toBeTypeOf("function");
  });
});

describe("demo personas", () => {
  const today = new Date(2026, 9, 14, 21, 30);
  for (const persona of Object.keys(PERSONAS) as Persona[]) {
    it(`builds a valid ${persona} state that lands on day 35 today`, () => {
      const state = buildDemoState(persona, today);
      expect(appStateSchema.safeParse(state).success).toBe(true);
      expect(state.demo?.day).toBe(35);
      const now = effectiveNow(today, { startDate: state.profile!.startDate, day: 35 });
      expect(journeyDay(state.profile!.startDate, now)).toBe(35);
      expect(now.getDate()).toBe(14);
      expect(state.checkins).toHaveLength(24);
    });
  }
  it("contains no dash characters in its copy", () => {
    const text = JSON.stringify(buildDemoState("steady", today));
    expect(text).not.toMatch(/[\u2013\u2014]/);
  });
});

describe("store namespaces", () => {
  beforeEach(() => {
    localStorage.clear();
    useApp.setState({ status: "loading", mode: "real", data: emptyState(), issue: null });
  });

  it("hydrates an empty real namespace", () => {
    useApp.getState().hydrate();
    expect(useApp.getState()).toMatchObject({ status: "ready", mode: "real", issue: null });
    expect(useApp.getState().data.profile).toBeNull();
  });

  it("never writes demo data into the real namespace", () => {
    useApp.getState().hydrate();
    useApp.getState().update((s) => ({ ...s, settings: { ...s.settings, introSeen: true } }));
    const realBefore = localStorage.getItem(STATE_KEY.real);

    useApp.getState().enterDemo("worried");
    useApp.getState().setDemoDay(80);
    useApp.getState().update((s) => ({ ...s, letter: null }));

    expect(localStorage.getItem(STATE_KEY.real)).toBe(realBefore);
    expect(localStorage.getItem(MODE_KEY)).toBe("demo");
    expect(JSON.parse(localStorage.getItem(STATE_KEY.demo)!).demo.day).toBe(80);

    useApp.getState().leaveDemo();
    expect(useApp.getState().mode).toBe("real");
    expect(useApp.getState().data.settings.introSeen).toBe(true);
  });

  it("stays in demo mode across a reload", () => {
    useApp.getState().hydrate();
    useApp.getState().enterDemo("steady");
    useApp.setState({ status: "loading", mode: "real", data: emptyState() });
    useApp.getState().hydrate();
    expect(useApp.getState().mode).toBe("demo");
    expect(useApp.getState().data.profile?.nickname).toBe("Arjun");
  });

  it("backs up unreadable data instead of deleting it", () => {
    localStorage.setItem(STATE_KEY.real, "{broken");
    useApp.getState().hydrate();
    expect(useApp.getState().issue).toBe("recovered-from-unreadable");
    const backups = Object.keys(localStorage).filter((k) => k.startsWith("weekfive:backup:"));
    expect(backups).toHaveLength(1);
    expect(localStorage.getItem(backups[0]!)).toBe("{broken");
  });
});

describe("photo database", () => {
  const photo = (id: string, week: number) => ({
    id,
    view: "crown" as const,
    week,
    takenAt: new Date(2026, 8, 10 + week).toISOString(),
    blob: new Blob(["x".repeat(100)], { type: "image/jpeg" }),
    width: 1200,
    height: 1600,
    luminance: 128,
  });

  it("stores, lists in week order and deletes photos with their masks", async () => {
    await putPhoto("real", photo("b", 4));
    await putPhoto("real", photo("a", 0));
    await putMask("real", { photoId: "a", blob: new Blob(["m"]) });
    expect((await listPhotos("real")).map((p) => p.id)).toEqual(["a", "b"]);
    expect(await getPhoto("real", "a")).toBeDefined();

    await deletePhoto("real", "a");
    expect(await getPhoto("real", "a")).toBeUndefined();
    expect(await getMask("real", "a")).toBeUndefined();
  });

  it("keeps demo photos in their own database", async () => {
    await putPhoto("demo", photo("d", 0));
    expect((await listPhotos("real")).map((p) => p.id)).not.toContain("d");
    expect(PHOTO_DB.demo).not.toBe(PHOTO_DB.real);
  });
});
