/**
 * The pool's layout, shared by the 3D scene and the HTML labels laid over it.
 * Kept free of three.js so pages can import it without loading the scene.
 *
 * The water is the plane y = 0. The drop lands at the origin, and its ripple, seen from
 * above, is the plan: one ring per week, 24 of them.
 */
export const WEEKS = 24;
/** Radius of week 1's ring, in scene units. */
export const R0 = 0.42;
/** Gap between neighbouring week rings. */
export const DR = 0.16;
export const ringRadius = (week: number) => R0 + (week - 1) * DR;
export const OUTER = ringRadius(WEEKS);

/** The shed window and the monthly photo weeks, as drawn on the rings. */
export const SHED_WEEKS: [number, number] = [3, 8];
export const PHOTO_WEEKS = [4, 8, 12, 16, 20, 24] as const;

/** Angles (radians, atan2(z, x)) where things sit on the rings. The camera mostly looks from +z, so -z is "up" on screen. */
export const DOT_ANGLE = -0.9;
/** Labels sit up the screen from the middle (their text runs right): nearly straight up on wide screens, up and left on phones. The photo dots sit up and right, clear of them. */
export const LABEL_ANGLE = -1.45;
export const LABEL_ANGLE_PHONE = -2.05;

export type Vec3 = readonly [number, number, number];

/** A point on week `week`'s ring at `angle`, lifted a hair above the water. */
export function onRing(week: number, angle = LABEL_ANGLE): Vec3 {
  const r = ringRadius(week);
  return [Math.cos(angle) * r, 0.002, Math.sin(angle) * r];
}

/** Where the cohort's drops land during the intro's last beat: inside the rings, spread around. */
export const COHORT_SPOTS: Vec3[] = [
  [-1.9, 0, -1.2],
  [2.4, 0, 0.9],
  [-0.9, 0, 2.3],
  [1.3, 0, -2.6],
  [-2.8, 0, 0.6],
  [0.6, 0, 1.4],
];
