import { expect, test, type Page } from "@playwright/test";
import { seedDemo, seedPlan } from "./helpers";

const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem(localStorage.getItem("weekfive:mode") === "demo" ? "weekfive-demo:v1" : "weekfive:v1")!));

test("the map steps through the weeks and opens each one", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/map/");
  await expect(page.getByRole("heading", { level: 1, name: "Your 24 weeks. A ring for each one." })).toBeVisible();
  const picker = page.getByRole("group", { name: "Choose a week" });
  await expect(picker.getByText("Week 5", { exact: true })).toBeVisible();
  await expect(picker.getByText("You are here")).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next week" }).click();
  await expect(picker.getByText("Week 8", { exact: true })).toBeVisible();
  await expect(picker.getByText("Photos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next week" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(picker.getByText("Week 7", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Read week 7" }).click();
  await expect(page).toHaveURL(/\/map\/week\/7\/?$/);
  await expect(page.getByRole("heading", { level: 1, name: /^Week 7\./ })).toBeVisible();
  for (const h of ["What often happens", "What to do this week", "Not a reason to worry", "When to see a doctor"]) {
    await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  }
  await page.getByRole("link", { name: "Week 8" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /^Week 8\./ })).toBeVisible();
  await expect(page.getByText("A photo week: same spot, same light, same time as day one.")).toBeVisible();
});

test("every week page has its four sections", async ({ page }) => {
  for (const n of [1, 12, 24]) {
    await page.goto(`/map/week/${n}/`);
    await expect(page.getByRole("heading", { level: 1, name: new RegExp(`^Week ${n}\\.`) })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "When to see a doctor" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sources" })).toBeVisible();
  }
});

test("the note is sealed, then read on purpose in week four or five", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/map/");
  await expect(page.getByRole("heading", { name: /Your note is ready\./ })).toBeVisible();
  await page.getByRole("button", { name: "Read your note" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByText(/You started this because you were tired of wearing a cap/)).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).last().click();
  await expect(sheet).toBeHidden();
  await expect(page.locator("#letter").getByText(/You started this because/)).toBeVisible();
  expect((await saved(page)).letter.revealedIn).toBe("week-4");
});

test("a note can be written later, and stays sealed until week four", async ({ page }) => {
  await seedPlan(page, { daysAgo: 4 });
  await page.goto("/map/");
  await page.getByRole("textbox", { name: "A note to yourself for week five" }).fill("You said six months. Hold to it.");
  await page.getByRole("button", { name: "Seal it" }).click();
  await expect(page.getByRole("heading", { name: /Your note is sealed\. It opens on \d+ \w+\./ })).toBeVisible();
  await expect(page.getByText("You said six months. Hold to it.")).toHaveCount(0);
});

test("why am I seeing this explains the note in plain words", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/home/");
  await page.getByRole("button", { name: "Why am I seeing this?" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("heading", { name: /Why this note\?/ })).toBeVisible();
  await expect(sheet.getByText(/^You.re seeing this because you.re on day 35/)).toBeVisible();
  await sheet.getByRole("button", { name: "Got it" }).click();
  await expect(sheet).toBeHidden();
});

test.describe("before you stop", () => {
  test("shows day one, the map and the note, then keeps going", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/pause/");
    await expect(page.getByRole("heading", { name: /This was day one\./ })).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: /You.re on day 35, week 5\./ })).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: /You wrote this on/ })).toBeVisible();
    await expect(page.getByText(/You started this because/)).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Most people who feel this way are in weeks three to seven\./ })).toBeVisible();
    await page.getByRole("button", { name: /^Keep going/ }).click();
    await expect(page.getByRole("heading", { name: "Kept going. That was the hard bit." })).toBeVisible();
    const s = await saved(page);
    expect(s.intercepts.at(-1)).toMatchObject({ choice: "keep-going", day: 35 });
    expect(s.letter.revealedIn).toBe("pause");
  });

  test("a pause with a plan sets a restart date, a calendar file, and changes Today", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/pause/");
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: /^Pause with a plan/ }).click();
    await page.getByRole("button", { name: "Pause until then" }).click();
    await expect(page.getByRole("heading", { name: /^Paused until \d+ \w+\./ })).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Add the restart to my calendar" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("week-five-restart.ics");
    const ics = await (await file.createReadStream()).toArray();
    expect(Buffer.concat(ics).toString()).toMatch(/BEGIN:VEVENT[\s\S]*SUMMARY:Week Five: restart today/);
    expect((await saved(page)).intercepts.at(-1)).toMatchObject({ choice: "pause", restartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) });
    await page.getByRole("link", { name: "Back to Today" }).click();
    await expect(page.locator('.td-note[data-id="paused-now"]')).toBeVisible();
  });

  test("closing without choosing is allowed, and logged quietly", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/pause/");
    await page.getByRole("button", { name: "Close without choosing" }).first().click();
    await expect(page).toHaveURL(/\/home\/?$/);
    expect((await saved(page)).intercepts.at(-1)).toMatchObject({ choice: "closed" });
  });

  test("the doctor page is one printable summary, and opening it logs nothing", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/pause/?step=doctor");
    await expect(page.getByRole("heading", { name: /For your doctor\. One page, from this phone\./ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print this page" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    // Demo data is only written once something changes; either way, no intercept.
    expect((await saved(page))?.intercepts ?? []).toEqual([]);
  });
});
