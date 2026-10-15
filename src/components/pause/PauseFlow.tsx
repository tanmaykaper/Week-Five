"use client";

import { ArrowLeft, CalendarPlus, X } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { LetterText } from "@/components/letter/Letter";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { LABEL_ANGLE, onRing } from "@/components/pool/geometry";
import { BASELINE_FRAMES, frame, landscapeness, SETUP_FRAMES, TODAY_FRAME } from "@/components/pool/poses";
import { PoolStage } from "@/components/pool/PoolStage";
import { useLensAnchor } from "@/components/pool/useLensAnchor";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { WeekTicks } from "@/components/ui/WeekTicks";
import { PAUSE } from "@/content/journey";
import { painterView } from "@/lib/baseline";
import { useJourney } from "@/lib/hooks/useJourney";
import { downloadIcs, icsCalendar } from "@/lib/ics";
import { revealLetter } from "@/lib/letter";
import { seasonFor } from "@/lib/season";
import { baselinePhotos } from "@/lib/storage/photos";
import type { Intercept } from "@/lib/storage/schema";
import { useApp } from "@/lib/storage/store";
import { addDays, parseISODate, toISODate, weekOf } from "@/lib/time/journey";
import { DoctorSummary } from "./DoctorSummary";
import "@/app/(flow)/onboarding/onboarding.css";
import "./pause.css";

type StepId = "dayone" | "where" | "letter" | "choice";
type Outcome = null | "kept" | "paused" | "doctor";

const fmt = (iso: string) => parseISODate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

/**
 * Wait, before you stop (BUILD_DOC F11). Evidence next to the feeling, then respect for the
 * decision: day one, where you are on the map, your own note, the plain fact, and three
 * equal options. No guilt, no countdown, and closing without choosing is fine.
 */
export function PauseFlow() {
  return (
    <Gate>
      <Pause />
    </Gate>
  );
}

