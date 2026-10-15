import { expect, test, type Page } from "@playwright/test";
import { demoDay, horizontalOverflow, putDrawnPhoto, seedDemo, seedPlan, storedPhotos, storedProjections } from "./helpers";

const title = (page: Page) => page.locator("#bl-title");

// Chrome's fake camera for the whole file; only the monthly photos use it.
test.use({ launchOptions: { args: ["--use-fake-device-for-media-stream"] } });
const LABEL = "An illustration of a typical outcome, not a promise. Results vary.";

test.describe("the mirror", () => {
  test("compares day one with the latest photo, by dragging or with the keys", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/mirror/");
    await expect(page.getByRole("heading", { level: 1, name: "Day one and now. Four weeks in. Expect no change yet." })).toBeVisible();
    await expect(page.getByText("These photos are for you. Light and angle change how hair looks.")).toBeVisible();
    await expect(page.getByText("Sample drawings for the demo, not photos of anyone.")).toBeVisible();

    const slider = page.getByRole("slider", { name: "Drag to compare day one with week 4" });
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "55");
    await page.keyboard.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "0");

    // Dragging anywhere on the lens moves the divider there.
    const box = (await page.locator(".cmp").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5, { steps: 4 });
    await page.mouse.up();
    await expect(slider).toHaveAttribute("aria-valuenow", "25");

    // The outline lays day one faintly over the later photo.
    const outline = page.getByRole("button", { name: "Show day-one outline" });
    await expect(outline).toHaveAttribute("aria-pressed", "false");
    await outline.click();
    await expect(outline).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".cmp-ghost")).toHaveCount(1);

    // Other views, and the six photo weeks as a strip.
    await page.getByRole("radio", { name: "Crown" }).click();
    await expect(page.getByRole("radio", { name: "Crown" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("img", { name: /^Sample drawing, crown, week 4/ })).toBeAttached();
    const strip = page.getByRole("list", { name: "Compare day one with" });
    await expect(strip.getByRole("button", { name: /^Compare with week 4, / })).toHaveAttribute("aria-pressed", "true");
    await expect(strip.getByRole("img", { name: /^Week 8 photos, around / })).toBeVisible();
    await expect(page.getByText(/^Next photos in week 8, around \d+ \w+\.$/)).toBeVisible();

    // The sheet: every photo day.
    await expect(page.getByRole("heading", { name: "Photo days" })).toBeVisible();
    const days = page.locator(".mr-days > li");
    await expect(days).toHaveCount(7);
    await expect(days.nth(0)).toContainText("Day one");
    await expect(days.nth(1)).toContainText("Saved");
    await expect(days.nth(2)).toContainText(/Around \d+ \w+/);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });

  test("warns when two photos were taken in different light, and steps between weeks", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/mirror/");
    await demoDay(page, 60, /^Worried/);
    await expect(page.getByRole("heading", { level: 1, name: "Day one and now. Eight weeks in. Still early to judge." })).toBeVisible();
    await expect(page.getByText("These two were taken in different light. Compare carefully.")).toBeVisible();
    await page.getByRole("button", { name: /^Compare with week 4, / }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Day one and now. Four weeks in. Expect no change yet." })).toBeVisible();
    await expect(page.getByText("These two were taken in different light. Compare carefully.")).toHaveCount(0);
    await expect(page.getByRole("slider", { name: "Drag to compare day one with week 4" })).toBeVisible();
  });

  test("with no photos, asks for day one first", async ({ page }) => {
    await seedPlan(page, { daysAgo: 10 });
    await page.goto("/mirror/");
    await expect(page.getByRole("heading", { level: 1, name: "Day one and now. Day one comes first." })).toBeVisible();
    await expect(page.getByText("No photos yet. Two minutes, and future you will thank you.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Take day-one photos" })).toHaveAttribute("href", /\/baseline\/?$/);
  });
});

