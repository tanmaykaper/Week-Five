"use client";

import { ArrowLeft, Check, Info } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { onRing } from "@/components/pool/geometry";
import { fogFor, frame, LENS_RIM_WEEK, rimBelow, TODAY_FRAME } from "@/components/pool/poses";
import { useLensAnchor } from "@/components/pool/useLensAnchor";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { VIEW_COPY, VIEWS } from "@/content/baseline";
import { MIRROR, PROJECTION } from "@/content/mirror";
import { painterView } from "@/lib/baseline";
import { useJourney } from "@/lib/hooks/useJourney";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { dayOneOf } from "@/lib/mirror";
import { predictionProvider, PREDICTION_LABEL, type PredictionStage } from "@/lib/providers/prediction";
import { getMask, putProjection, type View } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { CompareLens, type LensPhase } from "./CompareLens";
import "./mirror.css";

/** How long each stage stays on screen: about 3.6 s in all (kickoff 3.6 asks for 3 to 4). */
const STAGE_MS = 1200;
const STAGE_MS_CALM = 700;
const ORDER: PredictionStage[] = ["reading", "marking", "estimating"];
const PHASES: LensPhase[] = ["reading", "marking", "estimating"];
/** The painter, opened from the day-one photos, comes back here when done. */
const PAINT = "/baseline/?step=paint&then=projection";
/** At the end the lens holds the whole plan: week 24's ring sits just outside its rim. */
const farRim = (radius: number) => rimBelow(24, radius);

