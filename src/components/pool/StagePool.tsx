"use client";

import { useEffect, useRef } from "react";
import { usePool, usePoolPose, type Pose } from "./controller";
import type { Vec3 } from "./geometry";
import { landscapeness } from "./poses";

export interface StageLabel {
  name: string;
  text: string;
  tone?: "accent" | "amber" | "rain";
  at: Vec3;
  /** Whether it shows, given a landscape (true) or portrait (false) screen. */
  show: (wide: boolean) => boolean;
}

/**
 * The camera for an app page on the pool (Supply, Mates, You): poses it whenever `poseKey`
 * changes, lays labels on the rings, and stops drawing once the sheet has covered the water.
 */
export function StagePool({
  pose,
  poseKey,
  heroRef,
  labels = [],
  ms = 1600,
}: {
  pose: (aspect: number) => Pose;
  poseKey: string;
  heroRef: React.RefObject<HTMLElement | null>;
  labels?: StageLabel[];
  ms?: number;
}) {
  const pool = usePool();
  const ref = useRef<HTMLDivElement>(null);
  // usePoolPose keeps the latest pose and only moves the camera when the key changes.
  usePoolPose(pose, poseKey, { enter: { map: 0, ripple: 0.4 }, ms });

  useEffect(() => {
    const hero = heroRef.current;
    if (!pool || !hero) return;
    const io = new IntersectionObserver(([e]) => pool.setPaused(!e!.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => {
      io.disconnect();
      pool.setPaused(false);
    };
  }, [pool, heroRef]);

  const labelKey = labels.map((l) => `${l.name}:${l.text}:${l.at.join(",")}`).join("|");
  useEffect(() => {
    if (!pool || !ref.current) return;
    const wide = landscapeness(pool.aspect) > 0.5;
    const root = ref.current;
    pool.setLabels(
      labels.map((l) => ({
        el: root.querySelector<HTMLElement>(`[data-label="${l.name}"]`)!,
        at: l.at,
        weight: () => (l.show(wide) ? 1 : 0),
      })),
    );
    return () => pool.setLabels([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, labelKey]);

  return (
    <div ref={ref} aria-hidden="true">
      {labels.map((l) => (
        <div key={l.name} className="pool-label" data-label={l.name} data-tone={l.tone}>
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}
