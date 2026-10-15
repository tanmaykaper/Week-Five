import { mulberry32, hashString } from "@/lib/cohort";
import { sampleLuminance } from "@/lib/camera";
import { deletePhotoDatabase, listPhotos, putPhoto, type View } from "@/lib/storage/photos";
import { dateOfDay, PHOTO_WEEKS } from "@/lib/time/journey";
import type { Persona } from "./personas";

/**
 * Sample "photos" for demo mode: drawn heads, made on the device the first time demo mode
 * needs them and kept in the demo photo database. They are illustrations of nobody, and the
 * screens that show them say so. Density dips in the shed window and comes back slowly, the
 * same modest, typical shape the app describes in words; no persona gets a dramatic result.
 */

export const DEMO_WEEKS = [0, ...PHOTO_WEEKS];
const VIEWS: View[] = ["crown", "hairline", "parting"];
const SIZE = 640;

/** Hair density by photo week (0, 4, 8, 12, 16, 20, 24), relative to day one. */
const DENSITY: Record<Persona, number[]> = {
  steady: [1, 0.95, 0.93, 0.96, 1, 1.03, 1.06],
  worried: [1, 0.9, 0.89, 0.93, 0.97, 1.01, 1.04],
  "monsoon-quick-commerce": [1, 0.9, 0.86, 0.9, 0.95, 0.99, 1.03],
};

const LOOK: Record<Persona, { skin: [string, string]; hair: number; wall: [string, string] }> = {
  steady: { skin: ["#e2b99a", "#b98463"], hair: 30, wall: ["#dcd6cc", "#bdb6ac"] },
  worried: { skin: ["#d6a582", "#a7714f"], hair: 22, wall: ["#d9dde2", "#b7bec7"] },
  "monsoon-quick-commerce": { skin: ["#c99474", "#93603f"], hair: 18, wall: ["#d7d9cf", "#b4b8aa"] },
};

const idFor = (persona: Persona, view: View, week: number) => `demo-${persona}-${view}-w${week}`;

function strand(g: CanvasRenderingContext2D, x: number, y: number, dir: number, len: number, bend: number, w: number, tone: number) {
  g.strokeStyle = `rgb(${tone}, ${tone - 6}, ${tone - 10})`;
  g.lineWidth = w;
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + Math.cos(dir) * len * 0.5, y + Math.sin(dir) * len * 0.5, x + Math.cos(dir + bend) * len, y + Math.sin(dir + bend) * len);
  g.stroke();
}

