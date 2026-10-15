import { mulberry32 } from "@/lib/rng";

/**
 * The maths behind the week-24 illustration (BUILD_DOC F15), free of the DOM so it runs and
 * is tested anywhere. Inside the area the person painted, and nowhere else, it:
 *
 * 1. reads the hair and scalp tones of that area and its surroundings,
 * 2. moves the scalp-coloured pixels a little towards the hair's colour, and
 * 3. draws fine, seeded hairs that follow the direction the existing hair grows in.
 *
 * The strength is small on purpose: one typical case, never a best case. The same input
 * always gives the same picture. Nothing here touches the network.
 */

export type SimView = "crown" | "hairline" | "parting";

/** How strongly the illustration changes the photo. Deliberately modest (BUILD_DOC F15). */
export const SIM_STRENGTH = 0.18;

export interface SimInput {
  /** RGBA pixels of the square day-one photo, `size` by `size`. */
  rgba: Uint8ClampedArray;
  /** The painted area at the same size, 0 to 1 per pixel, already feathered (see prepareMask). */
  mask: Float32Array;
  size: number;
  view: SimView;
  seed: number;
  strength?: number;
}

export interface SimResult {
  rgba: Uint8ClampedArray<ArrayBuffer>;
  /** How many fine hairs were drawn. */
  strands: number;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Rec. 709 luma of the pixel starting at byte `i`. */
const luma = (d: ArrayLike<number>, i: number) => 0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!;

/**
 * How skin-like a pixel's colour is, 0 to 1, from its chroma (the usual YCbCr skin range,
 * across skin tones). Walls, tiles and clothes fall outside it, so a roughly painted area
 * that spills past the head never grows hair on the background.
 */
export function skinness(d: ArrayLike<number>, i: number): number {
  const r = d[i]!;
  const g = d[i + 1]!;
  const b = d[i + 2]!;
  const cr = 128 + 0.5 * r - 0.4187 * g - 0.0813 * b;
  const cb = 128 - 0.1687 * r - 0.3313 * g + 0.5 * b;
  return smoothstep(132, 138, cr) * (1 - smoothstep(170, 180, cr)) * smoothstep(70, 80, cb) * (1 - smoothstep(125, 135, cb));
}

/** One box blur pass, horizontal then vertical, with edges clamped. */
export function boxBlur(src: Float32Array, size: number, r: number): Float32Array {
  if (r < 1) return src.slice();
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const w = 2 * r + 1;
  const last = size - 1;
  for (let y = 0; y < size; y++) {
    const row = y * size;
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[row + clamp(x, 0, last)]!;
    for (let x = 0; x < size; x++) {
      tmp[row + x] = acc / w;
      acc += src[row + Math.min(x + r + 1, last)]! - src[row + Math.max(x - r, 0)]!;
    }
  }
  for (let x = 0; x < size; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, last) * size + x]!;
    for (let y = 0; y < size; y++) {
      out[y * size + x] = acc / w;
      acc += tmp[Math.min(y + r + 1, last) * size + x]! - tmp[Math.max(y - r, 0) * size + x]!;
    }
  }
  return out;
}

/** Three box passes, close to a Gaussian blur with standard deviation `sigma` pixels. */
export function feather(mask: Float32Array, size: number, sigma: number): Float32Array {
  const r = Math.max(1, Math.round(sigma - 0.5));
  return boxBlur(boxBlur(boxBlur(mask, size, r), size, r), size, r);
}

/**
 * Turns the painter's alpha (0 to 255, a soft brush, so rarely solid) into an area: anything
 * painted counts as inside, and the edge is feathered by about 24 px at the painter's 512 px.
 */
export function prepareMask(alpha: ArrayLike<number>, size: number): Float32Array {
  const m = new Float32Array(size * size);
  for (let i = 0; i < m.length; i++) m[i] = smoothstep(0.03, 0.3, alpha[i]! / 255);
  return feather(m, size, (size * 12) / 512);
}

/** Share of the picture inside the area, 0 to 1. */
export function maskArea(mask: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < mask.length; i++) sum += mask[i]!;
  return sum / mask.length;
}

