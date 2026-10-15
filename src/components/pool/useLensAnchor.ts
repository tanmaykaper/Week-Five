"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PoolEngine } from "./engine";
import { lensRig } from "./poses";

/**
 * Keeps the rings' centre under a round element on the page (a lens, a photo), while the
 * page scrolls or reflows. `rig(rim?)` builds the camera for the element as it is now (the rim
 * week can depend on the element's radius, see rimBelow) and
 * remembers the shift it used; the effect then offsets the picture so the centre follows
 * the element, and folds that offset back into the camera when the anchor ends, so
 * nothing jumps.
 */
export function useLensAnchor(pool: PoolEngine | null, active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const anchor = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const resync = useRef<(() => void) | null>(null);

  const rig = useCallback((rim?: number | ((radiusPx: number) => number)) => {
    const el = ref.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const rimWeek = typeof rim === "function" ? rim(r.width / 2) : rim;
    const out = lensRig(r.left + r.width / 2, r.top + window.scrollY + r.height / 2, r.width / 2, window.innerWidth, window.innerHeight, rimWeek);
    anchor.current = { x: out.shiftX, y: out.shiftY };
    // The anchor moved: line the offset up with it on the next frame.
    requestAnimationFrame(() => resync.current?.());
    return out;
  }, []);

  useEffect(() => {
    if (!pool || !active) return;
    const sync = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2) / window.innerWidth - 0.5 - anchor.current.x;
      const y = (r.top + r.height / 2) / window.innerHeight - 0.5 - anchor.current.y;
      offset.current = { x, y };
      pool.setOffset(x, y);
    };
    resync.current = sync;
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(document.body);
    return () => {
      resync.current = null;
      window.removeEventListener("scroll", sync);
      ro.disconnect();
      const o = offset.current;
      if (o.x || o.y) pool.set({ shiftX: pool.rig.shiftX + o.x, shiftY: pool.rig.shiftY + o.y });
      pool.setOffset(0, 0);
      offset.current = { x: 0, y: 0 };
    };
  }, [pool, active]);

  return { ref, rig };
}
