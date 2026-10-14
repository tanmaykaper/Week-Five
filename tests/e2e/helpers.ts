import type { Page } from "@playwright/test";

/** Start in demo mode with the sample person on day 35, before any app code runs. */
export async function seedDemo(page: Page, theme: "light" | "dark" = "light") {
  await page.addInitScript((t) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.clear();
    localStorage.setItem("weekfive:mode", "demo");
    localStorage.setItem("weekfive:theme", t);
  }, theme);
}

/** A first visit. Pass introSeen to skip the intro for tests about what comes after it. */
export async function seedFresh(page: Page, theme: "light" | "dark" = "light", opts: { introSeen?: boolean } = {}) {
  await page.addInitScript(
    ({ t, seen }) => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.clear();
      localStorage.setItem("weekfive:theme", t);
      if (seen) localStorage.setItem("weekfive:intro", "seen");
    },
    { t: theme, seen: Boolean(opts.introSeen) },
  );
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/** A finished setup (plan saved, briefing read), started `daysAgo` days before today, no photos yet. */
export async function seedPlan(page: Page, opts: { daysAgo?: number; worries?: string[] } = {}) {
  await page.addInitScript(
    ({ daysAgo, worries }) => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.clear();
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const now = new Date().toISOString();
      localStorage.setItem("weekfive:intro", "seen");
      localStorage.setItem(
        "weekfive:v1",
        JSON.stringify({
          schemaVersion: 1,
          profile: {
            nickname: "Kabir",
            ageBand: "25-34",
            cityId: "pune",
            products: ["solution"],
            packs: [],
            channel: "quick-commerce",
            startDate: start,
            worries,
            seasonOverride: null,
            createdAt: now,
          },
          routine: { morning: "08:00", evening: "21:30", rollerNights: [] },
          doses: [],
          checkins: [],
          letter: null,
          intercepts: [],
          insightLog: [],
          nudgesSent: [],
          onboarding: { step: 9, completedAt: now, briefingSeenAt: now },
          settings: { lang: "en", notifications: false, introSeen: true, reorder: {} },
        }),
      );
    },
    { daysAgo: opts.daysAgo ?? 3, worries: opts.worries ?? ["crown"] },
  );
}

/** What the photo database holds, as [view, week, width] rows, plus the number of masks. */
export async function storedPhotos(page: Page, db = "weekfive") {
  return page.evaluate(
    (name) =>
      new Promise<{ photos: [string, number, number][]; masks: number }>((resolve, reject) => {
        const req = indexedDB.open(name);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const tx = req.result.transaction(["photos", "masks"]);
          const photos = tx.objectStore("photos").getAll();
          const masks = tx.objectStore("masks").count();
          tx.oncomplete = () => {
            const rows = (photos.result as { view: string; week: number; width: number }[]).map((p) => [p.view, p.week, p.width] as [string, number, number]);
            rows.sort((a, b) => a[0].localeCompare(b[0]));
            req.result.close();
            resolve({ photos: rows, masks: masks.result });
          };
        };
      }),
    db,
  );
}