function drawHead(g: CanvasRenderingContext2D, view: View, density: number, persona: Persona, week: number) {
  const look = LOOK[persona];
  const rnd = mulberry32(hashString(`${persona}:${view}`));
  const jitter = mulberry32(hashString(`${persona}:${view}:${week}`));
  const S = SIZE;
  const cx = S / 2 + (jitter() - 0.5) * 10;
  const cy = S / 2 + (jitter() - 0.5) * 10;

  const wall = g.createLinearGradient(0, 0, S, S);
  wall.addColorStop(0, look.wall[0]);
  wall.addColorStop(1, look.wall[1]);
  g.fillStyle = wall;
  g.fillRect(0, 0, S, S);

  const skin = (x: number, y: number, r: number) => {
    const s = g.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.15, x, y, r * 1.1);
    s.addColorStop(0, look.skin[0]);
    s.addColorStop(1, look.skin[1]);
    return s;
  };
  const strands = Math.round(2300 * density);
  const sparse = Math.max(0, 1.08 - density); // how much scalp shows

  if (view === "crown") {
    g.fillStyle = "#6f7d8f";
    g.beginPath();
    g.ellipse(cx, cy + S * 0.4, S * 0.5, S * 0.24, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = skin(cx, cy, S * 0.34);
    g.beginPath();
    g.ellipse(cx, cy, S * 0.27, S * 0.32, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.ellipse(cx, cy, S * 0.275, S * 0.325, 0, 0, Math.PI * 2);
    g.clip();
    const wx = cx + S * 0.02;
    const wy = cy - S * 0.08;
    for (let i = 0; i < strands; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.pow(rnd(), 0.7) * S * 0.36;
      if (r < S * (0.03 + sparse * 0.45) && rnd() < 0.55 + sparse * 2) continue;
      const tone = look.hair + rnd() * 26;
      strand(g, wx + Math.cos(a) * r, wy + Math.sin(a) * r * 1.1, a + 1.1, S * (0.06 + rnd() * 0.08), 0.5, 0.8 + rnd(), tone);
    }
    g.restore();
  } else if (view === "hairline") {
    g.fillStyle = "#6f7d8f";
    g.beginPath();
    g.ellipse(cx, S * 1.02, S * 0.5, S * 0.22, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = skin(cx, cy + S * 0.3, S * 0.12);
    g.fillRect(cx - S * 0.08, cy + S * 0.25, S * 0.16, S * 0.3);
    g.fillStyle = skin(cx, cy, S * 0.3);
    g.beginPath();
    g.ellipse(cx, cy + S * 0.03, S * 0.24, S * 0.31, 0, 0, Math.PI * 2);
    g.fill();
    // Hair cap down to a hairline that sits higher when density is lower.
    const line = cy - S * (0.12 - (1 - density) * 0.35);
    g.save();
    g.beginPath();
    g.ellipse(cx, cy + S * 0.03, S * 0.25, S * 0.32, 0, 0, Math.PI * 2);
    g.clip();
    for (let i = 0; i < strands; i++) {
      const x = cx + (rnd() - 0.5) * S * 0.52;
      const temple = Math.abs(x - cx) / (S * 0.26);
      const edge = line + Math.pow(temple, 2) * S * (0.02 + sparse * 0.25) - Math.sin(temple * Math.PI) * S * 0.02;
      const y = edge - rnd() * S * 0.3;
      const tone = look.hair + rnd() * 26;
      strand(g, x, y, -Math.PI / 2 + (x - cx) / (S * 0.6), S * (0.05 + rnd() * 0.07), 0.25, 0.8 + rnd(), tone);
    }
    g.restore();
    // Brows (the line to keep level), eyes open, a nose. Simple enough to read as a drawing.
    g.strokeStyle = `rgb(${look.hair + 8}, ${look.hair}, ${look.hair - 4})`;
    g.lineWidth = 8;
    g.lineCap = "round";
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(cx + s * S * 0.045, cy + S * 0.005);
      g.quadraticCurveTo(cx + s * S * 0.105, cy - S * 0.008, cx + s * S * 0.165, cy + S * 0.004);
      g.stroke();
      g.fillStyle = "#f4efe9";
      g.beginPath();
      g.ellipse(cx + s * S * 0.105, cy + S * 0.05, S * 0.032, S * 0.017, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgb(${look.hair + 14}, ${look.hair + 6}, ${look.hair})`;
      g.beginPath();
      g.arc(cx + s * S * 0.105, cy + S * 0.05, S * 0.014, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "rgba(90, 50, 30, 0.35)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx, cy + S * 0.075);
    g.quadraticCurveTo(cx - S * 0.022, cy + S * 0.15, cx + S * 0.015, cy + S * 0.16);
    g.stroke();
  } else {
    g.fillStyle = skin(cx, cy, S * 0.34);
    g.beginPath();
    g.ellipse(cx, cy - S * 0.02, S * 0.29, S * 0.33, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.beginPath();
    g.ellipse(cx, cy - S * 0.02, S * 0.295, S * 0.335, 0, 0, Math.PI * 2);
    g.clip();
    const part = cx - S * 0.04;
    const gap = S * (0.006 + sparse * 0.09);
    for (let i = 0; i < strands; i++) {
      const side = rnd() < 0.5 ? -1 : 1;
      const y = cy - S * 0.36 + rnd() * S * 0.62;
      const x = part + side * (gap + Math.pow(rnd(), 1.2) * S * 0.32);
      const tone = look.hair + rnd() * 26;
      strand(g, x, y, side > 0 ? 0.25 : Math.PI - 0.25, S * (0.07 + rnd() * 0.08), side * 0.35, 0.8 + rnd(), tone);
    }
    g.restore();
  }

  // Window light from the top left.
  const light = g.createRadialGradient(S * 0.15, S * 0.05, 10, S * 0.15, S * 0.05, S);
  light.addColorStop(0, "rgba(255, 250, 240, 0.25)");
  light.addColorStop(1, "rgba(255, 250, 240, 0)");
  g.fillStyle = light;
  g.fillRect(0, 0, S, S);
}

/** Makes sure the demo photo database holds this persona's drawings, replacing another persona's. */
export async function ensureDemoPhotos(persona: Persona, startDate: string): Promise<void> {
  if (typeof document === "undefined") return;
  let have = await listPhotos("demo");
  const samples = have.filter((p) => p.id.startsWith("demo-"));
  if (samples.some((p) => !p.id.startsWith(`demo-${persona}-`))) {
    await deletePhotoDatabase("demo");
    have = [];
  }
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const g = canvas.getContext("2d");
  if (!g) return;
  for (const [i, week] of DEMO_WEEKS.entries()) {
    for (const view of VIEWS) {
      if (have.some((p) => p.view === view && p.week === week)) continue;
      drawHead(g, view, DENSITY[persona][i]!, persona, week);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
      if (!blob) continue;
      const taken = dateOfDay(startDate, Math.max(1, week * 7));
      taken.setHours(21, 40, 0, 0);
      await putPhoto("demo", {
        id: idFor(persona, view, week),
        view,
        week,
        takenAt: taken.toISOString(),
        blob,
        width: SIZE,
        height: SIZE,
        luminance: Math.round(sampleLuminance(canvas)),
      });
    }
  }
}
