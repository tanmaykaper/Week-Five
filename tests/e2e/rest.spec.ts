// Supply, Mates, You, reminders, Hinglish and the phone view (the last phases).
import { expect, test } from "@playwright/test";
import { seedDemo, seedPlan } from "./helpers";

test.describe("supply", () => {
  test("shows the runway, adds a pack and saves the calendar file", async ({ page }) => {
    await seedPlan(page, { daysAgo: 20, packDaysAgo: 22 });
    await page.goto("/reorder/");
    await expect(page.locator("#sp-title")).toContainText("About 8 days left.");
    // At 10 days or fewer, with no uneasy check-in, the reorder link is offered.
    await expect(page.getByRole("link", { name: /Reorder on Man Matters/ })).toHaveAttribute("rel", "noopener noreferrer");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Add reminders to calendar" }).first().click();
    expect((await download).suggestedFilename()).toBe("week-five-reminders.ics");
    await page.getByLabel("Which pack").last().selectOption("WF-GUM-30");
    await page.getByRole("button", { name: "Add pack" }).last().click();
    await expect(page.getByText(/Added Hair gummies, 30 pack/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove Hair gummies, 30 pack" })).toBeVisible();
  });

  test("holds the reorder for a day after an uneasy check-in", async ({ page }) => {
    await seedPlan(page, { daysAgo: 20, packDaysAgo: 22 });
    await page.goto("/checkin/");
    await page.getByRole("radio", { name: "Handfuls" }).click();
    await page.getByRole("radio", { name: "A lot" }).click();
    await page.getByRole("button", { name: /^Save/ }).click();
    await page.goto("/reorder/");
    await expect(page.getByText(/The reorder can wait until tomorrow/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Reorder on Man Matters/ })).toHaveCount(0);
  });

  test("a second pack scanned later joins the plan", async ({ page }) => {
    await seedPlan(page, { daysAgo: 10, packDaysAgo: 10 });
    await page.goto("/start/?sku=WF-GUM-30&reg=2026-10-10&batch=B7");
    await page.getByRole("button", { name: "Add this pack" }).click();
    await expect(page).toHaveURL(/\/reorder\/$/);
    await expect(page.getByText("Hair gummies, 30 pack").first()).toBeVisible();
  });
});

test.describe("mates", () => {
  test("is labelled a demo community, and a nudge stays local", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/mates/");
    await expect(page.getByText("Demo community").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this would work for real." })).toBeVisible();
    const nudge = page.getByRole("button", { name: /^Nudge / }).first();
    await nudge.click();
    await page.getByRole("button", { name: "Keep going" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Sent." })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).first().click();
    await expect(page.getByRole("button", { name: /^Nudged: / }).first()).toBeVisible();
    const sent = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive-demo:v1")!).nudgesSent.length);
    expect(sent).toBe(1);
  });
});

test.describe("you", () => {
  test("edits an answer and the greeting follows", async ({ page }) => {
    await seedPlan(page, { daysAgo: 12 });
    await page.goto("/profile/");
    await page.getByRole("button", { name: "Change name" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("Dev");
    await page.locator("#plan").getByRole("button", { name: "Save" }).click();
    await expect(page.locator("#yo-title")).toContainText("Dev.");
    await page.goto("/home/");
    await expect(page.locator("#td-greeting")).toContainText("Dev");
  });

  test("Hinglish changes the daily note, not the card", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/home/");
    const note = page.locator(".td-note");
    const id = await note.getAttribute("data-id");
    const english = await page.locator(".td-note-text").textContent();
    await page.goto("/profile/");
    await page.getByRole("radio", { name: "Hinglish" }).click();
    await page.goto("/home/");
    await expect(page.locator(".td-note")).toHaveAttribute("data-id", id!);
    await expect(page.locator(".td-note-text")).not.toHaveText(english!);
  });

  test("routine times save and show on Today", async ({ page }) => {
    await seedPlan(page, { daysAgo: 12 });
    await page.goto("/profile/");
    await page.getByLabel("Morning").fill("07:15");
    await page.getByRole("button", { name: "Save times" }).click();
    await expect(page.getByText("Saved. Today shows the new times.")).toBeVisible();
    await page.goto("/home/");
    await expect(page.locator(".td-slot").first()).toContainText("07:15");
  });
});

test("the reminder banner points at what is due", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/mates/");
  await expect(page.locator(".rm")).toContainText("Your note to week five is ready.");
  await page.getByRole("button", { name: "Hide this until tomorrow" }).click();
  await expect(page.locator(".rm")).toHaveCount(0);
});

test("phone view shows the same app inside a phone, and comes back", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "The phone view is for wide screens.");
  await seedDemo(page);
  await page.goto("/home/");
  await page.getByRole("button", { name: "Phone view: see this page on a phone" }).click();
  const dialog = page.getByRole("dialog", { name: /Phone view/ });
  await expect(dialog).toBeVisible();
  const phone = page.frameLocator("iframe[title='Week Five on a phone']");
  await expect(phone.locator("#td-greeting")).toBeVisible({ timeout: 15000 });
  // Inside the phone it is the phone layout: the tab bar, and no phone button of its own.
  await expect(phone.getByRole("navigation", { name: "Main" }).last()).toBeVisible();
  await expect(phone.locator(".pv-tab")).toHaveCount(0);
  await page.getByRole("radio", { name: "430" }).click();
  await expect(page.locator("iframe[title='Week Five on a phone']")).toHaveAttribute("width", "430");
  await phone.getByRole("link", { name: "Map" }).last().click();
  await page.getByRole("button", { name: "Back to full view" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/map\/$/);
});
