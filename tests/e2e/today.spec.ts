import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow, seedDemo, seedPlan } from "./helpers";

const openCheckin = (page: Page) => page.getByRole("button", { name: "Check in: how is your scalp today?" }).click();
const sheet = (page: Page) => page.getByRole("dialog");

test("demo, day 35: the shed window is reframed with the day-one photo and the map", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/home/");
  await expect(page.locator("#td-greeting")).toContainText("Week 5, the part everyone finds hardest.");
  await expect(page.getByRole("img", { name: /^Day 35 of 168\. 21 percent of the way to week 24/ })).toBeVisible();
  await expect(page.getByText(/^This is the shed window\. If more hair is coming out right now/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare with day one" }).first()).toBeVisible();
  // Sample drawings stand in for photos, and say so.
  await expect(page.getByRole("img", { name: /^Day 1, / })).toBeVisible();
  await expect(page.getByText("Sample drawings for the demo, not photos of anyone.")).toBeVisible();
  await expect(page.getByText("Demo community")).toBeVisible();
  await expect(page.getByText(/^\d+ people in your start week are on week 5 today\.$/)).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("a fresh plan asks for day-one photos, and doses are one tap", async ({ page }) => {
  await seedPlan(page, { daysAgo: 2 });
  await page.goto("/home/");
  await expect(page.getByText(/^You haven.t taken your day-one photos yet\./)).toBeVisible();
  await expect(page.getByRole("link", { name: "Take day-one photos" })).toHaveAttribute("href", /\/baseline\/?$/);
  await expect(page.getByText("No photos yet. Two minutes, and future you will thank you.")).toBeVisible();

  const morning = page.getByRole("button", { name: /^Morning, 08:00:/ });
  await expect(morning).toHaveAttribute("aria-pressed", "false");
  await morning.click();
  await expect(morning).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: /^Morning, 08:00:/ })).toHaveAttribute("aria-pressed", "true");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive:v1")!).doses);
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ slot: "am", done: true });
});

test("the check-in sheet saves, answers, and Today listens", async ({ page }) => {
  await seedPlan(page, { daysAgo: 24 });
  await page.goto("/home/");
  await openCheckin(page);
  await expect(sheet(page)).toBeVisible();
  const save = page.getByRole("button", { name: "Save check-in" });
  await expect(save).toBeDisabled();
  await page.getByRole("radio", { name: "Handfuls" }).check();
  await page.getByRole("radio", { name: "A lot" }).check();
  await page.getByRole("button", { name: "One more" }).click();
  await save.click();
  await expect(sheet(page).getByText("Check-in saved.")).toBeVisible();
  await expect(sheet(page).getByText(/This is the part that feels worst and is the most expected\./)).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(sheet(page)).toBeHidden();
  // High worry late at night gets the calm night card instead; both answer the check-in.
  await expect(page.locator("#main").getByText(/^(This is the shed window\. If more hair is coming out right now|It.s late, and hair always looks worse at this hour)/)).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive:v1")!).checkins);
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ day: 25, shed: 4, worry: 3, missedDoses: 1, redFlags: [] });
});

test("a red flag gets a doctor, not a pep talk, and Escape closes the sheet", async ({ page }) => {
  await seedPlan(page, { daysAgo: 10 });
  await page.goto("/home/");
  await openCheckin(page);
  await page.getByRole("radio", { name: "A few" }).check();
  await page.getByRole("radio", { name: "Calm" }).check();
  await page.getByRole("checkbox", { name: "Burning" }).check();
  await page.getByRole("button", { name: "Save check-in" }).click();
  await expect(page.getByRole("heading", { name: "Please see a doctor." })).toBeVisible();
  await expect(sheet(page).getByText(/Please speak to a doctor before your next application/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet(page)).toBeHidden();
  await expect(page.locator("#main").getByText(/^You mentioned pain, burning or a rash\./)).toBeVisible();
});

test("reassurance first: no reorder prompt for a day after an uneasy check-in", async ({ page }) => {
  await seedPlan(page, { daysAgo: 26, packDaysAgo: 25 });
  await page.goto("/home/");
  await expect(page.getByText("About 5 days left.")).toBeVisible();
  const reorder = page.getByRole("link", { name: "Reorder on Man Matters" });
  await expect(reorder).toHaveAttribute("target", "_blank");
  await expect(reorder).toHaveAttribute("rel", "noopener noreferrer");

  await openCheckin(page);
  await page.getByRole("radio", { name: "More than usual" }).check();
  await page.getByRole("radio", { name: "Some" }).check();
  await page.getByRole("button", { name: "Save check-in" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByRole("link", { name: "Reorder on Man Matters" })).toHaveCount(0);
  await expect(page.getByText("About 5 days left.")).toBeVisible();
});

test("the check-in also works as its own page", async ({ page }) => {
  await seedPlan(page, { daysAgo: 70 });
  await page.goto("/checkin/");
  await page.getByRole("radio", { name: "Barely any" }).check();
  await page.getByRole("radio", { name: "Calm" }).check();
  await page.getByRole("button", { name: "Save check-in" }).click();
  await expect(page.getByText(/^Settling down\. That.s the direction you want\.$/)).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page).toHaveURL(/\/home\/?$/);
});

test("dark Today has no errors and no sideways scroll", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seedDemo(page, "dark");
  await page.goto("/home/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#td-greeting")).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});
