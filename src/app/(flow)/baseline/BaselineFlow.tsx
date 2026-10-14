"use client";

import { ArrowLeft, CameraRotate, Check, DeviceMobile, ImageSquare, LockSimple, Timer } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { DOT_ANGLE, LABEL_ANGLE_PHONE, onRing } from "@/components/pool/geometry";
import { BASELINE_FRAMES, frame, landscapeness, lensRig } from "@/components/pool/poses";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { CAPTURE, DONE, INTRO, LIGHT, VIEW_COPY, VIEW_LABEL, VIEWS } from "@/content/baseline";
import { aboutHour, BASELINE_WEEK, nextPhotos, nextView, painterView, viewAfter } from "@/lib/baseline";
import { encodeStill, lightStatus, photoId, stillFromFile, type Still } from "@/lib/camera";
import { useJourney } from "@/lib/hooks/useJourney";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useInstall } from "@/lib/install";
import { seasonFor } from "@/lib/season";
import type { Mode } from "@/lib/storage/keys";
import { baselinePhotos, deletePhoto, getMask, keepPhoto, type PhotoRecord, type View } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { weekOf } from "@/lib/time/journey";
import { Lens, LightMeter } from "./Lens";
import { Painter } from "./Painter";
import { useCamera, useLuminance, type Facing } from "./useCamera";
import "../onboarding/onboarding.css";
import "./baseline.css";

type Shot = { rec: PhotoRecord; url: string };
type Shots = Partial<Record<View, Shot>>;
type Step =
  | { kind: "intro" }
  | { kind: "capture"; view: View; back: "flow" | "done" }
  | { kind: "painter"; back: "flow" | "done" }
  | { kind: "done" };

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

/**
 * Day-one photos (Phase 4): crown, hairline and parting through a round lens that sits at
 * the centre of the user's 24 rings, then an optional painter, then a short close. Every
 * kept photo lands like a drop and its ripple runs out over the whole plan.
 */
export function BaselineFlow() {
  return (
    <div className="wrap">
      <Gate>
        <Baseline />
      </Gate>
    </div>
  );
}

