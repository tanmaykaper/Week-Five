"use client";

import { useEffect, useRef, useState } from "react";
import { poolController } from "./controller";
import type { PoolPalette } from "./engine";
import { BASE_STATE, frame, WELCOME_FRAME } from "./poses";
import "./pool.css";

/** The water's colours come from the --pool-* tokens around it, so it follows the theme. */
function readPalette(el: Element): PoolPalette {
  const css = getComputedStyle(el);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ground: v("--pool-ground", "#f1f4f7"),
    water: v("--pool-water", "#e3e9ef"),
    skyLow: v("--pool-sky-low", "#fbfcfd"),
    skyHigh: v("--pool-sky-high", "#d6e0ea"),
    ink: v("--pool-ink", "#0f1e33"),
    accent: v("--pool-accent", "#22548a"),
    amber: v("--pool-amber", "#c98a12"),
    rain: v("--pool-rain", "#3f7fc7"),
  };
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * The 3D pool behind the intro, the welcome screen, setup, the day-one photos and Today.
 * In the flow it stays mounted between screens, so the camera can travel instead of
 * cutting. Before WebGL is ready (or without it) a static drawing of the rings stands in.
 */
export function PoolStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webglAvailable()) return;
    let cancelled = false;
    let dispose = () => {};
    (async () => {
      try {
        const { PoolEngine } = await import("./engine");
        if (cancelled) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        const engine = new PoolEngine(canvas, {
          reduced,
          rig: frame(WELCOME_FRAME, aspect),
          state: { ...BASE_STATE, dY: 14, map: 0 },
          palette: readPalette(canvas),
          onFirstFrame: () => setLive(true),
        });
        // App pages can switch between light and dark; the flow screens are always light.
        const themeWatch = new MutationObserver(() => engine.setPalette(readPalette(canvas)));
        themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        const ro = new ResizeObserver(() => {
          engine.resize();
          poolController.resized();
        });
        ro.observe(canvas.parentElement!);
        const lost = (e: Event) => {
          e.preventDefault();
          setLive(false);
        };
        canvas.addEventListener("webglcontextlost", lost);
        poolController.attach(engine);
        dispose = () => {
          ro.disconnect();
          themeWatch.disconnect();
          canvas.removeEventListener("webglcontextlost", lost);
          poolController.detach(engine);
          engine.dispose();
        };
      } catch {
        // No 3D: the drawing stays.
      }
    })();
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <div className="pool" data-live={live || undefined} aria-hidden="true">
      <svg className="pool-poster" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx="690" cy="430" rx={40 + i * 46} ry={14 + i * 16.5} />
        ))}
      </svg>
      <canvas ref={canvasRef} />
    </div>
  );
}
