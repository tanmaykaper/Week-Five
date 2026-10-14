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

export async function seedFresh(page: Page, theme: "light" | "dark" = "light") {
  await page.addInitScript((t) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.clear();
    localStorage.setItem("weekfive:theme", t);
  }, theme);
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
