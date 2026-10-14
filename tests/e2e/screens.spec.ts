// Phase screenshots: every touched screen at phone, tablet and desktop, light and dark.
// Saved to artifacts/screens/ (git-ignored). Run: pnpm build && pnpm screens
import { expect, test } from "@playwright/test";
import { seedDemo, seedFresh } from "./helpers";

const PHASE = process.env.PHASE ?? "1";
const ROUTES: { slug: string; path: string; demo: boolean; intro?: boolean }[] = [
  { slug: "intro", path: "/start/", demo: false, intro: true },
  { slug: "start-qr", path: "/start/?sku=WF-SOL-60&reg=2026-10-01&batch=B1", demo: false },
  { slug: "onboarding", path: "/onboarding/?sku=WF-SOL-60&reg=2026-10-01", demo: false },
  { slug: "home", path: "/home/", demo: true },
  { slug: "map", path: "/map/", demo: true },
  { slug: "week-5", path: "/map/week/5/", demo: true },
  { slug: "profile", path: "/profile/", demo: true },
  { slug: "data", path: "/profile/data/", demo: true },
  { slug: "about", path: "/about/", demo: true },
  { slug: "not-found", path: "/nowhere/", demo: true },
];

for (const theme of ["light", "dark"] as const) {
  for (const r of ROUTES) {
    test(`${theme} ${r.slug}`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await (r.demo ? seedDemo(page, theme) : seedFresh(page, theme, { introSeen: !r.intro }));
      await page.goto(r.path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `artifacts/screens/phase-${PHASE}/${info.project.name}/${theme}-${r.slug}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}
