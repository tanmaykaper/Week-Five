"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { LABEL_ANGLE, onRing } from "@/components/pool/geometry";
import { frame, landscapeness, weekFrame } from "@/components/pool/poses";

/**
 * The camera for the map and the week pages: it frames the rings out to the chosen week,
 * lights that ring, keeps "you are here" on the user's own, and stops drawing once the
 * page has scrolled past the water.
 */
export function MapPool({
  selected,
  here,
  season,
  heroRef,
}: {
  selected: number;
  here: number;
  season: [number, number] | null;
  heroRef: React.RefObject<HTMLElement | null>;
}) {
  const pool = usePool();
  const ref = useRef<HTMLDivElement>(null);
  const key = `map|${selected}|${here}|${season?.join("-") ?? "dry"}`;
  const make = useCallback(
    (aspect: number): Pose => ({
      ...frame(weekFrame(selected), aspect),
      dY: 14,
      drop: 0,
      fall: 0,
      ripple: 0,
      map: 1,
      week: here,
      seasonFrom: season?.[0] ?? 0,
      seasonTo: season?.[1] ?? 0,
      shed: 0.8,
      dots: 1,
      cohort: 0,
      labels: 1,
      focus: selected === here ? 0 : 1,
      focusFrom: selected,
      focusTo: selected,
      idle: 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  usePoolPose(make, key, { enter: { map: 0, ripple: 0.4 }, ms: 1200 });

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

  useEffect(() => {
    if (!pool || !ref.current) return;
    const wide = landscapeness(pool.aspect) > 0.5;
    const el = (n: string) => ref.current!.querySelector<HTMLElement>(`[data-label="${n}"]`)!;
    pool.setLabels([
      { el: el("here"), at: onRing(Math.max(1, here), wide ? 0.55 : -1.25), weight: () => (here > 0 ? 1 : 0) },
      { el: el("selected"), at: onRing(selected, wide ? LABEL_ANGLE : -2.1), weight: () => (selected !== here ? 1 : 0) },
    ]);
    return () => pool.setLabels([]);
  }, [pool, here, selected]);

  return (
    <div ref={ref} aria-hidden="true">
      <div className="pool-label" data-label="here" data-tone="accent">
        <span>{here > 0 ? `You are here, week ${here}` : ""}</span>
      </div>
      <div className="pool-label" data-label="selected">
        <span>Week {selected}</span>
      </div>
    </div>
  );
}