test.describe("monthly photos", () => {
  test.use({ permissions: ["camera"] });

  test("a due week asks for its photos, and the camera shows day one to line up with", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/mirror/");
    await demoDay(page, 27);
    await expect(page.getByText("Week 4 photos are due.")).toBeVisible();
    await page.getByRole("link", { name: "Take week 4 photos" }).first().click();
    await expect(page).toHaveURL(/\/baseline\/\?week=4$/);
    await expect(title(page)).toHaveText(/^Week 4 photos\. Same three, same spot\.$/);
    await page.getByRole("button", { name: "Open the camera" }).click();

    await expect(title(page)).toHaveText(/Your crown, from above\./);
    await expect(page.getByRole("button", { name: "Day-one outline" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".bl-guide")).toBeVisible();
    await page.getByRole("button", { name: /^Timer, 3 s$/ }).click();
    await page.getByRole("button", { name: "Take crown photo" }).click();
    await page.getByRole("button", { name: "Keep", exact: true }).click();
    await expect(title(page)).toHaveText(/Your hairline, face on\./);
    await page.getByRole("button", { name: "Take hairline photo" }).click();
    await page.getByRole("button", { name: "Keep", exact: true }).click();
    await expect(title(page)).toHaveText(/Your parting, head down\./);
    await page.getByRole("button", { name: /^Timer, 3 s$/ }).click();
    await page.getByRole("button", { name: "Take parting photo" }).click();
    await page.getByRole("button", { name: "Keep", exact: true }).click();

    // No painter for monthly photos: straight to the close.
    await expect(title(page)).toHaveText(/^Week 4, recorded\. See you in week 8\.$/);
    const week4 = (await storedPhotos(page, "weekfive-demo")).photos.filter((p) => p[1] === 4);
    expect(week4.map((p) => p[0])).toEqual(["crown", "hairline", "parting"]);
    await page.getByRole("link", { name: "Compare with day one" }).click();
    await expect(page).toHaveURL(/\/mirror\/\?week=4$/);
    await expect(page.getByRole("slider", { name: "Drag to compare day one with week 4" })).toBeVisible();
    // Taken today by the plan's clock, so it counts today.
    await expect(page.locator(".mr-days > li").nth(1)).toContainText("Saved");
  });
});

test.describe("what week 24 can look like", () => {
  test("draws the illustration in stages, then shows it beside day one with its label", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/mirror/projection/");
    await expect(page.getByRole("heading", { level: 1, name: "Drawing week 24. On this phone, from your day-one photo." })).toBeVisible();
    for (const stage of ["Reading your baseline", "Marking the area", "Estimating a typical outcome"]) await expect(page.getByText(stage, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "What week 24 can look like. One typical case, drawn on day one." })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(LABEL)).toBeVisible();
    await expect(page.getByText(/^Most visible change, if it comes, shows up between month four and six\./)).toBeVisible();
    await expect(page.getByRole("img", { name: /^An illustration of a typical week-24 outcome/ })).toBeAttached();
    const slider = page.getByRole("slider", { name: "Drag to compare day one with the illustration" });
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(await storedProjections(page, "weekfive-demo")).toBe(1);
    await page.getByText("How this picture is made").click();
    await expect(page.getByText(/Nothing is uploaded, and it isn.t a medical image\./)).toBeVisible();

    // The mirror and Today show the illustration once it exists.
    await page.getByRole("link", { name: "Done" }).click();
    await expect(page).toHaveURL(/\/mirror\/?$/);
    await expect(page.locator(".mr-proj-disc img")).toBeAttached();
    await page.goto("/home/");
    await expect(page.locator(".td-proj-disc img")).toBeAttached();
  });

  test("asks for day one, then for the area, and comes back from the painter", async ({ page }) => {
    await seedPlan(page, { daysAgo: 20, worries: ["crown"] });
    await page.goto("/mirror/projection/");
    await expect(page.getByText("Take your day-one photos first.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Take day-one photos" })).toBeVisible();

    await putDrawnPhoto(page, "crown");
    await page.reload();
    await expect(page.getByText("Paint the area you’re watching first. Takes ten seconds.")).toBeVisible();
    await page.getByRole("link", { name: "Mark the area" }).click();
    await expect(page).toHaveURL(/\/baseline\/\?step=paint&then=projection$/);
    await expect(title(page)).toHaveText(/Show us the area you watch\./);
    await page.getByRole("button", { name: "Mark the middle for me" }).click();
    await page.getByRole("button", { name: "Done", exact: true }).click();
    await expect(page).toHaveURL(/\/mirror\/projection\/?$/);
    await expect(page.getByText(LABEL)).toBeVisible({ timeout: 15000 });
    expect(await storedProjections(page)).toBe(1);
  });
});
