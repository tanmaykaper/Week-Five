import type { View } from "@/lib/storage/photos";

/**
 * Single-weight line drawings of the three views. Over the camera they are the ghost
 * outline to line up with; on their own they stand in for a photo not taken yet.
 * Drawn in a 100 by 100 box that sits inside the round lens.
 */

function spiral(cx: number, cy: number, turns: number, r: number) {
  const pts: string[] = [];
  const steps = Math.round(turns * 28);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2 - Math.PI / 2;
    const rr = 0.8 + t * r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join("L")}`;
}

const PATHS: Record<View, { solid: string[]; guide: string[] }> = {
  // From above, forehead towards the bottom of the frame.
  crown: {
    solid: [
      "M50 15C66 15 77 28 77 47C77 67 66 84 50 84C34 84 23 67 23 47C23 28 34 15 50 15Z",
      "M23.4 43C19.5 44 19 52.5 23.6 55",
      "M76.6 43C80.5 44 81 52.5 76.4 55",
      "M46.5 84.5C47.5 88 52.5 88 53.5 84.5",
      spiral(53, 38, 1.6, 7),
    ],
    guide: [],
  },
  // Face on, hair pushed back: the eyebrows sit on the dashed line.
  hairline: {
    solid: [
      "M50 13C69 13 78 27 78 45C78 62 71 77 60 85C55 88.5 45 88.5 40 85C29 77 22 62 22 45C22 27 31 13 50 13Z",
      "M22.4 45C18.5 45 17.5 55 22.5 58",
      "M77.6 45C81.5 45 82.5 55 77.5 58",
      "M25 37C27.5 30 32 28.5 36.5 30.5C41 25.5 59 25.5 63.5 30.5C68 28.5 72.5 30 75 37",
      "M42 87.5L41 100M58 87.5L59 100",
    ],
    guide: ["M24 47H76"],
  },
  // Head tilted down: the front hairline near the bottom, the parting running back from it.
  parting: {
    solid: [
      "M50 11C68 11 80 25 80 44C80 63 68 80 50 80C32 80 20 63 20 44C20 25 32 11 50 11Z",
      "M21 40C16.8 41 16.5 50 21.3 52",
      "M79 40C83.2 41 83.5 50 78.7 52",
      "M28.5 68C36 75 64 75 71.5 68",
      "M45.5 14C44.5 28 45.5 50 47.5 72",
    ],
    guide: [],
  },
};

export function HeadGhost({ view, tone = "ink", className = "" }: { view: View; tone?: "ink" | "video"; className?: string }) {
  const { solid, guide } = PATHS[view];
  return (
    <svg viewBox="0 0 100 100" className={`head-ghost ${className}`} data-tone={tone} aria-hidden="true" fill="none">
      {tone === "video" ? (
        <g className="head-ghost-under">
          {solid.map((d) => (
            <path key={d} d={d} vectorEffect="non-scaling-stroke" />
          ))}
          {guide.map((d) => (
            <path key={d} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      ) : null}
      <g className="head-ghost-line">
        {solid.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g className="head-ghost-guide">
        {guide.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
