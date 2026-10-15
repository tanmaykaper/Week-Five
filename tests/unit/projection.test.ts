import { describe, expect, it } from "vitest";
import { feather, maskArea, prepareMask, simulate, simulateAsync, SIM_STRENGTH } from "@/lib/providers/prediction/sim-core";
import { remoteModel } from "@/lib/providers/prediction/remote";
import { mulberry32 } from "@/lib/rng";

const SIZE = 128;

/** A drawn scalp: skin, with dark hairs everywhere except a thin patch in the middle. */
function scalpPhoto(): Uint8ClampedArray {
  const px = new Uint8ClampedArray(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) px.set([206, 164, 136, 255], i * 4);
  const rnd = mulberry32(7);
  for (let s = 0; s < 1400; s++) {
    const x0 = rnd() * SIZE;
    const y0 = rnd() * SIZE;
    if (Math.hypot(x0 - 64, y0 - 64) < 26 && rnd() < 0.85) continue;
    for (let t = 0; t < 9; t++) {
      const x = Math.floor(x0 + t * 0.4);
      const y = Math.floor(y0 - t);
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
      px.set([38, 30, 26, 255], (y * SIZE + x) * 4);
    }
  }
  return px;
}

/** The painter's alpha: a soft disc over the thin patch. */
function paintedDisc(r = 24): Uint8ClampedArray {
  const a = new Uint8ClampedArray(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) a[y * SIZE + x] = Math.hypot(x - 64, y - 64) < r ? 140 : 0;
  return a;
}

const meanLuma = (px: Uint8ClampedArray, keep: (i: number) => boolean) => {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (!keep(i)) continue;
    sum += 0.2126 * px[i * 4]! + 0.7152 * px[i * 4 + 1]! + 0.0722 * px[i * 4 + 2]!;
    n++;
  }
  return sum / n;
};

describe("the painted area", () => {
  it("counts anything painted as inside, and feathers the edge", () => {
    const mask = prepareMask(paintedDisc(), SIZE);
    expect(mask[64 * SIZE + 64]).toBeCloseTo(1, 2);
    expect(mask[64 * SIZE + 64 + 24]!).toBeGreaterThan(0.2);
    expect(mask[64 * SIZE + 64 + 24]!).toBeLessThan(0.8);
    expect(mask[4 * SIZE + 4]).toBe(0);
  });

  it("measures the share of the picture painted", () => {
    expect(maskArea(prepareMask(new Uint8ClampedArray(SIZE * SIZE), SIZE))).toBe(0);
    const area = maskArea(prepareMask(paintedDisc(), SIZE));
    expect(area).toBeGreaterThan(0.1);
    expect(area).toBeLessThan(0.16);
  });

  it("feathering keeps a flat field flat", () => {
    const flat = new Float32Array(64 * 64).fill(1);
    expect(feather(flat, 64, 4).every((v) => Math.abs(v - 1) < 1e-5)).toBe(true);
  });
});

describe("the week-24 illustration", () => {
  const photo = scalpPhoto();
  const mask = prepareMask(paintedDisc(), SIZE);
  const run = (strength?: number, seed = 42) => simulate({ rgba: photo, mask, size: SIZE, view: "crown", seed, strength });

  it("is the same picture every time for the same input", () => {
    const a = run();
    const b = run();
    expect(a.strands).toBeGreaterThan(20);
    expect(Buffer.from(a.rgba).equals(Buffer.from(b.rgba))).toBe(true);
  });

  it("gives the same picture when drawn in slices", async () => {
    const whole = run();
    const sliced = await simulateAsync({ rgba: photo, mask, size: SIZE, view: "crown", seed: 42 }, 0);
    expect(sliced.strands).toBe(whole.strands);
    expect(Buffer.from(sliced.rgba).equals(Buffer.from(whole.rgba))).toBe(true);
  });

  it("never touches a pixel outside the painted area", () => {
    const { rgba } = run();
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (mask[i]! > 0) continue;
      expect(rgba[i * 4]).toBe(photo[i * 4]);
      expect(rgba[i * 4 + 1]).toBe(photo[i * 4 + 1]);
      expect(rgba[i * 4 + 2]).toBe(photo[i * 4 + 2]);
    }
  });

  it("changes the area visibly but modestly: one typical case, not a best case", () => {
    const { rgba } = run();
    const inside = (i: number) => mask[i]! > 0.9;
    const before = meanLuma(photo, inside);
    const after = meanLuma(rgba, inside);
    expect(after).toBeLessThan(before - 4);
    // The thin patch gets a little denser; it does not turn into the hair around it.
    const around = meanLuma(photo, (i) => mask[i]! === 0);
    expect(after - around).toBeGreaterThan((before - around) * 0.55);
  });

  it("does nothing with no area or no strength", () => {
    const empty = simulate({ rgba: photo, mask: new Float32Array(SIZE * SIZE), size: SIZE, view: "parting", seed: 1 });
    expect(empty.strands).toBe(0);
    expect(Buffer.from(empty.rgba).equals(Buffer.from(photo))).toBe(true);
    expect(Buffer.from(run(0).rgba).equals(Buffer.from(photo))).toBe(true);
  });

  it("uses the same small strength by default, and a bigger one would change more", () => {
    const base = meanLuma(run().rgba, (i) => mask[i]! > 0.9);
    const strong = meanLuma(run(SIM_STRENGTH * 2).rgba, (i) => mask[i]! > 0.9);
    expect(strong).toBeLessThan(base);
  });

  it("keeps hair off the wall when the painted area spills past the head", () => {
    // Skin on the left half, a pale grey wall on the right, the area painted across both.
    const px = new Uint8ClampedArray(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) px.set(x < 64 ? [206, 164, 136, 255] : [214, 212, 206, 255], (y * SIZE + x) * 4);
    for (let s = 0; s < 400; s++) {
      const x = Math.floor((s * 37) % 60);
      const y = Math.floor((s * 53) % SIZE);
      px.set([38, 30, 26, 255], (y * SIZE + x) * 4);
    }
    const { rgba, strands } = simulate({ rgba: px, mask, size: SIZE, view: "hairline", seed: 9 });
    expect(strands).toBeGreaterThan(0);
    for (let i = 0; i < SIZE * SIZE; i++) {
      if (px[i * 4] !== 214) continue;
      expect([rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]]).toEqual([214, 212, 206]);
    }
  });

  it("works for every view", () => {
    for (const view of ["crown", "hairline", "parting"] as const) {
      const r = simulate({ rgba: photo, mask, size: SIZE, view, seed: 3 });
      expect(r.strands).toBeGreaterThan(0);
    }
  });
});

describe("the remote model", () => {
  it("is switched off in this build", async () => {
    expect(await remoteModel.available()).toBe(false);
    await expect(remoteModel.predict({ baseline: new Blob(), mask: new Blob(), view: "crown", day: 1 })).rejects.toThrow();
  });
});
