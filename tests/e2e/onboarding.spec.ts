import { expect, test, type Page } from "@playwright/test";
import { seedDemo, seedFresh } from "./helpers";

const question = (page: Page) => page.locator("#ob-question");
const next = (page: Page) => page.getByRole("button", { name: /^(Continue|Finish)$/ }).click();

test("a pack scan carries into setup, and the finished plan holds only what was asked", async ({ page }) => {
  await seedFresh(page, "light", { introSeen: true });
  await page.goto("/start/?sku=WF-KIT-01&reg=2026-10-10&batch=B7");
  await page.getByRole("link", { name: "Start setup" }).click();

  await expect(question(page)).toHaveText(/What should we call you\?/);
  await page.getByRole("textbox", { name: "Your name or nickname" }).fill("Kabir");
  await next(page);

  await page.getByRole("radio", { name: "35 to 44" }).click();
  await expect(question(page)).toHaveText(/Which city are you in\?/);
  await page.getByRole("textbox", { name: "Search cities" }).fill("chen");
  await page.getByRole("radio", { name: "Chennai" }).click();
  await expect(page.getByText(/The rains land on weeks/)).toBeVisible();
  await next(page);

  // Pre-ticked from the kit.
  await expect(question(page)).toHaveText(/Here.s what.s on your pack\./);
  for (const name of ["Regrowth solution", "Hair gummies", "Shampoo"]) {
    await expect(page.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
  }
  await next(page);

  await page.getByRole("radio", { name: /A quick-commerce app/ }).click();
  await expect(question(page)).toHaveText(/When did you start\?/);
  await page.getByRole("radio", { name: "The day I bought it" }).click();
  await expect(page.getByText(/Day one is 10 October\./)).toBeVisible();
  await next(page);

  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("textbox", { name: "A note to yourself for week five" }).fill("You were tired of the cap.");
  await next(page);
  await next(page);

  await expect(page.getByRole("heading", { name: "Your plan is ready." })).toBeVisible();
  await expect(page.getByText("Weeks 1 to 12", { exact: true })).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive:v1")!));
  expect(saved.profile).toMatchObject({
    nickname: "Kabir",
    ageBand: "35-44",
    cityId: "chennai",
    channel: "quick-commerce",
    startDate: "2026-10-10",
    products: ["solution", "gummies", "shampoo"],
    worries: [],
  });
  expect(saved.profile.packs[0]).toMatchObject({ sku: "WF-KIT-01", reg: "2026-10-10", batch: "B7" });
  expect(saved.letter.text).toBe("You were tired of the cap.");
  expect(saved.routine).toMatchObject({ morning: "07:30", evening: "21:00" });

  // Quick-commerce buyers get the full briefing.
  await page.getByRole("button", { name: "Read the briefing" }).click();
  await expect(page.getByText("The briefing you skipped.")).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Got it. Take my day-one photos." }).click();
  await expect(page).toHaveURL(/\/baseline\/$/);
});

test("closing the tab mid-way picks up at the same question", async ({ page }) => {
  await seedFresh(page, "light", { introSeen: true });
  await page.goto("/onboarding/");
  await page.getByRole("textbox", { name: "Your name or nickname" }).fill("Dev");
  await next(page);
  await page.getByRole("radio", { name: "18 to 24" }).click();
  await expect(question(page)).toHaveText(/Which city/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding\/$/);
  await expect(question(page)).toHaveText(/Which city/);
  await page.getByRole("button", { name: "Back to the previous question" }).click();
  await expect(page.getByRole("radio", { name: "18 to 24" })).toHaveAttribute("aria-checked", "true");
});

test("products and a start date are required; skippable questions say so", async ({ page }) => {
  await seedFresh(page, "light", { introSeen: true });
  await page.goto("/onboarding/");
  await next(page);
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(question(page)).toHaveText(/What are you using\?/);
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  await page.getByRole("button", { name: "Regrowth foam" }).click();
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();
});

test("the assessment route gets the short briefing", async ({ page }) => {
  await seedFresh(page, "light", { introSeen: true });
  await page.goto("/onboarding/");
  await next(page);
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Regrowth solution" }).click();
  await next(page);
  await page.getByRole("radio", { name: /Hair assessment and kit/ }).click();
  await page.getByRole("radio", { name: "Today" }).click();
  await next(page);
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "I'll write it later" }).click();
  await next(page);
  await page.getByRole("button", { name: "Read the briefing" }).click();
  await expect(page.getByText("A quick reminder.")).toBeVisible();
  await expect(page.getByText("Expect a shed.")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive:v1")!));
  expect(saved.letter).toBeNull();
  expect(saved.profile.nickname).toBe("");
});

test("demo mode never lands in setup", async ({ page }) => {
  await seedDemo(page);
  await page.goto("/onboarding/");
  await expect(page).toHaveURL(/\/home\/$/);
});
