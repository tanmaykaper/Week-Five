import { expect, test } from "@playwright/test";
import { horizontalOverflow, seedDemo, seedFresh } from "./helpers";

test.describe("first visit", () => {
  test("goes to the intro, then to the welcome screen", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/intro\/$/);
    await expect(page.getByRole("heading", { name: "Before you start, six things worth knowing." })).toBeVisible();
    await page.getByRole("button", { name: "Let's set up your plan" }).click();
    await expect(page).toHaveURL(/\/start\/$/);
    await expect(page.getByText("Your details and photos stay on this phone.")).toBeVisible();
  });

  test("reads the pack QR and ignores everything else", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/start/?sku=WF-SOL-60&reg=2026-10-01&batch=B1&name=Someone");
    await expect(page.getByRole("heading", { name: /^Welcome\. Let.s set up your plan\.$/ })).toBeVisible();
    await expect(page.getByText("Regrowth solution, 60 ml")).toBeVisible();
    const stored = await page.evaluate(() => JSON.stringify(localStorage));
    expect(stored).not.toContain("Someone");
  });
});

test.describe("demo mode", () => {
  test("shows day 35 with the jumper, and never touches real data", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/home/");
    await expect(page.getByText("Day 35 of 168. Week 5, the part everyone finds hardest.")).toBeVisible();

    await page.getByRole("button", { name: /Demo, day 35/ }).click();
    await page.getByRole("button", { name: "110", exact: true }).click();
    await expect(page.getByText(/Day 110 of 168\. Week 16/)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("weekfive:v1"))).toBeNull();
  });

  test("leaving demo returns to an empty real plan", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/profile/");
    await page.getByRole("switch", { name: "Try it with sample data" }).click();
    await expect(page).toHaveURL(/\/(intro|start)\/$/);
  });
});

test("theme choice persists across reloads", async ({ page }) => {
  await seedDemo(page, "light");
  await page.goto("/profile/");
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("no page scrolls sideways", async ({ page }) => {
  await seedDemo(page);
  for (const path of ["/home/", "/map/", "/map/week/5/", "/profile/", "/profile/data/", "/about/", "/start/"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
  }
});

test("export hands over a JSON file", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/profile/data/");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export a copy" }).click();
  expect((await download).suggestedFilename()).toMatch(/^week-five-export-\d{4}-\d{2}-\d{2}\.json$/);
});
