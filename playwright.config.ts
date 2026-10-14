import { defineConfig } from "@playwright/test";

const PORT = 4400;

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The installed Google Chrome, so no browser download is needed.
    channel: "chrome",
    reducedMotion: "reduce",
  },
  webServer: {
    command: "node scripts/serve-out.mjs",
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    env: { PORT: String(PORT) },
  },
  projects: [
    { name: "phone", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
