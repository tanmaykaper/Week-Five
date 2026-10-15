import { expect, test, type Page } from "@playwright/test";
import { horizontalOverflow, seedPlan, storedPhotos } from "./helpers";

const title = (page: Page) => page.locator("#bl-title");
const keep = (page: Page) => page.getByRole("button", { name: "Keep", exact: true });

// Chrome's fake camera for the whole file. Whether the page may use it is the permission below.
test.use({ launchOptions: { args: ["--use-fake-device-for-media-stream"] } });

test.describe("with a camera", () => {
  test.use({ permissions: ["camera"] });

  test("three photos through the lens, the painter, then the close", async ({ page }) => {
    await seedPlan(page, { worries: ["hairline"] });
    await page.goto("/baseline/");
    await expect(title(page)).toHaveText(/Three photos, two minutes\./);
    await expect(page.getByText("Photos stay on this phone. Nothing is sent anywhere.")).toBeVisible();
    await page.getByRole("button", { name: "Open the camera" }).click();

    // Crown: the timer is on by default, since nobody can see the screen above their head.
    await expect(title(page)).toHaveText(/Your crown, from above\./);
    await expect(page.getByRole("button", { name: /^Timer, 3 s$/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/^(Good light\.|Too dark\. Move closer to a window\.|Too bright\. Step out of direct sun\.)$/)).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Take crown photo" }).click();
    await expect(keep(page)).toBeVisible({ timeout: 8000 });
    await keep(page).click();

    // Hairline: front camera, no timer.
    await expect(title(page)).toHaveText(/Your hairline, face on\./);
    await expect(page.getByRole("button", { name: /^Timer, 3 s$/ })).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Take hairline photo" }).click();
    await keep(page).click();

    // Parting, with the timer switched off.
    await expect(title(page)).toHaveText(/Your parting, head down\./);
    await page.getByRole("button", { name: /^Timer, 3 s$/ }).click();
    await page.getByRole("button", { name: "Take parting photo" }).click();
    await keep(page).click();

    // The painter opens on the photo of what bothers them most.
    await expect(title(page)).toHaveText(/Show us the area you watch\./);
    await expect(page.getByRole("radio", { name: "Hairline" })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Mark the middle for me" }).click();
    await page.getByRole("button", { name: "Done", exact: true }).click();

    await expect(title(page)).toHaveText(/Day one, recorded\. See you in week 4\./);
    await expect(page.getByText(/^Next photos around \d+ \w+, at about (\d+ (am|pm)|midday|midnight)\. Same spot, same light\.$/)).toBeVisible();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    expect(await storedPhotos(page)).toEqual({
      photos: [
        ["crown", 0, expect.any(Number)],
        ["hairline", 0, expect.any(Number)],
        ["parting", 0, expect.any(Number)],
      ],
      masks: 1,
    });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("weekfive:v1")!));
    expect(saved.onboarding.baselineDoneAt).toBeTruthy();
    expect(saved.settings.photoHour).toBe(new Date().getHours());

    // Delete takes a second tap, then the set is short one photo.
    await page.getByRole("button", { name: "Delete crown photo" }).click();
    await page.getByRole("button", { name: "Delete it: crown photo" }).click();
    await expect(title(page)).toHaveText(/Day one, nearly recorded\./);
    expect((await storedPhotos(page)).photos.map((p) => p[0])).toEqual(["hairline", "parting"]);

    // Taking it again from the close goes straight to the camera and back.
    await page.getByRole("button", { name: "Take crown photo" }).click();
    await expect(title(page)).toHaveText(/Your crown, from above\./);
    await page.getByRole("button", { name: /^Timer, 3 s$/ }).click();
    await page.getByRole("button", { name: "Take crown photo" }).click();
    await keep(page).click();
    await expect(title(page)).toHaveText(/Day one, recorded\./);

    // A return visit opens on the close, with the area remembered.
    await page.reload();
    await expect(title(page)).toHaveText(/Day one, recorded\./);
    await expect(page.getByRole("button", { name: "Change the marked area" })).toBeVisible();
  });

  test("the timer can be cancelled", async ({ page }) => {
    await seedPlan(page);
    await page.goto("/baseline/");
    await page.getByRole("button", { name: "Open the camera" }).click();
    await page.getByRole("button", { name: "Take crown photo" }).click();
    await page.getByRole("button", { name: "Cancel the timer" }).click();
    await page.waitForTimeout(3500);
    await expect(keep(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Take crown photo" })).toBeEnabled();
  });
});

test.describe("without camera access", () => {
  test("photos come from the gallery instead, cropped to the middle square", async ({ page }) => {
    await seedPlan(page);
    await page.goto("/baseline/");
    await page.getByRole("button", { name: "Open the camera" }).click();
    await expect(page.getByText(/^(No camera access\. You can still pick photos from your gallery\.|This browser can't open the camera\. Choose a photo instead\.)$/)).toBeVisible();

    const png = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 900;
      const g = c.getContext("2d")!;
      g.fillStyle = "#b98463";
      g.fillRect(0, 0, 1200, 900);
      g.fillStyle = "#2a2420";
      g.beginPath();
      g.ellipse(600, 450, 300, 360, 0, 0, Math.PI * 2);
      g.fill();
      return c.toDataURL("image/png").split(",")[1]!;
    });
    const file = { name: "head.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") };

    for (const view of ["crown", "hairline", "parting"]) {
      await expect(title(page)).toHaveText(new RegExp(`Your ${view}`));
      await page.locator('input[type="file"]').setInputFiles(file);
      await expect(page.getByText("We keep the middle square, the same every month.")).toBeVisible();
      await keep(page).click();
    }
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(title(page)).toHaveText(/Day one, recorded\./);
    expect(await storedPhotos(page)).toEqual({
      photos: [
        ["crown", 0, 900],
        ["hairline", 0, 900],
        ["parting", 0, 900],
      ],
      masks: 0,
    });
  });
});

test("later is allowed, and back returns to the briefing", async ({ page }) => {
  await seedPlan(page);
  await page.goto("/baseline/");
  await page.getByRole("button", { name: "Back to the briefing" }).click();
  await expect(page).toHaveURL(/\/onboarding\/\?step=briefing$/);
  await page.goto("/baseline/");
  await page.getByRole("link", { name: /do it later/ }).click();
  await expect(page).toHaveURL(/\/home\/$/);
});
