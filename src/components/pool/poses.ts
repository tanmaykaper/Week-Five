import type { PoolState, Rig } from "./engine";
import { DR, R0, ringRadius } from "./geometry";

/**
 * Camera framings and scene states, by name. Framings are written for a landscape
 * screen and adapted for portrait: the camera backs away from its target and the
 * target moves up the screen, so phone text can sit underneath.
 */

type V3 = [number, number, number];

export interface Framing {
  cam: V3;
  at: V3;
  fov?: number;
  /** Where the target sits on a landscape screen, as a fraction of the viewport. */
  shift?: [number, number];
  /** On portrait screens. */
  phoneShift?: [number, number];
  /** How much further back the camera sits on portrait screens. */
  phoneZoom?: number;
}

/** 0 on portrait phones, 1 on landscape screens, in between for squarish windows. */
export const landscapeness = (aspect: number) => Math.min(1, Math.max(0, (aspect - 0.8) / 0.5));

export function frame(f: Framing, aspect: number): Rig {
  const l = landscapeness(aspect);
  const zoom = 1 + ((f.phoneZoom ?? 1.5) - 1) * (1 - l);
  const [sx, sy] = f.shift ?? [0, 0];
  const [px, py] = f.phoneShift ?? [0, -0.14];
  return {
    camX: f.at[0] + (f.cam[0] - f.at[0]) * zoom,
    camY: f.at[1] + (f.cam[1] - f.at[1]) * zoom,
    camZ: f.at[2] + (f.cam[2] - f.at[2]) * zoom,
    tx: f.at[0],
    ty: f.at[1],
    tz: f.at[2],
    fov: f.fov ?? 32,
    shiftX: px + (sx - px) * l,
    shiftY: py + (sy - py) * l,
  };
}

export const BASE_STATE: PoolState = {
  dX: 0,
  dY: 2,
  dZ: 0,
  tilt: 1.05,
  spin: -0.4,
  squeeze: 0,
  level: 0.62,
  drop: 0,
  fall: 0,
  ripple: 0,
  map: 0,
  week: 0,
  seasonFrom: 0,
  seasonTo: 0,
  focusFrom: 0,
  focusTo: 0,
  focus: 0,
  shed: 0,
  dots: 0,
  cohort: 0,
  labels: 0,
  idle: 1,
  fog: 1,
};

/** The intro's camera, beat by beat. */
export const INTRO_FRAMES = {
  hero: { cam: [2.3, 2.45, 5.4], at: [0.25, 1.7, 0], fov: 30, shift: [0.2, 0.03], phoneShift: [0, -0.17], phoneZoom: 1.7 },
  upright: { cam: [1.6, 2.35, 4.5], at: [0, 1.85, 0], fov: 30, shift: [0.2, 0], phoneShift: [0, -0.16], phoneZoom: 1.6 },
  tip: { cam: [0.62, 1.05, 1.7], at: [0, 0.74, 0], fov: 28, shift: [0.16, 0], phoneShift: [0, -0.15], phoneZoom: 1.6 },
  fall: { cam: [0.95, 0.5, 2.2], at: [0, 0.14, 0], fov: 30, shift: [0.16, -0.02], phoneShift: [0, -0.12], phoneZoom: 1.6 },
  map: { cam: [0.2, 12.2, 5.0], at: [0, 0, -0.2], fov: 34, shift: [0.25, 0.04], phoneShift: [0, -0.12], phoneZoom: 1.7 },
  cohort: { cam: [3.4, 9.4, 6.2], at: [0, 0, 0], fov: 34, shift: [0.25, 0.02], phoneShift: [0, -0.12], phoneZoom: 1.9 },
  end: { cam: [0.4, 11.6, 3.0], at: [0, 0, -0.1], fov: 34, shift: [0.24, 0], phoneShift: [0, -0.12], phoneZoom: 1.95 },
} satisfies Record<string, Framing>;

/** After the intro: the plan's rings spread out on the right, calm water under the welcome text. */
export const WELCOME_FRAME: Framing = {
  cam: [-1.5, 2.7, 6.1],
  at: [0.7, 0, 0.3],
  fov: 30,
  shift: [0.22, 0.13],
  phoneShift: [0, -0.24],
  phoneZoom: 1.25,
};

export const WELCOME_STATE: Partial<PoolState> = {
  dY: 14,
  drop: 0,
  fall: 0,
  ripple: 0,
  map: 1,
  shed: 0.6,
  dots: 0,
  cohort: 0,
  labels: 0,
  idle: 1,
  week: 0,
};

/** Setup: the camera takes a different view of the pool for each question. */
const step = (cam: V3, at: V3, extra: Partial<Framing> = {}): Framing => ({
  cam,
  at,
  fov: 30,
  shift: [0.25, 0.08],
  phoneShift: [0, -0.27],
  phoneZoom: 1.55,
  ...extra,
});