function Pause() {
  const mode = useApp((s) => s.mode);
  const profile = useApp((s) => s.data.profile)!;
  const letter = useApp((s) => s.data.letter);
  const routine = useApp((s) => s.data.routine);
  const update = useApp((s) => s.update);
  const router = useRouter();
  const search = useSearchParams();
  const pool = usePool();
  const { now, day: rawDay } = useJourney();
  const day = rawDay ?? 1;
  const week = day >= 1 ? Math.min(24, weekOf(day)) : 0;

  const steps: StepId[] = letter?.text ? ["dayone", "where", "letter", "choice"] : ["dayone", "where", "choice"];
  const [at, setAt] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(search.get("step") === "doctor" ? "doctor" : null);
  const [picking, setPicking] = useState(false);
  const [restart, setRestart] = useState(() => toISODate(addDays(new Date(), 7)));
  const [photo, setPhoto] = useState<{ url: string; view: string } | null | undefined>(undefined);
  const step = steps[Math.min(at, steps.length - 1)]!;

  // The day-one photo of the area they watch.
  useEffect(() => {
    let url = "";
    let cancelled = false;
    void baselinePhotos(mode).then((all) => {
      if (cancelled) return;
      const rec = all[painterView(profile.worries)] ?? all.crown ?? all.hairline ?? all.parting;
      if (!rec) return setPhoto(null);
      url = URL.createObjectURL(rec.blob);
      setPhoto({ url, view: rec.view });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [mode, profile.worries]);

  // Reaching the note opens it, even before week four: this is the moment it was written for.
  useEffect(() => {
    if (step === "letter") update((s) => revealLetter(s, "pause", new Date()));
  }, [step, update]);

  const log = useCallback(
    (choice: Intercept["choice"], restartDate?: string) =>
      update((s) => ({
        ...s,
        intercepts: [
          ...s.intercepts,
          { id: `ic-${Date.now().toString(36)}`, at: new Date(now).toISOString(), day, choice, ...(restartDate ? { restartDate } : {}) },
        ],
      })),
    [update, now, day],
  );

  // Every outcome starts at the top with its headline focused, like a new step.
  const finish = (o: Exclude<Outcome, null>) => {
    setOutcome(o);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => document.getElementById("pf-title")?.focus({ preventScroll: true }));
  };

  const go = (to: number) => {
    setAt(to);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => document.getElementById("pf-title")?.focus({ preventScroll: true }));
  };

  // The camera: the photo at the centre of the rings, then the map, then low over the water.
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);
  const scene: Pose = {
    dY: 14,
    drop: 0,
    fall: 0,
    ripple: 0,
    map: 1,
    week,
    seasonFrom: season.weeks?.[0] ?? 0,
    seasonTo: season.weeks?.[1] ?? 0,
    shed: 0.8,
    dots: 1,
    cohort: 0,
    focus: 0,
    focusFrom: 0,
    focusTo: 0,
    idle: 0.5,
  };
  const lensActive = outcome === null && step === "dayone";
  const { ref: photoRef, rig: photoRig } = useLensAnchor(pool, lensActive);
  const photoReady = photo !== undefined;
  const poseKey = `${outcome ?? step}|${week}`;
  const make = useCallback(
    (aspect: number): Pose => {
      if (outcome === null && step === "dayone") {
        const rig = photoRig();
        if (rig) return { ...rig, ...scene, labels: 0, dots: 0.5 };
      }
      if (outcome === null && step === "where") return { ...frame(TODAY_FRAME, aspect), ...scene, labels: 1, focusFrom: 24, focusTo: 24, focus: 0.7 };
      if (outcome === null && step === "letter") return { ...frame(SETUP_FRAMES.letter, aspect), ...scene, labels: 0 };
      return { ...frame(BASELINE_FRAMES.done, aspect), ...scene, labels: 0 };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poseKey, photoReady],
  );
  // Wait for the photo (or its absence) so the lens pose has its element.
  usePoolPose(photoReady ? make : null, photoReady ? poseKey : "loading", { enter: { map: 0, ripple: 0.4 }, ms: 1200 });

  // Labels on the rings for "where you are".
  const labelsKey = `${outcome === null && step === "where"}|${week}`;
  useEffect(() => {
    if (!pool) return;
    const here = document.querySelector<HTMLElement>('[data-label="pf-here"]');
    const verdict = document.querySelector<HTMLElement>('[data-label="pf-verdict"]');
    if (!here || !verdict) return;
    const on = outcome === null && step === "where";
    const wide = landscapeness(pool.aspect) > 0.5;
    pool.setLabels([
      { el: here, at: onRing(Math.max(1, week), wide ? 0.55 : -1.25), weight: () => (on && week > 0 ? 1 : 0) },
      { el: verdict, at: onRing(24, wide ? LABEL_ANGLE : -2.1), weight: () => (on ? 1 : 0) },
    ]);
    return () => pool.setLabels([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, labelsKey]);

  const close = () => {
    if (outcome === null) log("closed");
    router.push("/home/");
  };

  return (
    <div className="pf">
      <PoolStage />
      <div aria-hidden="true">
        <div className="pool-label" data-label="pf-here" data-tone="accent">
          <span>{week > 0 ? `You are here, week ${week}` : ""}</span>
        </div>
        <div className="pool-label" data-label="pf-verdict">
          <span>Week 24, a fair verdict</span>
        </div>
      </div>

      <section className="pf-page" aria-labelledby="pf-title">
        <div className="ob-hud pf-hud">
          {outcome === null && at > 0 ? (
            <button type="button" className="ob-back" onClick={() => go(at - 1)} aria-label={PAUSE.back}>
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
          ) : (
            <span className="pf-spacer" />
          )}
          <p className="ob-count num">
            {outcome === null ? `${at + 1} of ${steps.length}` : outcome === "doctor" ? "For your doctor" : "Done"}
            {outcome === null ? <span className="ob-chapter">{PAUSE.steps[["dayone", "where", "letter", "choice"].indexOf(step)]}</span> : null}
          </p>
          {outcome === null ? (
            <div className="ob-ticks" aria-hidden="true">
              {steps.map((s, i) => (
                <i key={s} data-on={i < at || undefined} data-now={i === at || undefined} />
              ))}
            </div>
          ) : null}
          <button type="button" className="pf-close" onClick={close} aria-label={outcome === null ? PAUSE.close : PAUSE.home}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {outcome === "doctor" ? (
          <div className="pf-body pf-doctor">
            <DoctorSummary />
          </div>
        ) : outcome === "kept" ? (
          <div className="pf-body">
            <Pair id="pf-title" tabIndex={-1} title={PAUSE.keep.doneTitle} turn={PAUSE.keep.doneTurn} className="pf-q ob-in" />
            <div className="pf-actions ob-in" style={{ "--i": 1 } as React.CSSProperties}>
              <ButtonLink href="/home/">{PAUSE.home}</ButtonLink>
            </div>
          </div>
        ) : outcome === "paused" ? (
          <div className="pf-body">
            <Pair id="pf-title" tabIndex={-1} title={PAUSE.pause.doneTitle(fmt(restart))} turn={PAUSE.pause.doneTurn} className="pf-q ob-in" />
            <p className="pf-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>
              {curl(PAUSE.pause.doneBody)}
            </p>
            <div className="pf-actions ob-in" style={{ "--i": 2 } as React.CSSProperties}>
              <Button
                variant="quiet"
                onClick={() => {
                  const [h, m] = routine.morning.split(":").map(Number);
                  const start = parseISODate(restart);
                  start.setHours(h ?? 8, m ?? 0, 0, 0);
                  downloadIcs(
                    "week-five-restart.ics",
                    icsCalendar([{ uid: `restart-${restart}`, title: "Week Five: restart today", description: "Same times as before. A small shed after a restart is expected.", start }]),
                  );
                }}
              >
                <CalendarPlus size={18} aria-hidden="true" />
                {PAUSE.pause.calendar}
              </Button>
              <ButtonLink href="/home/">{PAUSE.home}</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="pf-body" key={step}>
            {step === "dayone" ? (
              <div className="pf-split">
                <div className="pf-words">
                  <Pair id="pf-title" tabIndex={-1} title={PAUSE.dayOneTitle} turn={PAUSE.dayOneTurn} className="pf-q ob-in" />
                  {photo === null ? <p className="pf-lead ob-in" style={{ "--i": 1 } as React.CSSProperties}>{PAUSE.dayOneNone}</p> : null}
                  <div className="pf-actions ob-in" style={{ "--i": 2 } as React.CSSProperties}>
                    <Button onClick={() => go(at + 1)}>{PAUSE.next}</Button>
                  </div>
                </div>
                <div className="pf-photo-wrap">
                  <div ref={photoRef} className="pf-photo">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={`Your day-one ${photo.view} photo`} width={600} height={600} />
                    ) : (
                      <HeadGhost view="crown" />
                    )}
                  </div>
                </div>
              </div>
            ) : step === "where" ? (
              <div className="pf-words">
                <Pair
                  id="pf-title"
                  tabIndex={-1}
                  title={day >= 1 ? PAUSE.whereTitle(day, week) : PAUSE.whereEarly}
                  turn={PAUSE.whereTurn}
                  className="pf-q ob-in"
                />
                <WeekTicks day={day} className="pf-ticks ob-in" />
                <div className="pf-actions ob-in" style={{ "--i": 2 } as React.CSSProperties}>
                  <Button onClick={() => go(at + 1)}>{PAUSE.next}</Button>
                </div>
              </div>
            ) : step === "letter" && letter ? (
              <div className="pf-words">
                <Pair id="pf-title" tabIndex={-1} title={PAUSE.letterTitle(fmt(letter.writtenAt.slice(0, 10)))} turn={PAUSE.letterTurn} className="pf-q ob-in" />
                <div className="ob-in" style={{ "--i": 1 } as React.CSSProperties}>
                  <LetterText letter={letter} />
                </div>
                <div className="pf-actions ob-in" style={{ "--i": 2 } as React.CSSProperties}>
                  <Button onClick={() => go(at + 1)}>{PAUSE.next}</Button>
                </div>
              </div>
            ) : (
              <div className="pf-words">
                <Pair id="pf-title" tabIndex={-1} title={PAUSE.factTitle} turn={PAUSE.factTurn} className="pf-q ob-in" />
                <div className="pf-options ob-in" style={{ "--i": 1 } as React.CSSProperties} role="group" aria-label="What would you like to do?">
                  <button
                    type="button"
                    className="pf-option"
                    onClick={() => {
                      log("keep-going");
                      finish("kept");
                    }}
                  >
                    <span className="font-medium">{PAUSE.keep.label}</span>
                    <span className="pf-option-note">{PAUSE.keep.note}</span>
                  </button>
                  <div className="pf-option" data-open={picking || undefined}>
                    <button type="button" className="pf-option-head" aria-expanded={picking} onClick={() => setPicking((p) => !p)}>
                      <span className="font-medium">{PAUSE.pause.label}</span>
                      <span className="pf-option-note">{PAUSE.pause.note}</span>
                    </button>
                    {picking ? (
                      <form
                        className="pf-pick"
                        onSubmit={(e) => {
                          e.preventDefault();
                          log("pause", restart);
                          finish("paused");
                        }}
                      >
                        <label className="ob-date">
                          <span className="text-sm font-medium">{PAUSE.pause.pick}</span>
                          <input
                            type="date"
                            className="ob-text ob-text-sm num"
                            value={restart}
                            min={toISODate(addDays(new Date(), 1))}
                            max={toISODate(addDays(new Date(), 60))}
                            onChange={(e) => setRestart(e.target.value || restart)}
                            required
                          />
                        </label>
                        <Button type="submit">{PAUSE.pause.confirm}</Button>
                      </form>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="pf-option"
                    onClick={() => {
                      log("doctor");
                      finish("doctor");
                    }}
                  >
                    <span className="font-medium">{PAUSE.doctor.label}</span>
                    <span className="pf-option-note">{PAUSE.doctor.note}</span>
                  </button>
                </div>
                <button type="button" className="pf-skip ob-in" style={{ "--i": 2 } as React.CSSProperties} onClick={close}>
                  {PAUSE.close}
                </button>
              </div>
            )}
          </div>
        )}
        <p className="sr-only" aria-live="polite">
          {outcome === "kept" ? PAUSE.keep.done : outcome === "paused" ? PAUSE.pause.done(fmt(restart)) : ""}
        </p>
      </section>
    </div>
  );
}
