"use client";

import { useEffect, useRef, useState } from "react";
import { poolController } from "./controller";
import { BASE_STATE, frame, WELCOME_FRAME } from "./poses";
import "./pool.css";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * The light 3D pool that sits behind the intro, the welcome screen and setup. It stays
 * mounted while people move between those screens, so the camera can travel instead of
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
          onFirstFrame: () => setLive(true),
        });
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