export const SETUP_FRAMES = {
  name: step([2.4, 1.6, 6.2], [0.5, 0, 0]),
  age: step([-4.2, 2.8, 5.4], [0.4, 0, 0]),
  city: step([0.4, 9.6, 5.2], [0, 0, -0.3], { fov: 34, phoneZoom: 1.9 }),
  products: step([2.6, 2.6, 5.6], [0, 1.45, 0], { phoneZoom: 1.9, phoneShift: [0.3, -0.22] }),
  channel: step([-1.4, 4.4, 6.8], [0.3, 0, -0.4]),
  start: step([-0.5, 10, 4.6], [0, 0, -0.3], { fov: 34, phoneZoom: 1.9 }),
  worries: step([1.9, 1.25, 4.4], [0.2, 0.1, -0.7], { phoneShift: [0, -0.16] }),
  letter: step([0, 0.55, 6.8], [0, 0.22, 0], { shift: [0.25, 0.14], phoneShift: [0, -0.3] }),
  reminders: step([3.8, 5.4, 5.6], [0, 0, 0]),
  finish: step([0.3, 11.2, 3.6], [0, 0, -0.1], { fov: 34, phoneZoom: 1.9 }),
  briefing: step([0.8, 8.4, 6.4], [0, 0, -0.4], { fov: 34, phoneZoom: 1.9 }),
} satisfies Record<string, Framing>;

export type SetupFrame = keyof typeof SETUP_FRAMES;

/** Baseline photos: a view along the photo-day dots, then the map with week 4 picked out. */
export const BASELINE_FRAMES = {
  intro: step([1.6, 5.8, 6.2], [0.45, 0, -0.5], { shift: [0.27, 0.1], phoneShift: [-0.08, -0.25], phoneZoom: 1.55 }),
  done: step([0.3, 10.6, 4.2], [0, 0, -0.2], { fov: 34, phoneShift: [-0.12, -0.27], phoneZoom: 1.45 }),
} satisfies Record<string, Framing>;

/** By default the lens's rim sits between weeks 4 and 5: the rings from week 5 out show around it. */
export const LENS_RIM_WEEK = 4.5;

/**
 * Looking straight down on the rings, with their centre under a round element on the page
 * (the camera lens), scaled so the lens covers the weeks up to `rimWeek` (by default the
 * first four). The mirror raises the rim to the week a photo was taken, so everything up
 * to then sits under the lens and that week's ring hugs its edge. `cy` is measured as if
 * the page were not scrolled; the scroll is applied separately as an offset.
 */
export function lensRig(cx: number, cy: number, radius: number, width: number, height: number, rimWeek = LENS_RIM_WEEK): Rig {
  const fov = 30;
  const dist = (height * ringRadius(rimWeek)) / (Math.max(40, radius) * 2 * Math.tan((fov * Math.PI) / 360));
  return {
    camX: 0,
    camY: dist,
    camZ: dist * 0.06,
    tx: 0,
    ty: 0,
    tz: 0,
    fov,
    shiftX: cx / width - 0.5,
    shiftY: cy / height - 0.5,
  };
}

/**
 * The rim week that leaves `week`'s ring about `gapPx` outside a lens of `radiusPx`, so the
 * ring stays visible beside the glass at any scale (half a week would vanish under the rim
 * once the rings are small).
 */
export function rimBelow(week: number, radiusPx: number, gapPx = 24): number {
  const r = ringRadius(week) / (1 + gapPx / Math.max(40, radiusPx));
  return Math.max(1, 1 + (r - R0) / DR);
}

/** Fog reach for a camera this high: none of the usual fade until the camera is past the usual range. */
export const fogFor = (rig: Pick<Rig, "camY">) => Math.max(1, rig.camY / 10);

/** Today: the plan seen from above and a little in front, the rings spread on the right. */
export const TODAY_FRAME: Framing = {
  cam: [-0.3, 9.2, 6.4],
  at: [0.45, 0, -0.55],
  fov: 34,
  shift: [0.24, 0.03],
  phoneShift: [0, -0.33],
  phoneZoom: 1.95,
};

/**
 * The map: the camera pulls out ring by ring. For week n it frames the rings out to n (and a
 * little beyond), from a slightly turned angle, so stepping through the weeks travels outward.
 */
export function weekFrame(n: number): Framing {
  const r = ringRadius(Math.max(1, Math.min(24, n)));
  const dist = 2.4 + r * 2.35;
  const az = -0.42 + n * 0.035;
  return {
    cam: [Math.sin(az) * dist * 0.42, dist * 0.82, Math.cos(az) * dist * 0.56],
    at: [0, 0, -0.15],
    fov: 34,
    shift: [0.24, 0.05],
    phoneShift: [0, -0.3],
    phoneZoom: 1.55,
  };
}
