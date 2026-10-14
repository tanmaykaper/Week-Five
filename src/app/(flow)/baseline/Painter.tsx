"use client";

import { ArrowCounterClockwise, Check, Eraser } from "@phosphor-icons/react/ssr";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Pair } from "@/components/ui/primitives";
import { PAINTER, VIEW_COPY, VIEWS } from "@/content/baseline";
import { deleteMask, getMask, putMask, type PhotoRecord, type View } from "@/lib/storage/photos";
import type { Mode } from "@/lib/storage/keys";
import { Lens } from "./Lens";

const SIZE = 512;
const UNDO_LIMIT = 15;

type Shot = { rec: PhotoRecord; url: string };

function hasPaint(img: ImageData): boolean {
  const d = img.data;
  for (let i = 3; i < d.length; i += 16) if (d[i]! > 8) return true;
  return false;
}

/** A soft round stamp; strokes are rows of these, close enough to read as one line. */
function stamp(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, "rgba(34, 84, 138, 0.42)");
  g.addColorStop(0.55, "rgba(34, 84, 138, 0.26)");
  g.addColorStop(1, "rgba(34, 84, 138, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The area painter: a soft brush over one of the day-one photos. What is painted is
 * saved as a PNG whose alpha is the area, used only by the projection (Phase 7).
 * Undo, Clear and a keyboard path ("Mark the middle for me") sit beside it.
 */
export function Painter({
  mode,
  shots,
  first,
  lensRef,
  onDone,
  onSkip,
}: {
  mode: Mode;
  shots: Partial<Record<View, Shot>>;
  first: View;
  lensRef: React.RefObject<HTMLDivElement | null>;
  onDone: (painted: Partial<Record<View, boolean>>) => void;
  onSkip: () => void;
}) {
  const views = VIEWS.filter((v) => shots[v]);
  const [view, setView] = useState<View>(shots[first] ? first : views[0]!);
  const [size, setSize] = useState(PAINTER.sizes[1]!);
  const [painted, setPainted] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const undo = useRef<ImageData[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const stash = useRef<Partial<Record<View, ImageData>>>({});
  const stroke = useRef<{ x: number; y: number } | null>(null);
  const [coarse, setCoarse] = useState(true);

  useEffect(() => {
    const m = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  // Open a view: what was painted earlier in this visit, else the saved mask, else nothing.
  useEffect(() => {
    const c = ctx();
    if (!c) return;
    let cancelled = false;
    const kept = stash.current;
    c.clearRect(0, 0, SIZE, SIZE);
    undo.current = [];
    const held = kept[view];
    if (held) {
      c.putImageData(held, 0, 0);
      queueMicrotask(() => {
        if (!cancelled) {
          setUndoCount(0);
          setPainted(hasPaint(held));
        }
      });
      return;
    }
    const photo = shots[view]?.rec;
    void (async () => {
      const mask = photo ? await getMask(mode, photo.id) : undefined;
      if (cancelled) return;
      if (mask) {
        const bitmap = await createImageBitmap(mask.blob);
        if (cancelled) return;
        c.drawImage(bitmap, 0, 0, SIZE, SIZE);
        bitmap.close();
      }
      setUndoCount(0);
      setPainted(Boolean(mask));
    })();
    return () => {
      cancelled = true;
      kept[view] = c.getImageData(0, 0, SIZE, SIZE);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const remember = useCallback(() => {
    const c = ctx();
    if (!c) return;
    undo.current.push(c.getImageData(0, 0, SIZE, SIZE));
    if (undo.current.length > UNDO_LIMIT) undo.current.shift();
    setUndoCount(undo.current.length);
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  };

  const radius = size.radius * SIZE;

  /** Stamps from the last stamp towards the pointer; returns where the last stamp landed. */
  const line = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const c = ctx();
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, radius / 4);
    if (!c || dist < step) return from;
    let t = step;
    for (; t <= dist; t += step) stamp(c, from.x + ((to.x - from.x) * t) / dist, from.y + ((to.y - from.y) * t) / dist, radius);
    t -= step;
    return { x: from.x + ((to.x - from.x) * t) / dist, y: from.y + ((to.y - from.y) * t) / dist };
  };

  const save = async () => {
    setBusy(true);
    const c = ctx();
    if (c) stash.current[view] = c.getImageData(0, 0, SIZE, SIZE);
    const result: Partial<Record<View, boolean>> = {};
    const scratch = document.createElement("canvas");
    scratch.width = SIZE;
    scratch.height = SIZE;
    const sctx = scratch.getContext("2d")!;
    for (const v of views) {
      const img = stash.current[v];
      const photo = shots[v]!.rec;
      if (!img) continue; // never opened in this visit: leave whatever was saved
      if (hasPaint(img)) {
        sctx.clearRect(0, 0, SIZE, SIZE);
        sctx.putImageData(img, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) => scratch.toBlob(resolve, "image/png"));
        if (blob) await putMask(mode, { photoId: photo.id, blob });
        result[v] = true;
      } else {
        await deleteMask(mode, photo.id);
        result[v] = false;
      }
    }
    onDone(result);
  };

  return (
    <div className="bl-stage">
      <div className="bl-words">
        <Pair id="bl-title" title={PAINTER.title} turn={PAINTER.turn} className="ob-q ob-in" style={{ "--i": 0 } as React.CSSProperties} />
        <p className="bl-how ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {coarse ? PAINTER.lead : PAINTER.leadPointer}
        </p>

        <div className="bl-tools ob-in" style={{ "--i": 2 } as React.CSSProperties}>
          {views.length > 1 ? (
            <div role="radiogroup" aria-label="Photo" className="ob-chips">
              {views.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={view === v} className="ob-chip" onClick={() => setView(v)}>
                  {view === v ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
                  {VIEW_COPY[v].name}
                </button>
              ))}
            </div>
          ) : null}
          <div role="radiogroup" aria-label={PAINTER.brush} className="bl-sizes">
            <span className="text-sm font-medium text-text-2">{PAINTER.brush}</span>
            {PAINTER.sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={size.id === s.id}
                aria-label={s.label}
                className="bl-size"
                onClick={() => setSize(s)}
              >
                <i style={{ width: `${8 + s.radius * 140}px`, height: `${8 + s.radius * 140}px` }} />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="quiet"
              className="h-11 px-4"
              disabled={undoCount === 0}
              onClick={() => {
                const c = ctx();
                const last = undo.current.pop();
                if (!c || !last) return;
                c.putImageData(last, 0, 0);
                setUndoCount(undo.current.length);
                setPainted(hasPaint(last));
              }}
            >
              <ArrowCounterClockwise size={17} aria-hidden="true" />
              {PAINTER.undo}
            </Button>
            <Button
              variant="quiet"
              className="h-11 px-4"
              disabled={!painted}
              onClick={() => {
                remember();
                ctx()?.clearRect(0, 0, SIZE, SIZE);
                setPainted(false);
              }}
            >
              <Eraser size={17} aria-hidden="true" />
              {PAINTER.clear}
            </Button>
            <Button
              variant="quiet"
              className="h-11 px-4"
              onClick={() => {
                const c = ctx();
                if (!c) return;
                remember();
                for (let i = 0; i < 26; i++) {
                  const a = (i / 26) * Math.PI * 2;
                  stamp(c, SIZE / 2 + Math.cos(a) * SIZE * 0.13, SIZE / 2 + Math.sin(a) * SIZE * 0.1, SIZE * 0.12);
                }
                stamp(c, SIZE / 2, SIZE / 2, SIZE * 0.16);
                setPainted(true);
              }}
            >
              {PAINTER.middle}
            </Button>
          </div>
        </div>

        <p className="ob-live ob-in" style={{ "--i": 3 } as React.CSSProperties} aria-live="polite">
          {painted ? null : PAINTER.empty}
        </p>

        <div className="bl-actions ob-in" style={{ "--i": 4 } as React.CSSProperties}>
          <Button onClick={save} disabled={busy}>
            {PAINTER.done}
          </Button>
          <Button variant="quiet" onClick={onSkip} disabled={busy}>
            {PAINTER.skip}
          </Button>
        </div>
      </div>

      <div className="bl-lens-wrap">
        <Lens ref={lensRef} view={view} still={shots[view]?.url ?? null} ghost={false} label={`Your ${VIEW_COPY[view].name.toLowerCase()} photo, with the area you paint shown in blue.`}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="bl-paint"
            aria-hidden="true"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              remember();
              const p = point(e);
              stroke.current = p;
              const c = ctx();
              if (c) stamp(c, p.x, p.y, radius);
              setPainted(true);
            }}
            onPointerMove={(e) => {
              if (!stroke.current) return;
              stroke.current = line(stroke.current, point(e));
            }}
            onPointerUp={() => (stroke.current = null)}
            onPointerCancel={() => (stroke.current = null)}
          />
        </Lens>
      </div>
    </div>
  );
}
