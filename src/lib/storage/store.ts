import { create } from "zustand";
import { buildDemoState, type Persona } from "@/lib/demo/personas";
import { backupKey, INTRO_KEY, MODE_KEY, safeLocal, STATE_KEY, THEME_KEY, type Mode } from "./keys";
import { loadState } from "./migrations";
import { deletePhotoDatabase } from "./photos";
import { emptyState, type AppState } from "./schema";

export type ThemeSetting = "system" | "light" | "dark";

type Status = "loading" | "ready";
type Issue = null | "storage-blocked" | "recovered-from-unreadable";

interface Store {
  status: Status;
  issue: Issue;
  mode: Mode;
  data: AppState;
  theme: ThemeSetting;

  hydrate: () => void;
  /** Apply a change to the active namespace and save it. */
  update: (change: (draft: AppState) => AppState) => void;
  setTheme: (theme: ThemeSetting) => void;
  /** Marks the intro as played for this device (both the plan and the first-paint key). */
  markIntroSeen: () => void;
  enterDemo: (persona?: Persona) => void;
  leaveDemo: () => void;
  setDemoDay: (day: number) => void;
  /** Wipes both namespaces, both photo databases and the preferences. */
  deleteEverything: () => Promise<void>;
}

function storageWorks(): boolean {
  const probe = "weekfive:probe";
  if (!safeLocal.set(probe, "1")) return false;
  safeLocal.remove(probe);
  return true;
}

function readNamespace(mode: Mode): { data: AppState; issue: Issue } {
  const result = loadState(safeLocal.get(STATE_KEY[mode]));
  if (result.ok) {
    if (result.migratedFrom !== undefined) safeLocal.set(STATE_KEY[mode], JSON.stringify(result.state));
    return { data: result.state, issue: null };
  }
  if (result.reason === "unreadable") {
    // Never throw data away silently: keep the raw copy so it can be exported.
    safeLocal.set(backupKey(new Date()), result.raw);
    return { data: emptyState(), issue: "recovered-from-unreadable" };
  }
  return { data: emptyState(), issue: null };
}

function readTheme(): ThemeSetting {
  const t = safeLocal.get(THEME_KEY);
  return t === "system" || t === "dark" ? t : "light";
}

export function resolveTheme(setting: ThemeSetting): "light" | "dark" {
  if (setting !== "system") return setting;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useApp = create<Store>()((set, get) => ({
  status: "loading",
  issue: null,
  mode: "real",
  data: emptyState(),
  theme: "light",

  hydrate: () => {
    if (!storageWorks()) {
      set({ status: "ready", issue: "storage-blocked", mode: "real", data: emptyState(), theme: "light" });
      return;
    }
    const mode: Mode = safeLocal.get(MODE_KEY) === "demo" ? "demo" : "real";
    const read = readNamespace(mode);
    // A demo namespace with nothing in it is rebuilt rather than shown empty.
    const data = mode === "demo" && !read.data.profile ? buildDemoState("steady", new Date()) : read.data;
    const issue = read.issue;
    set({ status: "ready", issue, mode, data, theme: readTheme() });
  },

  update: (change) => {
    const next = change(get().data);
    set({ data: next });
    safeLocal.set(STATE_KEY[get().mode], JSON.stringify(next));
  },

  setTheme: (theme) => {
    safeLocal.set(THEME_KEY, theme);
    document.documentElement.dataset.theme = resolveTheme(theme);
    set({ theme });
  },

  markIntroSeen: () => {
    safeLocal.set(INTRO_KEY, "seen");
    delete document.documentElement.dataset.intro;
    if (!get().data.settings.introSeen) get().update((s) => ({ ...s, settings: { ...s.settings, introSeen: true } }));
  },

  enterDemo: (persona = "steady") => {
    const data = buildDemoState(persona, new Date());
    safeLocal.set(STATE_KEY.demo, JSON.stringify(data));
    safeLocal.set(MODE_KEY, "demo");
    set({ mode: "demo", data, issue: null });
  },

  leaveDemo: () => {
    safeLocal.set(MODE_KEY, "real");
    const { data, issue } = readNamespace("real");
    set({ mode: "real", data, issue });
  },

  setDemoDay: (day) => {
    if (get().mode !== "demo") return;
    get().update((s) => (s.demo ? { ...s, demo: { ...s.demo, day } } : s));
  },

  deleteEverything: async () => {
    for (const key of safeLocal.keys()) if (key.startsWith("weekfive")) safeLocal.remove(key);
    await Promise.all([deletePhotoDatabase("real"), deletePhotoDatabase("demo")]);
    set({ mode: "real", data: emptyState(), issue: null, theme: "light" });
    document.documentElement.dataset.theme = "light";
  },
}));