/** Weighted luma percentiles of the head (skin and dark hair) over the area and a little around it. */
function tones(lum: Float32Array, mask: Float32Array, rgba: ArrayLike<number>) {
  const hist = new Float64Array(256);
  let total = 0;
  for (let i = 0; i < lum.length; i++) {
    const m = mask[i]!;
    if (m <= 0.02) continue;
    const w = m * Math.max(skinness(rgba, i * 4), lum[i]! < 90 ? 1 : 0);
    if (w <= 0) continue;
    hist[clamp(Math.round(lum[i]!), 0, 255)]! += w;
    total += w;
  }
  const pct = (p: number) => {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v]!;
      if (acc >= total * p) return v;
    }
    return 255;
  };
  return total > 0 ? { hair: pct(0.12), skin: pct(0.88) } : null;
}

/** Which way hair grows in each view when the photo itself gives no clear direction. */
function baseDirection(view: SimView, x: number, y: number, size: number, cx: number, cy: number): [number, number] {
  if (view === "crown") {
    // Out from the whorl, turning as it goes.
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    const rx = dx / len;
    const ry = dy / len;
    const a = 0.65;
    return [Math.cos(a) * rx - Math.sin(a) * ry, Math.sin(a) * rx + Math.cos(a) * ry];
  }
  if (view === "hairline") {
    // Up and back from the hairline, fanning out towards the temples.
    const dx = ((x - size / 2) / size) * 0.9;
    const len = Math.hypot(dx, 1);
    return [dx / len, -1 / len];
  }
  // The parting runs up the frame; hair falls away from it on both sides.
  const side = x < cx ? -1 : 1;
  const len = Math.hypot(1, 0.3);
  return [side / len, 0.3 / len];
}

/**
 * The direction the hair around (x, y) already grows in, from the structure tensor of the
 * smoothed luma, and how sure that reading is (0 to 1). Strands run across the gradient.
 */
function photoDirection(soft: Float32Array, size: number, x: number, y: number, w: number): { dx: number; dy: number; sure: number } {
  let jxx = 0;
  let jyy = 0;
  let jxy = 0;
  const x0 = Math.max(1, x - w);
  const x1 = Math.min(size - 2, x + w);
  const y0 = Math.max(1, y - w);
  const y1 = Math.min(size - 2, y + w);
  for (let yy = y0; yy <= y1; yy += 2) {
    for (let xx = x0; xx <= x1; xx += 2) {
      const i = yy * size + xx;
      const gx = soft[i - size + 1]! + 2 * soft[i + 1]! + soft[i + size + 1]! - soft[i - size - 1]! - 2 * soft[i - 1]! - soft[i + size - 1]!;
      const gy = soft[i + size - 1]! + 2 * soft[i + size]! + soft[i + size + 1]! - soft[i - size - 1]! - 2 * soft[i - size]! - soft[i - size + 1]!;
      jxx += gx * gx;
      jyy += gy * gy;
      jxy += gx * gy;
    }
  }
  const sum = jxx + jyy;
  if (sum < 1e-6) return { dx: 0, dy: 0, sure: 0 };
  const theta = 0.5 * Math.atan2(2 * jxy, jxx - jyy) + Math.PI / 2;
  const sure = Math.sqrt((jxx - jyy) * (jxx - jyy) + 4 * jxy * jxy) / sum;
  return { dx: Math.cos(theta), dy: Math.sin(theta), sure };
}

/** The illustration, all at once. Pixels outside the area come back exactly as they went in. */
export function simulate(input: SimInput): SimResult {
  const steps = simulateSteps(input);
  for (;;) {
    const next = steps.next();
    if (next.done) return next.value;
  }
}

/**
 * The same illustration in slices: a page can draw a frame between them, so the thinking
 * animation never stalls on a slow phone. The result is identical to simulate().
 */
export async function simulateAsync(input: SimInput, budgetMs = 8): Promise<SimResult> {
  const steps = simulateSteps(input);
  let start = performance.now();
  for (;;) {
    const next = steps.next();
    if (next.done) return next.value;
    if (performance.now() - start > budgetMs) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      start = performance.now();
    }
  }
}

