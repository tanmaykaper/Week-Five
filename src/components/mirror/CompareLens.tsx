"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import { forwardRef, useRef, type ReactNode } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { nudgeDivider } from "@/lib/mirror";
import type { View } from "@/lib/storage/photos";

export interface Side {
  url: string;
  alt: string;
}

export type LensPhase = "rest" | "reading" | "marking" | "estimating";

/**
 * Day one and a later photo in one round lens, set at the centre of the rings where day one
 * sits on the map. Day one is on the left of the divider, the later photo on the right.
 * Drag anywhere on the lens, or use the arrow keys on the handle. The optional outline lays
 * day one faintly over the later photo, to check the two line up.
 */
export const CompareLens = forwardRef<
  HTMLDivElement,
  {
    view: View;
    before: Side | null;
    after?: Side | null;
    /** Divider position from the left, 0 to 100. */
    value?: number;
    onChange?: (value: number) => void;
    /** Slider name, for example "Drag to compare day one with week 4". */
    label?: string;
    valueText?: string;
    ghost?: boolean;
    /** The painted area (a PNG whose alpha is the area), shown while the illustration is drawn. */
    mark?: string | null;
    phase?: LensPhase;
    /** Animate the divider to its new place (the illustration's reveal). */
    glide?: boolean;
    size?: "mirror" | "projection";
    children?: ReactNode;
  }
>(function CompareLens(
  { view, before, after = null, value = 50, onChange, label, valueText, ghost = false, mark = null, phase = "rest", glide = false, size = "mirror", children },
  ref,
) {
  const glassRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const comparing = Boolean(before && after);

  const fromPointer = (clientX: number) => {
    const r = glassRef.current?.getBoundingClientRect();
    if (!r || !onChange) return;
    onChange(Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100))));
  };

  return (
    <div
      ref={ref}
      className="cmp"
      data-size={size}
      data-phase={phase}
      data-glide={glide || undefined}
      data-comparing={comparing || undefined}
      style={{ "--p": `${value}%` } as React.CSSProperties}
      onPointerDown={(e) => {
        if (!comparing || e.button !== 0) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) fromPointer(e.clientX);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div ref={glassRef} className="cmp-glass">
        {before ? (
          // Blob URLs from this device; next/image has nothing to optimise here.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cmp-img" src={before.url} alt={before.alt} width={800} height={800} draggable={false} />
        ) : (
          <HeadGhost view={view} className="cmp-drawing" />
        )}
        {after ? (
          <div className="cmp-after">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cmp-img" src={after.url} alt={after.alt} width={800} height={800} draggable={false} />
            {ghost && before ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="cmp-img cmp-ghost" src={before.url} alt="" width={800} height={800} draggable={false} />
            ) : null}
          </div>
        ) : null}
        {mark ? <span className="cmp-mark" style={{ "--mark": `url("${mark}")` } as React.CSSProperties} aria-hidden="true" /> : null}
        {phase === "reading" ? <span className="cmp-scan" aria-hidden="true" /> : null}
        {children}
        {comparing ? <span className="cmp-line" aria-hidden="true" /> : null}
      </div>
      {comparing ? (
        <span
          role="slider"
          tabIndex={0}
          className="cmp-handle"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-valuetext={valueText}
          aria-orientation="horizontal"
          onKeyDown={(e) => {
            const next = nudgeDivider(value, e.key);
            if (next === null || !onChange) return;
            e.preventDefault();
            onChange(next);
          }}
        >
          <CaretLeft size={14} weight="bold" aria-hidden="true" />
          <CaretRight size={14} weight="bold" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
});