type Run = { kind: "idle" } | { kind: "thinking"; stage: number } | { kind: "result"; url: string } | { kind: "failed" };
type Keyed = Run & { key: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const swell = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * What week 24 can look like (BUILD_DOC F15). The day-one photo in the lens, three stages
 * while the camera rises and the weeks pass under it, then the illustration beside day one,
 * labelled every time it is shown. Drawn on the device by the LocalSimulationProvider.
 */
export function ProjectionScreen() {
  return (
    <Gate>
      <Projection />
    </Gate>
  );
}

function Projection() {
  const mode = useApp((s) => s.mode);
  const profile = useApp((s) => s.data.profile)!;
  const persona = useApp((s) => s.data.demo?.persona ?? null);
  const pool = usePool();
  const reduced = useReducedMotion();
  const { now, day: rawDay } = useJourney();
  const day = Math.max(1, rawDay ?? 1);
  const shots = usePhotos(mode, persona, profile.startDate);
  const photos = useMemo(() => (shots ?? []).map((s) => s.rec), [shots]);
  const urlOf = useMemo(() => new Map((shots ?? []).map((s) => [s.rec.id, s.url])), [shots]);
  const demo = mode === "demo";

  // The painted areas of the day-one photos.
  const [masks, setMasks] = useState<Partial<Record<View, { blob: Blob; url: string }>> | null>(null);
  const dayOneIds = VIEWS.map((v) => dayOneOf(photos, v, now)?.id ?? "").join("|");
  useEffect(() => {
    if (shots === null) return;
    let cancelled = false;
    const made: string[] = [];
    void (async () => {
      const out: Partial<Record<View, { blob: Blob; url: string }>> = {};
      for (const v of VIEWS) {
        const p = dayOneOf(photos, v, now);
        const m = p ? await getMask(mode, p.id) : undefined;
        if (!m) continue;
        const url = URL.createObjectURL(m.blob);
        made.push(url);
        out[v] = { blob: m.blob, url };
      }
      if (!cancelled) setMasks(out);
    })();
    return () => {
      cancelled = true;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
    // `dayOneIds` stands for the photos; `now` only moves the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dayOneIds, shots === null]);

  const masked = VIEWS.filter((v) => masks?.[v]);
  const [viewPick, setViewPick] = useState<View | null>(null);
  const preferred = painterView(profile.worries);
  const view = viewPick && masked.includes(viewPick) ? viewPick : masked.includes(preferred) ? preferred : (masked[0] ?? preferred);
  const before = dayOneOf(photos, view, now) ?? VIEWS.map((v) => dayOneOf(photos, v, now)).find(Boolean) ?? null;
  const mask = masks?.[view] ?? null;
  const ready = shots !== null && masks !== null;
  const blocked = !ready ? "loading" : !before ? "no-photo" : !mask ? "no-mask" : null;

  // The run: stages paced against the real work, never ahead of it. A run belongs to its key
  // (the photo, the area and the attempt); a new key starts again at the first stage.
  const [attempt, setAttempt] = useState(0);
  const [keyed, setKeyed] = useState<Keyed | null>(null);
  const [split, setSplit] = useState(50);
  const [glide, setGlide] = useState(false);
  const runKey = blocked === null && before && mask ? `${before.id}|${mask.url}|${attempt}` : "";
  const run: Run = !runKey ? { kind: "idle" } : keyed && keyed.key === runKey ? keyed : { kind: "thinking", stage: 0 };
  useEffect(() => {
    if (!runKey || !before || !mask) return;
    let cancelled = false;
    let made = "";
    const later: number[] = [];
    const frames: number[] = [];
    const step = reduced ? STAGE_MS_CALM : STAGE_MS;
    let clock = 0;
    let reached = 0;
    const sync = () => {
      if (cancelled) return;
      const s = Math.min(clock, reached);
      setKeyed((r) => {
        const stage = r && r.key === runKey && r.kind === "thinking" ? r.stage : 0;
        return s > stage ? { key: runKey, kind: "thinking", stage: s } : r;
      });
    };
    for (const i of [1, 2])
      later.push(
        window.setTimeout(() => {
          clock = i;
          sync();
        }, step * i),
      );
    void (async () => {
      try {
        const provider = await predictionProvider();
        if (!provider) throw new Error("no provider");
        const [res] = await Promise.all([
          provider.predict({ baseline: before.blob, mask: mask.blob, view: before.view, day }, (s) => {
            reached = Math.max(reached, ORDER.indexOf(s));
            sync();
          }),
          wait(step * 3),
        ]);
        if (cancelled) return;
        await putProjection(mode, {
          id: `pj-${before.id}-${Date.now().toString(36)}`,
          photoId: before.id,
          createdAt: new Date().toISOString(),
          provider: res.provider,
          strength: res.strength,
          blob: res.image,
        }).catch(() => undefined);
        if (cancelled) return;
        made = URL.createObjectURL(res.image);
        // The reveal: the illustration slides in from the right, then the divider is yours.
        setGlide(!reduced);
        setSplit(reduced ? 50 : 100);
        setKeyed({ key: runKey, kind: "result", url: made });
        if (!reduced) {
          frames.push(requestAnimationFrame(() => frames.push(requestAnimationFrame(() => setSplit(50)))));
          later.push(window.setTimeout(() => setGlide(false), 1300));
        }
      } catch {
        if (!cancelled) setKeyed({ key: runKey, kind: "failed" });
      }
    })();
    return () => {
      cancelled = true;
      later.forEach((t) => window.clearTimeout(t));
      frames.forEach((f) => cancelAnimationFrame(f));
      if (made) URL.revokeObjectURL(made);
    };
    // The key holds the photo, the area and the attempt; the rest is read once per run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  const stage = run.kind === "thinking" ? run.stage : -1;

  // Each stage sends one ring out from under the lens: the pulse of the thinking.
  useEffect(() => {
    if (stage >= 0) pool?.splash();
  }, [pool, stage]);

  // The weeks counting up while the camera rises through them.
  const [weekShown, setWeekShown] = useState<number | null>(null);
  useEffect(() => {
    if (stage !== 2 || reduced) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1100);
      setWeekShown(Math.round(5 + swell(k) * 19));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setWeekShown(null);
    };
  }, [stage, reduced]);

  // The result's headline takes focus, as a new screen would.
  const resultUrl = run.kind === "result" ? run.url : "";
  useEffect(() => {
    if (resultUrl) document.getElementById("pj-title")?.focus({ preventScroll: true });
  }, [resultUrl]);

  // The pool: the lens at the centre of the rings; as the illustration is estimated the camera
  // rises until the whole plan is under the lens, and week 24's ring sits lit at its rim.
  const labelRef = useRef<HTMLDivElement>(null);
  const { ref: lensRef, rig: lensAt } = useLensAnchor(pool, ready);
  const far = run.kind === "result" || stage === 2;
  const poseKey = !ready ? "loading" : `pj|${view}|${far ? "far" : "near"}|${run.kind === "result" ? "result" : "drawing"}`;
  const make = useCallback(
    (aspect: number): Pose => {
      const rig = lensAt(far ? farRim : LENS_RIM_WEEK) ?? frame(TODAY_FRAME, aspect);
      return {
        ...rig,
        dY: 14,
        drop: 0,
        fall: 0,
        ripple: 0,
        map: 1,
        week: run.kind === "result" ? 24 : 0,
        seasonFrom: 0,
        seasonTo: 0,
        shed: far ? 0 : 0.4,
        dots: far ? 0 : 0.6,
        cohort: 0,
        labels: run.kind === "result" ? 1 : 0,
        focus: 0,
        focusFrom: 0,
        focusTo: 0,
        // From this high the slow swell reads as blotches; calm water instead.
        idle: far ? 0.15 : 0.6,
        fog: fogFor(rig),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poseKey],
  );
  usePoolPose(ready ? make : null, poseKey, { enter: { map: 0, ripple: 0.4 }, ms: stage === 2 ? 1100 : 1300 });

  // The label on week 24's ring: to the lens's right when there's room, else above it.
  useEffect(() => {
    const el = labelRef.current;
    if (!pool || !el) return;
    const wide = window.innerWidth >= 700;
    const room = window.innerWidth - (lensRef.current?.getBoundingClientRect().right ?? 0);
    pool.setLabels([{ el, at: onRing(24, room > 230 ? -0.45 : -1.3), weight: () => (wide ? 1 : 0) }]);
    return () => pool.setLabels([]);
  }, [pool, ready, lensRef]);

  const name = VIEW_COPY[before?.view ?? view].name.toLowerCase();
  const beforeUrl = before ? urlOf.get(before.id) : undefined;
  const beforeSide = beforeUrl ? { url: beforeUrl, alt: demo ? `Sample drawing, ${name}, day one` : `Your day-one ${name} photo` } : null;
  const afterSide = run.kind === "result" ? { url: run.url, alt: `An illustration of a typical week-24 outcome, drawn on your day-one ${name} photo` } : null;
  const thinking = run.kind === "thinking" || blocked === "loading" || (blocked === null && run.kind === "idle");

  return (
    <div className="pj">
      <div ref={labelRef} className="pool-label" data-tone="accent" aria-hidden="true">
        <span>{PROJECTION.ringLabel}</span>
      </div>

      <section className="pj-page" aria-labelledby="pj-title">
        <div className="pj-hud">
          <Link href="/mirror/" className="pj-back" aria-label={PROJECTION.back}>
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <p className="pj-chapter">{PROJECTION.chapter}</p>
        </div>

        <div className="pj-stage">
          <div className="pj-words">
            {blocked === "no-photo" ? (
              <>
                <Pair id="pj-title" tabIndex={-1} title={PROJECTION.title} turn={MIRROR.turnEmpty} className="pj-pair reveal" />
                <p className="pj-time reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {PROJECTION.emptyPhoto}
                </p>
                <div className="pj-actions reveal" style={{ "--i": 2 } as React.CSSProperties}>
                  <ButtonLink href="/baseline/">{PROJECTION.takeDayOne}</ButtonLink>
                </div>
              </>
            ) : blocked === "no-mask" ? (
              <>
                <Pair id="pj-title" tabIndex={-1} title={PROJECTION.title} turn={PROJECTION.turn} className="pj-pair reveal" />
                <p className="pj-time reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {curl(PROJECTION.emptyMask)}
                </p>
                <div className="pj-actions reveal" style={{ "--i": 2 } as React.CSSProperties}>
                  <ButtonLink href={PAINT}>{PROJECTION.markArea}</ButtonLink>
                </div>
              </>
            ) : run.kind === "failed" ? (
              <>
                <Pair id="pj-title" tabIndex={-1} title={PROJECTION.title} turn={PROJECTION.turn} className="pj-pair" />
                <p className="pj-problem">{PROJECTION.failed}</p>
                <div className="pj-actions">
                  <Button onClick={() => setAttempt((a) => a + 1)}>{PROJECTION.retry}</Button>
                  <ButtonLink variant="quiet" href="/mirror/">
                    {PROJECTION.back}
                  </ButtonLink>
                </div>
              </>
            ) : run.kind === "result" ? (
              <>
                <Pair id="pj-title" tabIndex={-1} title={PROJECTION.title} turn={PROJECTION.turn} className="pj-pair reveal" />
                <p className="pj-time reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {PROJECTION.time}
                </p>
                {masked.length > 1 ? (
                  <div role="radiogroup" aria-label={PROJECTION.views} className="mr-chips reveal" style={{ "--i": 2 } as React.CSSProperties}>
                    {masked.map((v) => (
                      <button key={v} type="button" role="radio" aria-checked={view === v} className="mr-chip" onClick={() => setViewPick(v)}>
                        {view === v ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
                        {VIEW_COPY[v].name}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="pj-actions reveal" style={{ "--i": 3 } as React.CSSProperties}>
                  <ButtonLink href="/mirror/">{PROJECTION.done}</ButtonLink>
                  <ButtonLink variant="quiet" href={PAINT}>
                    {PROJECTION.repaint}
                  </ButtonLink>
                </div>
                <details className="pj-how reveal" style={{ "--i": 4 } as React.CSSProperties}>
                  <summary>{PROJECTION.howTitle}</summary>
                  <p>{curl(PROJECTION.how)}</p>
                </details>
              </>
            ) : (
              <>
                <Pair id="pj-title" tabIndex={-1} title={PROJECTION.thinkingTitle} turn={PROJECTION.thinkingTurn} className="pj-pair reveal" />
                <ol className="pj-steps reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {PROJECTION.stages.map((label, i) => {
                    const state = stage > i ? "done" : stage === i ? "now" : "next";
                    return (
                      <li key={label} className="pj-step" data-state={state}>
                        <span className="pj-step-mark" aria-hidden="true">
                          {state === "done" ? <Check size={13} weight="bold" /> : null}
                        </span>
                        {label}
                        {i === 2 && state === "now" && weekShown ? (
                          <span className="pj-week num" aria-hidden="true">
                            Week {weekShown}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>

          <div className="pj-lens-col">
            <CompareLens
              ref={lensRef}
              view={before?.view ?? view}
              before={beforeSide}
              after={afterSide}
              value={split}
              onChange={(v) => {
                setGlide(false);
                setSplit(v);
              }}
              label={PROJECTION.drag}
              valueText={`Day one on the left, the illustration on the right, divider at ${split} percent`}
              mark={thinking && mask ? mask.url : null}
              phase={stage >= 0 ? PHASES[stage] : "rest"}
              glide={glide}
              size="projection"
            />
            {afterSide ? (
              <>
                <div className="mr-caps">
                  <p>
                    <span className="font-medium">{PROJECTION.dayOne}</span>
                  </p>
                  <p className="text-right">
                    <span className="font-medium">{PROJECTION.illustration}</span>
                  </p>
                </div>
                <p className="pj-label">
                  <Info size={18} aria-hidden="true" />
                  {PREDICTION_LABEL}
                </p>
              </>
            ) : null}
            {demo && beforeSide ? <p className="mr-fine">{MIRROR.sample}</p> : null}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {run.kind === "result" ? PROJECTION.ready : stage >= 0 ? PROJECTION.stages[stage] : ""}
        </p>
      </section>
    </div>
  );
}
