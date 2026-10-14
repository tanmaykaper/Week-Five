"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PERSONAS, type Persona } from "@/lib/demo/personas";
import { useApp } from "@/lib/storage/store";

const PICKS = [1, 10, 35, 60, 110, 168];

/** "Demo, day 35". Opens the day jumper so a reviewer can see week five without waiting five weeks. */
export function DemoChip() {
  const day = useApp((s) => s.data.demo?.day ?? 1);
  const persona = useApp((s) => s.data.demo?.persona ?? "steady");
  const setDemoDay = useApp((s) => s.setDemoDay);
  const enterDemo = useApp((s) => s.enterDemo);
  const leaveDemo = useApp((s) => s.leaveDemo);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-medium text-text-2 transition-colors duration-150 ease-settle hover:border-text-3 hover:text-ink"
      >
        <span className="size-1.5 rounded-full bg-today-dot" aria-hidden="true" />
        Demo, day <span className="num">{day}</span>
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label="Demo controls"
        hidden={!open}
        className="absolute top-[calc(100%+12px)] right-0 w-[min(340px,calc(100vw-32px))] rounded-lg border border-line bg-surface p-5 shadow-float"
      >
        <h2 className="text-sm font-semibold">Jump to any day</h2>
        <p className="mt-1 text-sm text-text-2">Sample data only. Nothing here is real, and your own plan is untouched.</p>

        <label className="sr-only" htmlFor={`${panelId}-day`}>
          Journey day
        </label>
        <input
          id={`${panelId}-day`}
          type="range"
          min={1}
          max={180}
          value={day}
          onChange={(e) => setDemoDay(Number(e.target.value))}
          className="mt-4 mb-1 h-7 w-full accent-accent"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick picks">
          {PICKS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={day === d}
              onClick={() => setDemoDay(d)}
              className="num h-8 min-w-11 rounded-sm border border-line-strong px-2.5 text-micro font-medium text-text-2 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
            >
              {d}
            </button>
          ))}
        </div>

        <fieldset className="mt-5 border-t border-line pt-4">
          <legend className="sr-only">Sample person</legend>
          <p className="text-sm font-semibold" aria-hidden="true">
            Sample person
          </p>
          <div className="mt-2 grid gap-1">
            {(Object.keys(PERSONAS) as Persona[]).map((p) => (
              <label key={p} className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-sm">
                <input
                  type="radio"
                  name={`${panelId}-persona`}
                  checked={persona === p}
                  onChange={() => {
                    enterDemo(p);
                    setDemoDay(day);
                  }}
                  className="mt-1 accent-accent"
                />
                <span>
                  <span className="font-medium">{PERSONAS[p].label}</span>
                  <span className="block text-text-2">{PERSONAS[p].summary}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => {
            leaveDemo();
            setOpen(false);
            router.push("/");
          }}
          className="mt-3 min-h-11 text-sm font-medium text-text-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          Leave demo
        </button>
      </div>
    </div>
  );
}
