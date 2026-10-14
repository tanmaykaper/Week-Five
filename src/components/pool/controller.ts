"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { PoolEngine, PoolState, Rig } from "./engine";

/**
 * One pool per page, shared between components that never import three.js themselves.
 * PoolStage creates the engine and attaches it here; the intro, the welcome screen and
 * setup read it with usePool() and move the camera.
 */
let engine: PoolEngine | null = null;
const listeners = new Set<() => void>();
const resizeListeners = new Set<() => void>();

export const poolController = {
  get: () => engine,
  attach(next: PoolEngine) {
    engine = next;
    listeners.forEach((l) => l());
  },
  detach(old: PoolEngine) {
    if (engine !== old) return;
    engine = null;
    listeners.forEach((l) => l());
  },
  resized() {
    resizeListeners.forEach((l) => l());
  },
  onResize(l: () => void) {
    resizeListeners.add(l);
    return () => void resizeListeners.delete(l);
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

export function usePool(): PoolEngine | null {
  return useSyncExternalStore(subscribe, poolController.get, () => null);
}

export type Pose = Partial<Rig & PoolState>;

/**
 * Moves the pool to a pose whenever `key` changes. The first pose a fresh pool sees is
 * applied instantly (with an optional entrance from `enter`), later ones glide. Resizes
 * re-frame instantly, since framings depend on the screen's shape.
 */
export function usePoolPose(make: ((aspect: number) => Pose) | null, key: string, opts: { ms?: number; enter?: Pose } = {}) {
  const pool = usePool();
  const makeRef = useRef(make);
  useEffect(() => {
    makeRef.current = make;
  });

  useEffect(() => {
    if (!pool || !makeRef.current) return;
    const pose = makeRef.current(pool.aspect);
    if (pool.claim()) {
      if (opts.enter) {
        pool.set({ ...pose, ...opts.enter });
        void pool.to(pose, opts.ms ?? 1600);
      } else pool.set(pose);
    } else {
      void pool.to(pose, opts.ms ?? 1100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, key]);

  useEffect(() => {
    if (!pool) return;
    return poolController.onResize(() => {
      if (!makeRef.current) return;
      const pose = makeRef.current(pool.aspect);
      // Only the framing changes on resize; keep the scene where it is.
      pool.set({
        camX: pose.camX,
        camY: pose.camY,
        camZ: pose.camZ,
        tx: pose.tx,
        ty: pose.ty,
        tz: pose.tz,
        shiftX: pose.shiftX,
        shiftY: pose.shiftY,
        fov: pose.fov,
      });
    });
  }, [pool]);
}
