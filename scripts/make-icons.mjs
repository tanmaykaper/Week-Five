// Renders the app icons from SVG with the locally installed Chrome. Run once: pnpm icons
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const mark = (size, pad) => {
  const s = size, p = s * pad, inner = s - p * 2, u = inner / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="#0F1E33"/>
  <g transform="translate(${p} ${p}) scale(${u})">
    <path d="M16 6c-2.8 4.2-5.6 7.1-5.6 10.4a5.6 5.6 0 0 0 11.2 0C21.6 13.1 18.8 10.2 16 6z" fill="#FFFFFF"/>
    <path d="M7 25.5h18" stroke="#7DB0EE" stroke-width="1.6" stroke-linecap="round"/>
  </g></svg>`;
};

const targets = [
  { file: "public/icons/icon-192.png", size: 192, pad: 0.08 },
  { file: "public/icons/icon-512.png", size: 512, pad: 0.08 },
  { file: "public/icons/maskable-512.png", size: 512, pad: 0.2 },
  { file: "src/app/apple-icon.png", size: 180, pad: 0.12 },
];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(`<html><body style="margin:0">${mark(t.size, t.pad)}</body></html>`);
  await writeFile(t.file, await page.screenshot({ clip: { x: 0, y: 0, width: t.size, height: t.size } }));
  console.log("wrote", t.file);
}
await browser.close();
