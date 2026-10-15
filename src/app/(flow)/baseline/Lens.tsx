"use client";

import { forwardRef, type ReactNode } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { lightStatus, meterPosition } from "@/lib/camera";
import type { View } from "@/lib/storage/photos";

/**
 * The lens: a round window at the centre of the 24 rings, where day one sits on the map.
 * It shows the live camera with the ghost outline, a still to keep or retake, or the
 * photo being painted on. The pool's camera is aimed so the rings spread out around it.
 */
export const Lens = forwardRef<
  HTMLDivElement,
  {
    view: View;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    live?: boolean;
    mirrored?: boolean;
    still?: string | null;
    count?: number | null;
    flash?: number;
    ghost?: boolean;
    /** The day-one photo, laid faintly over the live camera for monthly photos (it replaces the outline). */
    guide?: string | null;
    label: string;
    children?: ReactNode;
  }
>(function Lens({ view, videoRef, live = false, mirrored = false, still, count = null, flash = 0, ghost = true, guide = null, label, children }, ref) {
  return (
    <div ref={ref} className="bl-lens" data-live={live || undefined} data-still={still ? true : undefined} role="img" aria-label={label}>
      <div className="bl-lens-glass">
        {videoRef ? (
          <video ref={videoRef} className="bl-video" data-mirrored={mirrored || undefined} muted playsInline autoPlay aria-hidden="true" />
        ) : null}
        {still ? (
          // A blob URL from this device; next/image has nothing to optimise here.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={still} src={still} alt="" className="bl-still" width={800} height={800} />
        ) : null}
        {children}
        {guide && !still ? (
          // Mirrored with the preview, so it lines up with what the person sees.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guide} alt="" className="bl-guide" data-mirrored={mirrored || undefined} width={800} height={800} />
        ) : ghost && !still ? (
          <HeadGhost view={view} tone={live ? "video" : "ink"} className="bl-ghost" />
        ) : null}
        {count ? (
          <span key={count} className="bl-count" aria-hidden="true">
            {count}
          </span>
        ) : null}
        {flash ? <span key={flash} className="bl-flash" aria-hidden="true" /> : null}
      </div>
      {count ? <span key={`r${count}`} className="bl-count-ring" aria-hidden="true" /> : null}
    </div>
  );
});

/** A small light meter: dark on the left, bright on the right, the good stretch marked. */
export function LightMeter({ luminance, text }: { luminance: number | null; text: string }) {
  const status = luminance === null ? null : lightStatus(luminance);
  return (
    <p className="bl-meter" data-status={status ?? "reading"}>
      <span className="bl-meter-track" aria-hidden="true">
        <span className="bl-meter-good" />
        <span className="bl-meter-pos" style={{ transform: `translateX(${(meterPosition(luminance ?? 128) * 100).toFixed(1)}%)` }}>
          <span className="bl-meter-dot" />
        </span>
      </span>
      <span>{text}</span>
    </p>
  );
}
