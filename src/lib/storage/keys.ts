/** Every storage name the app uses, in one place. See docs/DATA_MODEL.md. */
export type Mode = "real" | "demo";

export const STATE_KEY: Record<Mode, string> = {
  real: "weekfive:v1",
  demo: "weekfive-demo:v1",
};

export const PHOTO_DB: Record<Mode, string> = {
  real: "weekfive",
  demo: "weekfive-demo",
};

/** Which namespace is active. Kept separate so the theme script and the store agree. */
export const MODE_KEY = "weekfive:mode";

/** "system" | "light" | "dark". Shared by both namespaces; read before first paint. */
export const THEME_KEY = "weekfive:theme";

export const backupKey = (at: Date) => `weekfive:backup:${at.toISOString()}`;

/** localStorage can throw (private mode, blocked site data). Every access goes through these. */
export const safeLocal = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing to do */
    }
  },
  keys(): string[] {
    try {
      return Object.keys(window.localStorage);
    } catch {
      return [];
    }
  },
};
