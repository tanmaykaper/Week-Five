import type { Ref } from "react";

/** Where the tip sits inside the drawing, as a share of its height. The drop forms here. */
export const TIP_Y = 306 / 320;

/**
 * A glass dropper in single-weight line art. The bulb and the liquid are separate
 * groups so the intro can squeeze one and lower the other. Rotation happens on the
 * HTML wrapper, which keeps it on the compositor.
 */
export function Dropper({
  className,
  bulbRef,
  liquidRef,
  liquidOffset = 0,
}: {
  className?: string;
  bulbRef?: Ref<SVGGElement>;
  liquidRef?: Ref<SVGGElement>;
  liquidOffset?: number;
}) {
  return (
    <svg viewBox="0 0 120 320" className={className} aria-hidden="true" fill="none">
      <defs>
        <clipPath id="wf-tube-inner">
          <path d="M47.5 106 V262 L58.4 302.5 a1.8 1.8 0 0 0 3.2 0 L72.5 262 V106 Z" />
        </clipPath>
      </defs>

      {/* Liquid, clipped to the inside of the glass */}
      <g clipPath="url(#wf-tube-inner)">
        <g ref={liquidRef} transform={`translate(0 ${liquidOffset})`}>
          <rect x="40" y="140" width="40" height="190" fill="var(--intro-liquid)" />
          <rect x="40" y="140" width="40" height="1.6" fill="var(--intro-liquid-top)" />
        </g>
      </g>

      {/* Glass tube and tapered tip */}
      <path
        d="M45 104 V262 L57 304.5 a3.2 3.2 0 0 0 6 0 L75 262 V104"
        stroke="var(--intro-line)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Graduations */}
      {[134, 158, 182, 206, 230].map((y, i) => (
        <path key={y} d={`M45 ${y} h${i % 2 ? 5 : 8}`} stroke="var(--intro-line)" strokeWidth="1" opacity="0.55" />
      ))}
      {/* A thin reflection down the glass */}
      <path d="M69 114 V250" stroke="var(--intro-line)" strokeWidth="1" opacity="0.22" strokeLinecap="round" />

      {/* Rubber bulb */}
      <g ref={bulbRef}>
        <path
          d="M37 92 V44 a23 23 0 0 1 46 0 V92 Z"
          fill="var(--intro-bulb)"
          stroke="var(--intro-line)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M44 50 a16 16 0 0 1 10 -17" stroke="var(--intro-line)" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      </g>
      {/* Collar */}
      <rect x="32" y="92" width="56" height="12" rx="3" fill="var(--intro-bg)" stroke="var(--intro-line)" strokeWidth="1.5" />
    </svg>
  );
}