function Baseline() {
  const mode = useApp((s) => s.mode);
  const profile = useApp((s) => s.data.profile)!;
  const doneAt = useApp((s) => s.data.onboarding.baselineDoneAt);
  const photoHour = useApp((s) => s.data.settings.photoHour);
  const update = useApp((s) => s.update);
  const router = useRouter();
  const pool = usePool();
  const reduced = useReducedMotion();
  const { day, now } = useJourney();

  const [shots, setShots] = useState<Shots | null>(null);
  const [masked, setMasked] = useState<Partial<Record<View, boolean>>>({});
  const [step, setStep] = useState<Step | null>(null);
  const [said, setSaid] = useState("");
  const lensRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const urls = useRef(new Set<string>());

  // What this namespace already holds: a return visit opens on the close, a half-done set on the intro.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const recs = await baselinePhotos(mode);
      const found: Shots = {};
      const marks: Partial<Record<View, boolean>> = {};
      for (const v of VIEWS) {
        const rec = recs[v];
        if (!rec) continue;
        const url = URL.createObjectURL(rec.blob);
        urls.current.add(url);
        found[v] = { rec, url };
        marks[v] = Boolean(await getMask(mode, rec.id));
      }
      if (cancelled) return;
      setShots(found);
      setMasked(marks);
      setStep((s) => s ?? (nextView(found) ? { kind: "intro" } : { kind: "done" }));
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    const held = urls.current;
    return () => held.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const go = useCallback((next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => document.getElementById("bl-title")?.focus({ preventScroll: true }));
  }, []);

  // The scene: the user's week and rains on the rings, as in setup.
  const week = day !== null && day >= 1 ? Math.min(24, weekOf(day)) : 0;
  const season = useMemo(
    () => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride),
    [profile.startDate, profile.cityId, profile.seasonOverride],
  );
  const hour = photoHour ?? now.getHours();
  const next = nextPhotos(profile.startDate, day ?? 1, hour);

  const ready = step !== null && shots !== null;
  const kind = step?.kind ?? "intro";
  const lensStep = kind === "capture" || kind === "painter";
  /** The screen shift the lens pose was built with; scrolling and layout changes are offsets from it. */
  const anchor = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const make = useCallback(
    (aspect: number): Pose => {
      const scene: Pose = {
        dY: 14,
        drop: 0,
        fall: 0,
        ripple: 0,
        map: 1,
        shed: 0.6,
        dots: 1,
        cohort: 0,
        week,
        seasonFrom: season.weeks?.[0] ?? 0,
        seasonTo: season.weeks?.[1] ?? 0,
        idle: 1,
      };
      if (lensStep && lensRef.current) {
        const r = lensRef.current.getBoundingClientRect();
        const rig = lensRig(r.left + r.width / 2, r.top + window.scrollY + r.height / 2, r.width / 2, window.innerWidth, window.innerHeight);
        anchor.current = { x: rig.shiftX, y: rig.shiftY };
        return { ...rig, ...scene, labels: 0, focus: 0, focusFrom: 0, focusTo: 0, idle: 0.6, dots: 0.55 };
      }
      if (kind === "done") return { ...frame(BASELINE_FRAMES.done, aspect), ...scene, labels: 1, focus: 1, focusFrom: next.week, focusTo: next.week };
      return { ...frame(BASELINE_FRAMES.intro, aspect), ...scene, labels: 1, focus: 0, focusFrom: 0, focusTo: 0 };
    },
    [kind, lensStep, week, season, next.week],
  );
  // The key changes once the saved photos have loaded, so the first pose lands whichever arrives first, the pool or the photos.
  usePoolPose(step ? make : null, step ? `${kind}|${week}|${next.week}` : "loading", { enter: { map: 0, ripple: 0.4 }, ms: 1300 });

  // Keep the rings centred on the lens while the page scrolls or reflows.
  useEffect(() => {
    if (!pool || !lensStep) return;
    const sync = () => {
      const el = lensRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (r.left + r.width / 2) / window.innerWidth - 0.5 - anchor.current.x;
      const y = (r.top + r.height / 2) / window.innerHeight - 0.5 - anchor.current.y;
      offset.current = { x, y };
      pool.setOffset(x, y);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", sync);
      ro.disconnect();
      // Fold the offset into the camera so leaving the lens doesn't jump.
      const o = offset.current;
      if (o.x || o.y) pool.set({ shiftX: pool.rig.shiftX + o.x, shiftY: pool.rig.shiftY + o.y });
      pool.setOffset(0, 0);
      offset.current = { x: 0, y: 0 };
    };
  }, [pool, lensStep]);

  // Labels on the rings: the photo days on the intro, the next photos at the close.
  useEffect(() => {
    if (!pool || !labelsRef.current) return;
    const el = (n: string) => labelsRef.current!.querySelector<HTMLElement>(`[data-label="${n}"]`)!;
    const wide = landscapeness(pool.aspect) > 0.5;
    pool.setLabels([
      // Far enough out to read as a line of dots, near enough that the text stays on screen.
      { el: el("photos"), at: onRing(wide ? 8 : 4, DOT_ANGLE), weight: () => (kind === "intro" ? 1 : 0) },
      { el: el("next"), at: onRing(next.week, DOT_ANGLE), weight: () => (kind === "done" ? 1 : 0) },
      { el: el("now"), at: onRing(Math.max(1, week), wide ? 0.55 : LABEL_ANGLE_PHONE + 3.4), weight: () => (kind === "done" && wide && week > 0 && week !== next.week ? 1 : 0) },
    ]);
    return () => pool.setLabels([]);
    // `ready`: the label elements only exist once the saved photos have loaded.
  }, [pool, ready, kind, next.week, week]);

  const onKept = useCallback(
    (view: View, saved: Shot | null) => {
      if (!step || step.kind !== "capture" || !shots) return;
      let after = shots;
      if (saved) {
        pool?.splash();
        const old = shots[view];
        if (old) {
          URL.revokeObjectURL(old.url);
          urls.current.delete(old.url);
        }
        urls.current.add(saved.url);
        after = { ...shots, [view]: saved };
        setShots(after);
        setMasked((m) => ({ ...m, [view]: false }));
        setSaid(CAPTURE.saved);
        const complete = !nextView(after);
        update((s) => ({
          ...s,
          settings: s.settings.photoHour === undefined ? { ...s.settings, photoHour: new Date(saved.rec.takenAt).getHours() } : s.settings,
          onboarding: complete && !s.onboarding.baselineDoneAt ? { ...s.onboarding, baselineDoneAt: new Date().toISOString() } : s.onboarding,
        }));
        // With photos to protect, ask the browser not to clear this site's storage (DECISIONS 43).
        if (complete) void navigator.storage?.persist?.().catch(() => false);
      }
      const following = step.back === "done" ? null : viewAfter(view, after);
      const target: Step = following ? { kind: "capture", view: following, back: step.back } : step.back === "done" ? { kind: "done" } : { kind: "painter", back: "flow" };
      // Let the still sink into the water before the next view opens.
      window.setTimeout(() => go(target), saved && !reduced ? 700 : 0);
    },
    [step, shots, pool, update, go, reduced],
  );

  if (!shots || !step) return <div className="bl" aria-busy="true" />;

  const taken = VIEWS.filter((v) => shots[v]).length;
  const capIndex = step.kind === "capture" ? VIEWS.indexOf(step.view) : -1;

  const back = () => {
    if (step.kind === "intro") return router.push(doneAt ? "/home/" : "/onboarding/?step=briefing");
    if (step.kind === "capture") {
      if (step.back === "done") return go({ kind: "done" });
      return go(capIndex > 0 ? { kind: "capture", view: VIEWS[capIndex - 1]!, back: "flow" } : { kind: "intro" });
    }
    if (step.kind === "painter") return go(step.back === "done" ? { kind: "done" } : { kind: "capture", view: VIEWS[VIEWS.length - 1]!, back: "flow" });
  };

  const hud =
    step.kind === "intro"
      ? { count: `${taken} of 3`, chapter: INTRO.chapter }
      : step.kind === "capture"
        ? { count: `${capIndex + 1} of 3`, chapter: VIEW_COPY[step.view].name }
        : step.kind === "painter"
          ? { count: "Optional", chapter: "Your area" }
          : { count: "All set", chapter: DONE.chapter };

  return (
    <section className="bl" data-step={step.kind} aria-labelledby="bl-title">
      <div className="ob-hud">
        <button
          type="button"
          className="ob-back"
          onClick={back}
          disabled={step.kind === "done"}
          aria-label={step.kind === "intro" ? (doneAt ? "Back to Today" : "Back to the briefing") : "Back"}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <p className="ob-count num">
          {hud.count}
          <span className="ob-chapter">{hud.chapter}</span>
        </p>
        <div className="ob-ticks bl-ticks" aria-hidden="true">
          {VIEWS.map((v) => (
            <i key={v} data-on={shots[v] ? true : undefined} data-now={step.kind === "capture" && step.view === v ? true : undefined} />
          ))}
        </div>
      </div>

      {step.kind === "intro" ? (
        <Intro shots={shots} onStart={() => go({ kind: "capture", view: nextView(shots) ?? "crown", back: "flow" })} />
      ) : step.kind === "capture" ? (
        <Capture
          key={step.view}
          mode={mode}
          view={step.view}
          // Walking back through the set shows what was kept; "Retake" from the close goes straight to the camera.
          existing={step.back === "flow" ? (shots[step.view] ?? null) : null}
          lensRef={lensRef}
          onKept={onKept}
        />
      ) : step.kind === "painter" ? (
        <Painter
          mode={mode}
          shots={shots}
          first={painterView(profile.worries)}
          lensRef={lensRef}
          onSkip={() => go({ kind: "done" })}
          onDone={(painted) => {
            setMasked((m) => ({ ...m, ...painted }));
            setSaid(Object.values(painted).some(Boolean) ? "Area saved." : "");
            go({ kind: "done" });
          }}
        />
      ) : (
        <Done
          mode={mode}
          shots={shots}
          masked={masked}
          next={next}
          hour={hour}
          onRetake={(view) => go({ kind: "capture", view, back: "done" })}
          onPaint={() => go({ kind: "painter", back: "done" })}
          onDeleted={(view) => {
            const old = shots[view];
            if (old) {
              URL.revokeObjectURL(old.url);
              urls.current.delete(old.url);
            }
            const rest = { ...shots };
            delete rest[view];
            setShots(rest);
            setMasked((m) => ({ ...m, [view]: false }));
            setSaid(DONE.deleted);
          }}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {said}
      </p>

      <div ref={labelsRef} aria-hidden="true">
        <div className="pool-label" data-label="photos" data-tone="amber">
          <span>Photos every four weeks</span>
        </div>
        <div className="pool-label" data-label="next" data-tone="amber">
          <span>Week {next.week}, next photos</span>
        </div>
        <div className="pool-label" data-label="now" data-tone="accent">
          <span>{week > 0 ? `You are here, week ${week}` : ""}</span>
        </div>
      </div>
    </section>
  );
}

function Disc({ view, url, size = "sm" }: { view: View; url?: string; size?: "sm" | "lg" }) {
  return (
    <span className="bl-disc" data-size={size}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" width={240} height={240} />
      ) : (
        <HeadGhost view={view} />
      )}
    </span>
  );
}