/** The work, with a yield after each pass over the picture and every few hairs. */
function* simulateSteps(input: SimInput): Generator<void, SimResult, void> {
  const { rgba, mask, size, view, seed } = input;
  const strength = clamp(input.strength ?? SIM_STRENGTH, 0, 1);
  const out = new Uint8ClampedArray(rgba);
  const n = size * size;
  if (strength <= 0 || maskArea(mask) <= 0) return { rgba: out, strands: 0 };

  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = luma(rgba, i * 4);
  yield;
  // Lightly smoothed, so one dark pixel doesn't count as hair.
  const soft = boxBlur(lum, size, Math.max(1, Math.round(size / 512)));
  yield;

  const t = tones(soft, mask, rgba);
  if (!t) return { rgba: out, strands: 0 };
  const span = Math.max(24, t.skin - t.hair);
  const hairL = t.skin - span;

  // The hair's own colour: the darkest part of the area and its surroundings.
  let hr = 0;
  let hg = 0;
  let hb = 0;
  let hw = 0;
  let cx = 0;
  let cy = 0;
  let mw = 0;
  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < n; i++) {
    const m = mask[i]!;
    if (m <= 0.02) continue;
    const x = i % size;
    const y = (i - x) / size;
    cx += x * m;
    cy += y * m;
    mw += m;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (soft[i]! <= hairL + span * 0.2) {
      hr += rgba[i * 4]! * m;
      hg += rgba[i * 4 + 1]! * m;
      hb += rgba[i * 4 + 2]! * m;
      hw += m;
    }
  }
  cx /= mw;
  cy /= mw;
  yield;
  const hair: [number, number, number] = hw > 0 ? [hr / hw, hg / hw, hb / hw] : [42, 34, 30];

  // How much scalp shows at each pixel (0 on hair, 1 on bare skin), and whether the pixel is on
  // the head at all (skin or hair), so nothing is drawn on the wall behind it.
  const scalp = new Float32Array(n);
  const head = new Float32Array(n);
  let sparse = 0;
  for (let i = 0; i < n; i++) {
    const m = mask[i]!;
    if (m <= 0) continue;
    const skin = skinness(rgba, i * 4);
    const s = smoothstep(hairL + span * 0.25, hairL + span * 0.85, soft[i]!) * skin;
    scalp[i] = s;
    head[i] = Math.max(skin, 1 - smoothstep(hairL + span * 0.3, hairL + span * 0.6, soft[i]!));
    sparse += s * m;
  }
  yield;

  // 1. Soften the scalp: sparse pixels move a little towards the hair's colour.
  for (let i = 0; i < n; i++) {
    const m = mask[i]!;
    if (m <= 0) continue;
    const k = strength * 0.45 * scalp[i]! * m;
    if (k <= 0) continue;
    const p = i * 4;
    out[p] = out[p]! + (hair[0] - out[p]!) * k;
    out[p + 1] = out[p + 1]! + (hair[1] - out[p + 1]!) * k;
    out[p + 2] = out[p + 2]! + (hair[2] - out[p + 2]!) * k;
  }

  yield;

  // 2. Fine hairs, rooted where scalp shows, growing the way the hair around them grows.
  const rnd = mulberry32(seed);
  const scale = Math.min(1, strength / SIM_STRENGTH);
  // Enough hairs to cover about a quarter of the bare scalp at the usual strength, at any size.
  const strandArea = size * 0.042 * Math.max(1, (size / 1024) * 0.73);
  const count = Math.min(6000, Math.round(((sparse * 0.26) / strandArea) * (strength / SIM_STRENGTH)));
  const window = Math.max(4, Math.round(size / 48));
  const maxLen = size * 0.065;
  const pad = 3;
  const boxSide = Math.ceil(maxLen * 2 + pad * 2 + 2);
  const cov = new Float32Array(boxSide * boxSide);
  let drawn = 0;
  let tries = 0;
  while (drawn < count && tries < count * 60) {
    tries++;
    if (tries % 24 === 0) yield;
    const x = Math.floor(minX + rnd() * (maxX - minX + 1));
    const y = Math.floor(minY + rnd() * (maxY - minY + 1));
    const i = y * size + x;
    const m = mask[i]!;
    if (m <= 0.05 || rnd() > m * Math.pow(scalp[i]!, 0.8)) continue;

    const [bx, by] = baseDirection(view, x, y, size, cx, cy);
    const seen = photoDirection(soft, size, x, y, window);
    let dx = seen.dx;
    let dy = seen.dy;
    if (dx * bx + dy * by < 0) {
      dx = -dx;
      dy = -dy;
    }
    const trust = clamp(seen.sure * 1.2 - 0.2, 0, 0.75);
    dx = bx + (dx - bx) * trust;
    dy = by + (dy - by) * trust;
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl;
    dy /= dl;

    const fine = rnd() < 0.4;
    const len = size * (0.022 + rnd() * 0.04);
    const width = Math.max(0.55, (size / 1024) * (fine ? 0.55 : 0.85) * (0.8 + rnd() * 0.4));
    const alpha = (fine ? 0.38 : 0.62) * (0.75 + rnd() * 0.25) * scale;
    const bend = (rnd() - 0.5) * 0.6;
    const shade = 0.85 + rnd() * 0.3;
    const col = [clamp(hair[0] * shade, 0, 255), clamp(hair[1] * shade, 0, 255), clamp(hair[2] * shade, 0, 255)];
    const rot = (a: number, ux: number, uy: number) => [Math.cos(a) * ux - Math.sin(a) * uy, Math.sin(a) * ux + Math.cos(a) * uy];
    const [ex, ey] = rot(bend, dx, dy);
    const [mx, my] = rot(bend * 0.4, dx, dy);
    const p0x = x + 0.5;
    const p0y = y + 0.5;
    const p1x = p0x + mx! * len * 0.5;
    const p1y = p0y + my! * len * 0.5;
    const p2x = p0x + ex! * len;
    const p2y = p0y + ey! * len;

    // Coverage of this one hair, so its overlapping samples don't darken twice.
    const ox = Math.floor(Math.min(p0x, p1x, p2x)) - pad;
    const oy = Math.floor(Math.min(p0y, p1y, p2y)) - pad;
    const bw = Math.min(boxSide, Math.ceil(Math.max(p0x, p1x, p2x)) + pad - ox + 1);
    const bh = Math.min(boxSide, Math.ceil(Math.max(p0y, p1y, p2y)) + pad - oy + 1);
    cov.fill(0, 0, bw * bh);
    const steps = Math.max(4, Math.ceil(len * 2));
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const a = (1 - u) * (1 - u);
      const b = 2 * (1 - u) * u;
      const c = u * u;
      const px = a * p0x + b * p1x + c * p2x;
      const py = a * p0y + b * p1y + c * p2y;
      // Rooted firmly, fading to a fine tip.
      const fade = u < 0.12 ? 0.55 + (u / 0.12) * 0.45 : u > 0.6 ? 1 - ((u - 0.6) / 0.4) * 0.9 : 1;
      const rad = (width / 2) * (u > 0.6 ? 1 - ((u - 0.6) / 0.4) * 0.5 : 1);
      const reach = Math.ceil(rad + 1);
      const cxp = Math.floor(px);
      const cyp = Math.floor(py);
      for (let yy = cyp - reach; yy <= cyp + reach; yy++) {
        const ly = yy - oy;
        if (ly < 0 || ly >= bh) continue;
        for (let xx = cxp - reach; xx <= cxp + reach; xx++) {
          const lx = xx - ox;
          if (lx < 0 || lx >= bw) continue;
          const d = Math.hypot(xx + 0.5 - px, yy + 0.5 - py);
          const v = clamp(rad + 0.5 - d, 0, 1) * fade;
          const k = ly * bw + lx;
          if (v > cov[k]!) cov[k] = v;
        }
      }
    }
    for (let ly = 0; ly < bh; ly++) {
      const yy = oy + ly;
      if (yy < 0 || yy >= size) continue;
      for (let lx = 0; lx < bw; lx++) {
        const v = cov[ly * bw + lx]!;
        if (v <= 0) continue;
        const xx = ox + lx;
        if (xx < 0 || xx >= size) continue;
        const pi = yy * size + xx;
        const a = v * alpha * mask[pi]! * head[pi]!;
        if (a <= 0.002) continue;
        const p = pi * 4;
        out[p] = out[p]! + (col[0]! - out[p]!) * a;
        out[p + 1] = out[p + 1]! + (col[1]! - out[p + 1]!) * a;
        out[p + 2] = out[p + 2]! + (col[2]! - out[p + 2]!) * a;
      }
    }
    drawn++;
  }

  return { rgba: out, strands: drawn };
}
