"use client";

import { ArrowLeft, CameraRotate, Check, DeviceMobile, ImageSquare, Intersect, LockSimple, Timer } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { DOT_ANGLE, LABEL_ANGLE_PHONE, onRing } from "@/components/pool/geometry";
import { BASELINE_FRAMES, fogFor, frame, landscapeness, rimBelow } from "@/components/pool/poses";
import { useLensAnchor } from "@/components/pool/useLensAnchor";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { CAPTURE, DONE, INTRO, LIGHT, MONTHLY, VIEW_COPY, VIEW_LABEL, VIEWS } from "@/content/baseline";
import { aboutHour, BASELINE_WEEK, nextPhotos, nextView, painterView, viewAfter } from "@/lib/baseline";
import { encodeStill, lightStatus, photoId, stillFromFile, type Still } from "@/lib/camera";
import { useJourney } from "@/lib/hooks/useJourney";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useInstall } from "@/lib/install";
import { seasonFor } from "@/lib/season";
import type { Mode } from "@/lib/storage/keys";
import { baselinePhotos, deletePhoto, getMask, keepPhoto, photosOfWeek, type PhotoRecord, type View } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { effectiveNow } from "@/lib/time/clock";
import { PHOTO_WEEKS, weekOf } from "@/lib/time/journey";
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
 *
 * Monthly photos (Phase 7, `?week=8`): the same three views, with day one laid faintly over
 * the camera and that week's ring lit at the lens's rim; no painter. `?step=paint` opens
 * straight on the painter, and `then=projection` goes back to the illustration after it.
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
  const search = useSearchParams();
  const pool = usePool();
  const reduced = useReducedMotion();
  const { day, now } = useJourney();
  const asked = Number(search.get("week"));
  const photoWeek = (PHOTO_WEEKS as readonly number[]).includes(asked) ? asked : BASELINE_WEEK;
  const monthly = photoWeek !== BASELINE_WEEK;
  const paintFirst = !monthly && search.get("step") === "paint";
  const then = !monthly && search.get("then") === "projection" ? "/mirror/projection/" : null;

  const [shots, setShots] = useState<Shots | null>(null);
  const [masked, setMasked] = useState<Partial<Record<View, boolean>>>({});
  const [step, setStep] = useState<Step | null>(null);
  const [guides, setGuides] = useState<Partial<Record<View, string>>>({});
  const [said, setSaid] = useState("");
  const labelsRef = useRef<HTMLDivElement>(null);
  const urls = useRef(new Set<string>());
  // The journey clock, read when the photos load: a demo plan holds photos dated after it.
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  });

  // What this namespace already holds: a return visit opens on the close, a half-done set on the intro.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const recs = monthly ? await photosOfWeek(mode, photoWeek) : await baselinePhotos(mode);
      const found: Shots = {};
      const marks: Partial<Record<View, boolean>> = {};
      for (const v of VIEWS) {
        const rec = recs[v];
        if (!rec || Date.parse(rec.takenAt) > nowRef.current.getTime()) continue;
        const url = URL.createObjectURL(rec.blob);
        urls.current.add(url);
        found[v] = { rec, url };
        if (!monthly) marks[v] = Boolean(await getMask(mode, rec.id));
      }
      // Monthly photos line up with day one: its photos go faintly over the camera.
      const lineUp: Partial<Record<View, string>> = {};
      if (monthly) {
        const base = await baselinePhotos(mode);
        for (const v of VIEWS) {
          const rec = base[v];
          if (!rec) continue;
          const url = URL.createObjectURL(rec.blob);
          urls.current.add(url);
          lineUp[v] = url;
        }
      }
      if (cancelled) return;
      setShots(found);
      setMasked(marks);
      setGuides(lineUp);
      setStep(
        (s) =>
          s ?? (paintFirst && VIEWS.some((v) => found[v]) ? { kind: "painter", back: "done" } : nextView(found) ? { kind: "intro" } : { kind: "done" }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, monthly, photoWeek, paintFirst]);

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
  /** After a set of monthly photos: the photo week that follows it, if any. */
  const nextMonthly = PHOTO_WEEKS.find((w) => w > photoWeek) ?? null;
  const nextRing = monthly ? (nextMonthly ?? 0) : next.week;

  const ready = step !== null && shots !== null;
  const kind = step?.kind ?? "intro";
  const lensStep = kind === "capture" || kind === "painter";
  // The rings stay centred on the lens while the page scrolls or reflows.
  const { ref: lensRef, rig: lensAt } = useLensAnchor(pool, lensStep);

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
      // Monthly photos: this week's ring sits lit at the lens's rim, everything before it under the lens.
      const rig = lensStep ? lensAt(monthly ? (radius: number) => rimBelow(photoWeek, radius) : undefined) : null;
      if (rig)
        return { ...rig, ...scene, ...(monthly ? { week: photoWeek } : {}), labels: 0, focus: 0, focusFrom: 0, focusTo: 0, idle: 0.6, dots: 0.55, fog: fogFor(rig) };
      if (kind === "done")
        return { ...frame(BASELINE_FRAMES.done, aspect), ...scene, labels: 1, focus: nextRing ? 1 : 0, focusFrom: nextRing, focusTo: nextRing, fog: 1 };
      return {
        ...frame(BASELINE_FRAMES.intro, aspect),
        ...scene,
        labels: 1,
        focus: monthly ? 1 : 0,
        focusFrom: monthly ? photoWeek : 0,
        focusTo: monthly ? photoWeek : 0,
        fog: 1,
      };
    },
    [kind, lensStep, lensAt, week, season, nextRing, monthly, photoWeek],
  );
  // The key changes once the saved photos have loaded, so the first pose lands whichever arrives first, the pool or the photos.
  usePoolPose(step ? make : null, step ? `${kind}|${week}|${nextRing}|${photoWeek}` : "loading", { enter: { map: 0, ripple: 0.4 }, ms: 1300 });

  // Labels on the rings: the photo days on the intro, the next photos at the close.
  useEffect(() => {
    if (!pool || !labelsRef.current) return;
    const el = (n: string) => labelsRef.current!.querySelector<HTMLElement>(`[data-label="${n}"]`)!;
    const wide = landscapeness(pool.aspect) > 0.5;
    pool.setLabels([
      // Far enough out to read as a line of dots, near enough that the text stays on screen.
      { el: el("photos"), at: onRing(monthly ? photoWeek : wide ? 8 : 4, DOT_ANGLE), weight: () => (kind === "intro" ? 1 : 0) },
      { el: el("next"), at: onRing(Math.max(1, nextRing), DOT_ANGLE), weight: () => (kind === "done" && nextRing > 0 ? 1 : 0) },
      { el: el("now"), at: onRing(Math.max(1, week), wide ? 0.55 : LABEL_ANGLE_PHONE + 3.4), weight: () => (kind === "done" && wide && week > 0 && week !== nextRing ? 1 : 0) },
    ]);
    return () => pool.setLabels([]);
    // `ready`: the label elements only exist once the saved photos have loaded.
  }, [pool, ready, kind, nextRing, week, monthly, photoWeek]);

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
          onboarding: complete && !monthly && !s.onboarding.baselineDoneAt ? { ...s.onboarding, baselineDoneAt: new Date().toISOString() } : s.onboarding,
        }));
        // With photos to protect, ask the browser not to clear this site's storage (DECISIONS 43).
        if (complete) void navigator.storage?.persist?.().catch(() => false);
      }
      const following = step.back === "done" ? null : viewAfter(view, after);
      const target: Step = following
        ? { kind: "capture", view: following, back: step.back }
        : step.back === "done" || monthly
          ? { kind: "done" }
          : { kind: "painter", back: "flow" };
      // Let the still sink into the water before the next view opens.
      window.setTimeout(() => go(target), saved && !reduced ? 700 : 0);
    },
    [step, shots, pool, update, go, reduced, monthly],
  );

  if (!shots || !step) return <div className="bl" aria-busy="true" />;

  const taken = VIEWS.filter((v) => shots[v]).length;
  const capIndex = step.kind === "capture" ? VIEWS.indexOf(step.view) : -1;

  const back = () => {
    if (step.kind === "intro") return router.push(monthly ? "/mirror/" : doneAt ? "/home/" : "/onboarding/?step=briefing");
    if (step.kind === "capture") {
      if (step.back === "done") return go({ kind: "done" });
      return go(capIndex > 0 ? { kind: "capture", view: VIEWS[capIndex - 1]!, back: "flow" } : { kind: "intro" });
    }
    if (step.kind === "painter") {
      if (then) return router.push(then);
      return go(step.back === "done" ? { kind: "done" } : { kind: "capture", view: VIEWS[VIEWS.length - 1]!, back: "flow" });
    }
  };

  const hud =
    step.kind === "intro"
      ? { count: `${taken} of 3`, chapter: monthly ? MONTHLY.chapter(photoWeek) : INTRO.chapter }
      : step.kind === "capture"
        ? { count: `${capIndex + 1} of 3`, chapter: VIEW_COPY[step.view].name }
        : step.kind === "painter"
          ? { count: "Optional", chapter: "Your area" }
          : { count: "All set", chapter: monthly ? MONTHLY.chapter(photoWeek) : DONE.chapter };

  return (
    <section className="bl" data-step={step.kind} aria-labelledby="bl-title">
      <div className="ob-hud">
        <button
          type="button"
          className="ob-back"
          onClick={back}
          disabled={step.kind === "done"}
          aria-label={step.kind === "intro" ? (monthly ? MONTHLY.back : doneAt ? "Back to Today" : "Back to the briefing") : "Back"}
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
        <Intro
          shots={shots}
          monthly={monthly ? { week: photoWeek, hour: photoHour === undefined ? null : aboutHour(photoHour) } : null}
          onStart={() => go({ kind: "capture", view: nextView(shots) ?? "crown", back: "flow" })}
        />
      ) : step.kind === "capture" ? (
        <Capture
          key={step.view}
          mode={mode}
          view={step.view}
          // Walking back through the set shows what was kept; "Retake" from the close goes straight to the camera.
          existing={step.back === "flow" ? (shots[step.view] ?? null) : null}
          week={photoWeek}
          guide={guides[step.view] ?? null}
          lensRef={lensRef}
          onKept={onKept}
        />
      ) : step.kind === "painter" ? (
        <Painter
          mode={mode}
          shots={shots}
          first={painterView(profile.worries)}
          lensRef={lensRef}
          onSkip={() => (then ? router.push(then) : go({ kind: "done" }))}
          onDone={(painted) => {
            setMasked((m) => ({ ...m, ...painted }));
            setSaid(Object.values(painted).some(Boolean) ? "Area saved." : "");
            if (then) router.push(then);
            else go({ kind: "done" });
          }}
        />
      ) : (
        <Done
          mode={mode}
          shots={shots}
          masked={masked}
          next={next}
          hour={hour}
          monthly={monthly ? { week: photoWeek, next: nextMonthly } : null}
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
          <span>{monthly ? `Week ${photoWeek}, these photos` : "Photos every four weeks"}</span>
        </div>
        <div className="pool-label" data-label="next" data-tone="amber">
          <span>Week {nextRing}, next photos</span>
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

function Intro({ shots, monthly, onStart }: { shots: Shots; monthly: { week: number; hour: string | null } | null; onStart: () => void }) {
  const first = nextView(shots);
  const started = VIEWS.some((v) => shots[v]);
  return (
    <div className="bl-stage bl-open">
      <div className="bl-words">
        <Pair
          id="bl-title"
          tabIndex={-1}
          title={monthly ? MONTHLY.title(monthly.week) : INTRO.title}
          turn={monthly ? MONTHLY.turn : INTRO.turn}
          className="ob-q ob-in"
          style={{ "--i": 0 } as React.CSSProperties}
        />
        <p className="bl-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {curl(monthly ? MONTHLY.lead(monthly.hour) : INTRO.lead)}
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
          <ButtonLink variant="quiet" href={monthly ? "/mirror/" : "/home/"}>
            {curl(monthly ? MONTHLY.later : INTRO.later)}
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
  week,
  guide,
  lensRef,
  onKept,
}: {
  mode: Mode;
  view: View;
  existing: Shot | null;
  /** 0 for day one, else the photo week. */
  week: number;
  /** For monthly photos: the day-one photo of this view, to line up with. */
  guide: string | null;
  lensRef: React.RefObject<HTMLDivElement | null>;
  onKept: (view: View, saved: Shot | null) => void;
}) {
  const copy = VIEW_COPY[view];
  // Photos are dated by the journey clock, so a demo plan's day sees what was taken "today".
  const startDate = useApp((s) => s.data.profile?.startDate ?? null);
  const demoDay = useApp((s) => (s.mode === "demo" ? (s.data.demo?.day ?? null) : null));
  const [facing, setFacing] = useState<Facing>(copy.facing);
  const cam = useCamera(facing);
  const [pending, setPending] = useState<Pending | null>(
    existing ? { still: null, url: existing.url, luminance: existing.rec.luminance, source: "saved" } : null,
  );
  const [phase, setPhase] = useState<"live" | "count" | "review" | "saving">(existing ? "review" : "live");
  const [timer, setTimer] = useState(copy.timer);
  const [guideOn, setGuideOn] = useState(true);
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
      id: photoId(view, week),
      view,
      week,
      takenAt: effectiveNow(new Date(), startDate && demoDay ? { startDate, day: demoDay } : null).toISOString(),
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
              {guide ? (
                <button type="button" className="bl-tool" data-guide aria-pressed={guideOn} onClick={() => setGuideOn((g) => !g)} disabled={phase === "count"}>
                  <Intersect size={21} aria-hidden="true" />
                  <span className="bl-tool-text">{MONTHLY.guide}</span>
                </button>
              ) : null}
            </>
          )}
        </div>
        {!reviewing && !noCamera && (timer || (guide && guideOn)) ? (
          <p className="bl-fine ob-in" style={{ "--i": 4 } as React.CSSProperties}>
            {guide && guideOn ? `${MONTHLY.guideNote} ` : ""}
            {timer ? `${CAPTURE.timer} on. ${CAPTURE.timerNote}` : ""}
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
          guide={guide && guideOn && live ? guide : null}
          count={count}
          flash={flash}
          label={
            reviewing
              ? `Your ${copy.name.toLowerCase()} photo.`
              : guide && guideOn
                ? `Camera view for your ${copy.name.toLowerCase()} photo, with your day-one photo faintly over it.`
                : `Camera view for your ${copy.name.toLowerCase()} photo, with an outline to line up with.`
          }
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
  monthly,
  onRetake,
  onPaint,
  onDeleted,
}: {
  mode: Mode;
  shots: Shots;
  masked: Partial<Record<View, boolean>>;
  next: { week: number; at: Date };
  hour: number;
  monthly: { week: number; next: number | null } | null;
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
          title={monthly ? (complete ? MONTHLY.doneTitle(monthly.week) : MONTHLY.partialTitle(monthly.week)) : complete ? DONE.title : DONE.partialTitle}
          turn={
            monthly
              ? complete
                ? monthly.next
                  ? MONTHLY.doneTurn(monthly.next)
                  : MONTHLY.lastTurn
                : DONE.partialTurn
              : complete
                ? DONE.turn(next.week)
                : DONE.partialTurn
          }
          className="ob-q ob-in"
          style={{ "--i": 0 } as React.CSSProperties}
        />
        <p className="bl-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>
          {monthly ? curl(MONTHLY.doneLead) : DONE.lead(fmtDay(next.at), aboutHour(hour))}
        </p>
        <ul
          className="bl-views bl-views-done ob-in"
          style={{ "--i": 2 } as React.CSSProperties}
          aria-label={monthly ? MONTHLY.listLabel(monthly.week) : "Your day-one photos"}
        >
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
          {monthly ? (
            <>
              <ButtonLink href={`/mirror/?week=${monthly.week}`}>{MONTHLY.compare}</ButtonLink>
              <ButtonLink variant="quiet" href="/home/">
                {DONE.go}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/home/">{DONE.go}</ButtonLink>
              {any ? (
                <Button variant="quiet" onClick={onPaint}>
                  {anyMask ? DONE.repaint : DONE.paint}
                </Button>
              ) : null}
            </>
          )}
        </div>
        {monthly ? null : <InstallNudge />}
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
