import { expect, test } from "@playwright/test";
import { seedDemo, seedFresh } from "./helpers";

const dialog = (page: import("@playwright/test").Page) => page.getByRole("dialog", { name: "Before you start, six things worth knowing." });

test.describe("reduced motion (the default in these tests)", () => {
  test("plays as a calm sequence with pause and next, then opens the welcome screen", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/start\/$/);
    await expect(dialog(page)).toBeVisible();

    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Play" })).toHaveAttribute("aria-pressed", "true");
    for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Let's set up your plan" }).click();

    await expect(dialog(page)).toBeHidden();
    await expect(page.getByText("Your details and photos stay on this phone.")).toBeVisible();
    await expect(page.locator("#main")).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem("weekfive:intro"))).toBe("seen");

    await page.reload();
    await expect(page.getByText("Your details and photos stay on this phone.")).toBeVisible();
    await expect(dialog(page)).toHaveCount(0);
  });

  test("Skip intro is always there and works straight away", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/start/?sku=WF-GUM-30&reg=2026-10-01");
    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(page.getByText("Hair gummies, 30 pack")).toBeVisible();
  });

  test("keeps the page behind out of reach while open", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/start/");
    await expect(dialog(page)).toBeVisible();
    expect(await page.locator("header").first().evaluate((el) => (el as HTMLElement).inert || el.closest("[inert]") !== null)).toBe(true);
  });

  test("never shows in demo mode", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/start/");
    await expect(page.getByText("Your details and photos stay on this phone.")).toBeVisible();
    await expect(dialog(page)).toHaveCount(0);
  });

  test("replays from About and lands on /start", async ({ page }) => {
    await seedDemo(page);
    await page.goto("/about/");
    await page.getByRole("button", { name: "Replay the intro" }).click();
    await expect(dialog(page)).toBeVisible();
    await page.getByRole("button", { name: "Skip intro" }).click();
    await expect(page).toHaveURL(/\/start\/$/);
  });
});

test.describe("full motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the keyboard walks through all six beats and releases the drop", async ({ page }) => {
    await seedFresh(page);
    await page.goto("/start/?sku=WF-SOL-60&reg=2026-10-01");
    await expect(dialog(page)).toBeVisible();
    await page.waitForFunction(() => document.querySelector<HTMLElement>(".intro-dropper")?.style.transform !== undefined);
    await page.waitForTimeout(400); // the animation library loads behind the first frame
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(700);
    }
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toHaveCount(0, { timeout: 5000 });
    await expect(page.getByText("Regrowth solution, 60 ml")).toBeVisible();
  });

  test("holds a smooth frame rate with the CPU slowed 4x", async ({ page, browserName }, info) => {
    test.skip(info.project.name === "tablet" || browserName !== "chromium", "Measured on phone and desktop");
    await seedFresh(page);
    await page.goto("/start/");
    await expect(dialog(page)).toBeVisible();
    await page.waitForTimeout(600);

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    const result = await page.evaluate(
      () =>
        new Promise<{ frames: number; avgFps: number; p95: number; slow: number }>((resolve) => {
          const scroller = document.querySelector<HTMLElement>(".intro-scroller")!;
          const track = document.querySelector<HTMLElement>(".intro-track")!;
          const max = (track.offsetHeight - scroller.clientHeight) * 0.9;
          const deltas: number[] = [];
          const duration = 4000;
          let start = 0;
          let last = 0;
          const tick = (t: number) => {
            if (!start) start = last = t;
            else deltas.push(t - last);
            last = t;
            const p = Math.min(1, (t - start) / duration);
            scroller.scrollTop = p * max;
            if (p < 1) requestAnimationFrame(tick);
            else {
              const sorted = [...deltas].sort((a, b) => a - b);
              const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
              resolve({
                frames: deltas.length,
                avgFps: Math.round(1000 / avg),
                p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]! * 10) / 10,
                slow: Math.round((deltas.filter((d) => d > 25).length / deltas.length) * 1000) / 10,
              });
            }
          };
          requestAnimationFrame(tick);
        }),
    );
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    console.log(`Intro scroll at 4x CPU throttle: ${result.avgFps} fps average, p95 frame ${result.p95} ms, ${result.slow}% of frames over 25 ms (${result.frames} frames)`);
    info.annotations.push({ type: "perf", description: JSON.stringify(result) });
    expect(result.avgFps).toBeGreaterThanOrEqual(50);
    expect(result.p95).toBeLessThan(34);
  });
});
