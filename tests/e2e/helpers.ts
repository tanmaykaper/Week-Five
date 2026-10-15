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
export async function seedPlan(page: Page, opts: { daysAgo?: number; worries?: string[]; packDaysAgo?: number } = {}) {
  await page.addInitScript(
    ({ daysAgo, worries, packDaysAgo }) => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.clear();
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
      const start = iso(d);
      const now = new Date().toISOString();
      const bought = new Date();
      bought.setDate(bought.getDate() - (packDaysAgo ?? 0));
      const packs = packDaysAgo === undefined ? [] : [{ sku: "WF-SOL-60", reg: iso(bought), scannedAt: now }];
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
            packs,
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
    { daysAgo: opts.daysAgo ?? 3, worries: opts.worries ?? ["crown"], packDaysAgo: opts.packDaysAgo },
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

/** How many week-24 illustrations the photo database holds. */
export async function storedProjections(page: Page, db = "weekfive") {
  return page.evaluate(
    (name) =>
      new Promise<number>((resolve, reject) => {
        const req = indexedDB.open(name);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const tx = req.result.transaction("projections");
          const count = tx.objectStore("projections").count();
          tx.oncomplete = () => {
            req.result.close();
            resolve(count.result);
          };
        };
      }),
    db,
  );
}

/**
 * Puts a drawn day-one photo straight into the photo database (skin with dark hairs, a thin
 * patch in the middle), as the camera flow would have saved it. Run on a page of the app.
 */
export async function putDrawnPhoto(page: Page, view: "crown" | "hairline" | "parting", week = 0, db = "weekfive") {
  await page.evaluate(
    async ({ view, week, name }) => {
      const c = document.createElement("canvas");
      c.width = c.height = 400;
      const g = c.getContext("2d")!;
      g.fillStyle = "rgb(206, 164, 136)";
      g.fillRect(0, 0, 400, 400);
      g.strokeStyle = "rgb(38, 30, 26)";
      for (let i = 0; i < 3000; i++) {
        const x = (i * 97) % 400;
        const y = (i * 53) % 400;
        if (Math.hypot(x - 200, y - 200) < 80 && i % 5) continue;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 4, y - 12);
        g.stroke();
      }
      const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.9));
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(name, 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          const photos = d.createObjectStore("photos", { keyPath: "id" });
          photos.createIndex("byWeek", "week");
          photos.createIndex("byView", "view");
          d.createObjectStore("masks", { keyPath: "photoId" });
          d.createObjectStore("projections", { keyPath: "id" }).createIndex("byPhoto", "photoId");
        };
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const tx = req.result.transaction("photos", "readwrite");
          const taken = new Date();
          taken.setMinutes(taken.getMinutes() - 5);
          tx.objectStore("photos").put({ id: `test-${view}-${week}`, view, week, takenAt: taken.toISOString(), blob, width: 400, height: 400, luminance: 140 });
          tx.oncomplete = () => {
            req.result.close();
            resolve();
          };
        };
      });
    },
    { view, week, name: db },
  );
}

/** Opens the demo controls, picks a sample person (optional) and a day, and closes them. */
export async function demoDay(page: Page, day: number, persona?: RegExp) {
  await page.getByRole("button", { name: /^Demo, day/ }).click();
  if (persona) await page.getByRole("radio", { name: persona }).check();
  const pick = page.getByRole("group", { name: "Quick picks" }).getByRole("button", { name: String(day), exact: true });
  if (await pick.count()) await pick.click();
  else await page.getByRole("slider", { name: "Journey day" }).fill(String(day));
  await page.keyboard.press("Escape");
}