function Intro({ shots, onStart }: { shots: Shots; onStart: () => void }) {
  const first = nextView(shots);
  const started = VIEWS.some((v) => shots[v]);
  return (
    <div className="bl-stage bl-open">
      <div className="bl-words">
        <Pair id="bl-title" tabIndex={-1} title={INTRO.title} turn={INTRO.turn} className="ob-q ob-in" style={{ "--i": 0 } as React.CSSProperties} />
        <p className="bl-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {curl(INTRO.lead)}
        </p>
        <ul className="bl-views ob-in" style={{ "--i": 2 } as React.CSSProperties} aria-label="The three photos">
          {VIEWS.map((v) => (
            <li key={v}>
              <Disc view={v} url={shots[v]?.url} />
              <span className="bl-view-name">
                {VIEW_LABEL[v]}
                {shots[v] ? (
                  <span className="bl-view-done">
                    <Check size={13} weight="bold" aria-hidden="true" /> Saved
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="bl-actions ob-in" style={{ "--i": 3 } as React.CSSProperties}>
          <Button onClick={onStart}>{started && first ? INTRO.resume(VIEW_COPY[first].name) : INTRO.start}</Button>
          <ButtonLink variant="quiet" href="/home/">
            {curl(INTRO.later)}
          </ButtonLink>
        </div>
        <p className="bl-privacy ob-in" style={{ "--i": 4 } as React.CSSProperties}>
          <LockSimple size={17} aria-hidden="true" />
          {INTRO.privacy}
        </p>
      </div>
    </div>
  );
}

type Pending = { still: Still | null; url: string; luminance: number; source: "camera" | "file" | "saved" };

function Capture({
  mode,
  view,
  existing,
  lensRef,
  onKept,
}: {
  mode: Mode;
  view: View;
  existing: Shot | null;
  lensRef: React.RefObject<HTMLDivElement | null>;
  onKept: (view: View, saved: Shot | null) => void;
}) {
  const copy = VIEW_COPY[view];
  const [facing, setFacing] = useState<Facing>(copy.facing);
  const cam = useCamera(facing);
  const [pending, setPending] = useState<Pending | null>(
    existing ? { still: null, url: existing.url, luminance: existing.rec.luminance, source: "saved" } : null,
  );
  const [phase, setPhase] = useState<"live" | "count" | "review" | "saving">(existing ? "review" : "live");
  const [timer, setTimer] = useState(copy.timer);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);
  const timerId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const live = cam.status === "live";
  const reviewing = phase === "review" || phase === "saving";
  const lum = useLuminance(cam.videoRef, live && !reviewing);
  const noCamera = cam.status === "denied" || cam.status === "unavailable";

  useEffect(() => () => window.clearTimeout(timerId.current), []);

  const drop = (p: Pending | null) => {
    if (p && p.source !== "saved") URL.revokeObjectURL(p.url);
  };

  const shoot = async () => {
    const video = cam.videoRef.current;
    setCount(null);
    if (!video || !video.videoWidth) return setPhase("live");
    setFlash((f) => f + 1);
    try {
      const still = await encodeStill(video);
      setPending({ still, url: URL.createObjectURL(still.blob), luminance: still.luminance, source: "camera" });
      setPhase("review");
    } catch {
      setProblem(CAPTURE.unreadable);
      setPhase("live");
    }
  };

  const press = () => {
    setProblem(null);
    if (phase === "count") {
      window.clearTimeout(timerId.current);
      setCount(null);
      return setPhase("live");
    }
    if (!timer) return void shoot();
    setPhase("count");
    setCount(3);
    let n = 3;
    const tick = () => {
      n -= 1;
      if (n <= 0) return void shoot();
      setCount(n);
      timerId.current = window.setTimeout(tick, 1000);
    };
    timerId.current = window.setTimeout(tick, 1000);
  };

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setProblem(null);
    try {
      const still = await stillFromFile(file);
      drop(pending);
      setPending({ still, url: URL.createObjectURL(still.blob), luminance: still.luminance, source: "file" });
      setPhase("review");
    } catch {
      setProblem(CAPTURE.unreadable);
    }
  };

  const keep = async () => {
    if (!pending) return;
    if (pending.source === "saved" || !pending.still) return onKept(view, null);
    setPhase("saving");
    const rec: PhotoRecord = {
      id: photoId(view, BASELINE_WEEK),
      view,
      week: BASELINE_WEEK,
      takenAt: new Date().toISOString(),
      blob: pending.still.blob,
      width: pending.still.width,
      height: pending.still.height,
      luminance: pending.still.luminance,
    };
    try {
      await keepPhoto(mode, rec);
      onKept(view, { rec, url: pending.url });
    } catch {
      setProblem(CAPTURE.unsaved);
      setPhase("review");
    }
  };

  const retake = () => {
    drop(pending);
    setPending(null);
    setProblem(null);
    setPhase("live");
    if (noCamera) fileRef.current?.click();
  };

  const status = (() => {
    if (problem) return <p className="bl-note text-alert">{problem}</p>;
    if (reviewing && pending) {
      const s = lightStatus(pending.luminance);
      const text = s === "dark" ? LIGHT.stillDark : s === "bright" ? LIGHT.stillBright : pending.source === "saved" ? CAPTURE.savedReview : CAPTURE.review;
      return <LightMeter luminance={pending.luminance} text={text} />;
    }
    if (cam.status === "denied") return <p className="bl-note">{CAPTURE.denied}</p>;
    if (cam.status === "unavailable") return <p className="bl-note">{CAPTURE.unavailable}</p>;
    if (cam.status === "starting") return <p className="bl-note">{CAPTURE.starting}</p>;
    const s = lum === null ? null : lightStatus(lum);
    return <LightMeter luminance={lum} text={s === null ? LIGHT.reading : LIGHT[s]} />;
  })();

  return (
    <div className="bl-stage" data-phase={phase}>
      <div className="bl-words">
        <Pair id="bl-title" tabIndex={-1} title={copy.title} turn={copy.turn} className="ob-q ob-in" style={{ "--i": 0 } as React.CSSProperties} />
        <p className="bl-how ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {copy.how}
        </p>
        <div className="bl-status ob-in" style={{ "--i": 2 } as React.CSSProperties} aria-live="polite">
          {status}
        </div>

        <div className={`bl-controls ob-in ${!reviewing && !noCamera ? "bl-shoot" : ""}`} style={{ "--i": 3 } as React.CSSProperties}>
          {reviewing ? (
            <>
              <Button variant="quiet" onClick={retake} disabled={phase === "saving"}>
                {CAPTURE.retake}
              </Button>
              <Button onClick={keep} disabled={phase === "saving"}>
                {CAPTURE.keep}
              </Button>
            </>
          ) : noCamera ? (
            <Button onClick={() => fileRef.current?.click()}>
              <ImageSquare size={19} aria-hidden="true" />
              {CAPTURE.choose}
            </Button>
          ) : (
            <>
              <button type="button" className="bl-tool" onClick={() => fileRef.current?.click()}>
                <ImageSquare size={21} aria-hidden="true" />
                <span className="bl-tool-text">{CAPTURE.choose}</span>
              </button>
              <button
                type="button"
                className="bl-shutter"
                onClick={press}
                disabled={!live}
                data-counting={phase === "count" || undefined}
                aria-label={phase === "count" ? CAPTURE.cancel : copy.shutter}
              >
                <span className="bl-shutter-disc" aria-hidden="true" />
                <span className="bl-shutter-text">{phase === "count" ? CAPTURE.cancel : copy.shutter}</span>
              </button>
              <button type="button" className="bl-tool" aria-pressed={timer} onClick={() => setTimer((t) => !t)} disabled={phase === "count"}>
                <Timer size={21} aria-hidden="true" />
                <span className="bl-tool-text">{CAPTURE.timer}, 3 s</span>
              </button>
              {cam.canFlip ? (
                <button
                  type="button"
                  className="bl-tool"
                  onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                  disabled={phase === "count"}
                >
                  <CameraRotate size={21} aria-hidden="true" />
                  <span className="bl-tool-text">{CAPTURE.flip}</span>
                </button>
              ) : null}
            </>
          )}
        </div>
        {!reviewing && !noCamera && timer ? (
          <p className="bl-fine ob-in" style={{ "--i": 4 } as React.CSSProperties}>
            {CAPTURE.timer} on. {CAPTURE.timerNote}
          </p>
        ) : reviewing && pending?.source === "file" ? (
          <p className="bl-fine">{CAPTURE.cropNote}</p>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture={facing}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void choose(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="sr-only" aria-live="assertive">
          {count ? CAPTURE.countdown(count) : ""}
        </p>
      </div>

      <div className="bl-lens-wrap">
        <Lens
          ref={lensRef}
          view={view}
          videoRef={cam.videoRef}
          live={live && !reviewing}
          mirrored={cam.mirrored}
          still={reviewing ? (pending?.url ?? null) : null}
          count={count}
          flash={flash}
          label={reviewing ? `Your ${copy.name.toLowerCase()} photo.` : `Camera view for your ${copy.name.toLowerCase()} photo, with an outline to line up with.`}
        />
      </div>
    </div>
  );
}

function Done({
  mode,
  shots,
  masked,
  next,
  hour,
  onRetake,
  onPaint,
  onDeleted,
}: {
  mode: Mode;
  shots: Shots;
  masked: Partial<Record<View, boolean>>;
  next: { week: number; at: Date };
  hour: number;
  onRetake: (view: View) => void;
  onPaint: () => void;
  onDeleted: (view: View) => void;
}) {
  const [confirm, setConfirm] = useState<View | null>(null);
  const complete = !nextView(shots);
  const any = VIEWS.some((v) => shots[v]);
  const anyMask = VIEWS.some((v) => masked[v]);

  useEffect(() => {
    if (!confirm) return;
    const id = window.setTimeout(() => setConfirm(null), 5000);
    return () => window.clearTimeout(id);
  }, [confirm]);

  return (
    <div className="bl-stage bl-open">
      <div className="bl-words">
        <Pair
          id="bl-title"
          tabIndex={-1}
          title={complete ? DONE.title : DONE.partialTitle}
          turn={complete ? DONE.turn(next.week) : DONE.partialTurn}
          className="ob-q ob-in"
          style={{ "--i": 0 } as React.CSSProperties}
        />
        <p className="bl-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {DONE.lead(fmtDay(next.at), aboutHour(hour))}
        </p>
        <ul className="bl-views bl-views-done ob-in" style={{ "--i": 2 } as React.CSSProperties} aria-label="Your day-one photos">
          {VIEWS.map((v) => (
            <li key={v}>
              <Disc view={v} url={shots[v]?.url} size="lg" />
              <span className="bl-view-name">{VIEW_COPY[v].name}</span>
              {shots[v] ? (
                <span className="bl-view-actions">
                  <button type="button" className="bl-mini" onClick={() => onRetake(v)} aria-label={`${DONE.retake} ${VIEW_COPY[v].name.toLowerCase()} photo`}>
                    {DONE.retake}
                  </button>
                  <button
                    type="button"
                    className="bl-mini"
                    data-danger
                    aria-label={confirm === v ? `${DONE.confirmDelete}: ${VIEW_COPY[v].name.toLowerCase()} photo` : `${DONE.delete} ${VIEW_COPY[v].name.toLowerCase()} photo`}
                    onClick={async () => {
                      if (confirm !== v) return setConfirm(v);
                      setConfirm(null);
                      await deletePhoto(mode, shots[v]!.rec.id);
                      onDeleted(v);
                    }}
                  >
                    {confirm === v ? DONE.confirmDelete : DONE.delete}
                  </button>
                </span>
              ) : (
                <span className="bl-view-actions">
                  <button type="button" className="bl-mini" data-strong onClick={() => onRetake(v)}>
                    {DONE.take(VIEW_COPY[v].name)}
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="bl-actions ob-in" style={{ "--i": 3 } as React.CSSProperties}>
          <ButtonLink href="/home/">{DONE.go}</ButtonLink>
          {any ? (
            <Button variant="quiet" onClick={onPaint}>
              {anyMask ? DONE.repaint : DONE.paint}
            </Button>
          ) : null}
        </div>
        <InstallNudge />
      </div>
    </div>
  );
}

function InstallNudge() {
  const { state, install } = useInstall();
  if (state === "installed") return null;
  return (
    <div className="bl-install ob-in" style={{ "--i": 4 } as React.CSSProperties}>
      <DeviceMobile size={20} aria-hidden="true" />
      <p>
        {DONE.install}
        {state === "ios" ? ` ${DONE.installIos}` : null}
      </p>
      {state === "prompt" ? (
        <Button variant="quiet" className="h-11 shrink-0 px-4" onClick={install}>
          {DONE.installButton}
        </Button>
      ) : null}
    </div>
  );
}
