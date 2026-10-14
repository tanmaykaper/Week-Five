import { appStateSchema, SCHEMA_VERSION, type AppState } from "./schema";

/**
 * migrations[n] turns a version-n document into a version-(n + 1) document.
 * Each one is pure and has a test that feeds it a frozen fixture of the old shape.
 * There are none yet: version 1 is the first shipped shape.
 */
export const migrations: Record<number, (old: Record<string, unknown>) => Record<string, unknown>> = {};

export type LoadResult =
  | { ok: true; state: AppState; migratedFrom?: number }
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "unreadable"; raw: string; detail: string };

/** Parse, migrate up to the current version, then validate. Never throws. */
export function loadState(raw: string | null): LoadResult {
  if (raw == null || raw === "") return { ok: false, reason: "empty" };
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "unreadable", raw, detail: "Not valid JSON" };
  }
  if (typeof doc !== "object" || doc === null) {
    return { ok: false, reason: "unreadable", raw, detail: "Not an object" };
  }

  let current = doc as Record<string, unknown>;
  const startVersion = typeof current.schemaVersion === "number" ? current.schemaVersion : 0;
  if (startVersion > SCHEMA_VERSION) {
    return { ok: false, reason: "unreadable", raw, detail: `Saved by a newer version (${startVersion})` };
  }
  for (let v = startVersion; v < SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (!step) return { ok: false, reason: "unreadable", raw, detail: `No migration from version ${v}` };
    current = { ...step(current), schemaVersion: v + 1 };
  }

  const parsed = appStateSchema.safeParse(current);
  if (!parsed.success) {
    return { ok: false, reason: "unreadable", raw, detail: parsed.error.issues[0]?.message ?? "Invalid shape" };
  }
  return startVersion === SCHEMA_VERSION
    ? { ok: true, state: parsed.data }
    : { ok: true, state: parsed.data, migratedFrom: startVersion };
}
