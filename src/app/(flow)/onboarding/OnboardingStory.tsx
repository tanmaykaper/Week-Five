"use client";

import { ArrowLeft, Check, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { LABEL_ANGLE, LABEL_ANGLE_PHONE, onRing } from "@/components/pool/geometry";
import { frame, landscapeness, SETUP_FRAMES, type SetupFrame } from "@/components/pool/poses";
import { Gate } from "@/components/shell/Gate";
import { Button, curl, Pair } from "@/components/ui/primitives";
import { cityById, searchCities } from "@/content/cities";
import {
  AGE_OPTIONS,
  CHANNEL_OPTIONS,
  FINISH,
  LETTER,
  PRODUCT_OPTIONS,
  REMINDERS,
  SOMEWHERE_ELSE,
  STEP_IDS,
  WORRY_OPTIONS,
  type StepId,
} from "@/content/onboarding";
import { skuByCode } from "@/content/skus";
import { canContinue, defaultTimes, draftFromPack, finishPlan, startDateProblem, startPicks } from "@/lib/onboarding";
import { parseStartParams } from "@/lib/params";
import { seasonFor, type Season } from "@/lib/season";
import type { Draft } from "@/lib/storage/schema";
import { stepCopy } from "@/content/hinglish";
import { useApp } from "@/lib/storage/store";
import { addDays, dateOfDay, journeyDay, parseISODate, SHED_WINDOW, toISODate, weekOf } from "@/lib/time/journey";
import { Briefing } from "./Briefing";
import "./onboarding.css";

const LEAVE_MS = 220;

export const fmtDate = (iso: string, withYear = false) =>
  parseISODate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });

/** What the pool shows for the answers so far: the week you're in, the rains, the shed window. */
function mapState(draft: Draft, now: Date, upTo: number): { week: number; season: Season; start: string } {
  const start = draft.startDate ?? draft.pack?.reg ?? toISODate(now);
  const day = journeyDay(start, now);
  const showWeek = upTo >= STEP_IDS.indexOf("start") && draft.startDate;
  return {
    week: showWeek && day >= 1 ? Math.min(24, weekOf(day)) : 0,
    season: upTo >= STEP_IDS.indexOf("city") ? seasonFor(start, draft.cityId ?? null, draft.seasonOverride ?? null) : { months: [], weeks: null, overlapsShed: false },
    start,
  };
}

/**
 * Setup as a story: one question per screen over the pool. Each answer is saved as it is
 * given, so closing the tab resumes at the same question.
 */
export function OnboardingStory() {
  const status = useApp((s) => s.status);
  const mode = useApp((s) => s.mode);
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const router = useRouter();
  const search = useSearchParams();
  const briefing = search.get("step") === "briefing";
  const now = useMemo(() => new Date(), []);

  const stored = data.onboarding.step;
  const draft = useMemo(() => data.onboarding.draft ?? {}, [data.onboarding.draft]);
  const done = Boolean(data.onboarding.completedAt);
  const index = done ? STEP_IDS.length : Math.min(stored, STEP_IDS.length);

  const [phase, setPhase] = useState<"in" | "out">("in");
  // While a question is leaving it stays on screen; then the stored step takes over.
  const [leaving, setLeaving] = useState<number | null>(null);
  const shown = leaving ?? index;
  const [dir, setDir] = useState<1 | -1>(1);

  // A pack scanned on the way in fills in what it can, once.
  useEffect(() => {
    if (status !== "ready" || done) return;
    const parsed = parseStartParams(search);
    if (parsed.kind !== "ok" || draft.pack) return;
    update((s) => ({ ...s, onboarding: { ...s.onboarding, draft: draftFromPack(s.onboarding.draft ?? {}, parsed.params, now) } }));
  }, [status, done, search, draft.pack, update, now]);

  // Demo mode has its own finished plan; setup belongs to the real one.
  useEffect(() => {
    if (status === "ready" && mode === "demo") router.replace("/home");
  }, [status, mode, router]);

  const setDraft = useCallback(
    (patch: Partial<Draft>) => update((s) => ({ ...s, onboarding: { ...s.onboarding, draft: { ...(s.onboarding.draft ?? {}), ...patch } } })),
    [update],
  );

  const go = useCallback(
    (to: number) => {
      setDir(to >= index ? 1 : -1);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const commit = () => {
        update((s) => {
          if (to >= STEP_IDS.length && !s.onboarding.completedAt) return finishPlan(s, new Date());
          return { ...s, onboarding: { ...s.onboarding, step: Math.max(0, to) } };
        });
        setPhase("in");
        setLeaving(null);
        window.scrollTo({ top: 0 });
        document.getElementById("ob-question")?.focus({ preventScroll: true });
      };
      if (reduced) return commit();
      setLeaving(index);
      setPhase("out");
      window.setTimeout(commit, LEAVE_MS);
    },
    [index, update],
  );

  const stepId: StepId | "finish" = shown < STEP_IDS.length ? STEP_IDS[shown]! : "finish";
  const map = mapState(draft, now, shown);

  // The camera: a new view for each question; the rings follow the answers.
  const poseKey = `${briefing ? "briefing" : stepId}|${map.week}|${map.season.weeks?.join("-") ?? "dry"}`;
  const make = useCallback(
    (aspect: number): Pose => {
      const which: SetupFrame = briefing ? "briefing" : stepId;
      const seen = shown >= STEP_IDS.indexOf("start");
      return {
        ...frame(SETUP_FRAMES[which], aspect),
        dY: which === "products" ? 2.05 : 14,
        tilt: which === "products" ? 0.18 : 1.05,
        spin: which === "products" ? 0.4 : 0,
        squeeze: 0,
        level: 0.6,
        drop: 0,
        fall: 0,
        ripple: 0,
        map: 1,
        week: map.week,
        seasonFrom: map.season.weeks?.[0] ?? 0,
        seasonTo: map.season.weeks?.[1] ?? 0,
        shed: which === "channel" || which === "finish" ? 1 : 0.6,
        dots: seen ? 1 : 0,
        cohort: 0,
        labels: which === "city" || which === "start" || which === "finish" ? 1 : 0,
        idle: 1,
        ...(briefing ? {} : { focus: 0, focusFrom: 0, focusTo: 0 }),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poseKey, shown],
  );
  usePoolPose(status === "ready" ? make : null, poseKey, { enter: { map: 0, ripple: 0.4 }, ms: 1200 });

  if (status !== "ready" || mode === "demo") return <Gate needsPlan={false}>{null}</Gate>;

  if (briefing && done) return <Briefing />;

  const copy = stepId !== "finish" ? stepCopy(stepId, data.settings.lang, Boolean(draft.pack)) : null;
  const ok = stepId === "finish" ? true : canContinue(stepId, draft, now);

  return (
    <section className="ob wrap" data-phase={phase} data-dir={dir} aria-labelledby="ob-question">
      <SetupLabels map={map} stepId={stepId} />
      <div className="ob-hud">
        <button
          type="button"
          className="ob-back"
          onClick={() => (shown === 0 || stepId === "finish" ? router.push("/start/") : go(shown - 1))}
          aria-label={shown === 0 ? "Back to the welcome screen" : "Back to the previous question"}
          disabled={stepId === "finish"}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <p className="ob-count num" aria-live="polite">
          {stepId === "finish" ? "All set" : `${shown + 1} of ${STEP_IDS.length}`}
          <span className="ob-chapter">{copy?.chapter ?? "Your plan"}</span>
        </p>
        <div className="ob-ticks" aria-hidden="true">
          {STEP_IDS.map((id, i) => (
            <i key={id} data-on={i < shown || stepId === "finish" ? true : undefined} data-now={i === shown || undefined} />
          ))}
        </div>
      </div>

      <div className="ob-body" key={shown}>
        {copy ? (
          <Pair
            id="ob-question"
            title={copy.title}
            turn={copy.turn}
            className="ob-q ob-in"
            style={{ "--i": 0 } as React.CSSProperties}
          />
        ) : (
          <Pair id="ob-question" title={FINISH.title} turn={FINISH.turn} className="ob-q ob-in" style={{ "--i": 0 } as React.CSSProperties} />
        )}

        <form
          className="ob-answer ob-in"
          style={{ "--i": 1 } as React.CSSProperties}
          onSubmit={(e) => {
            e.preventDefault();
            if (stepId === "finish") return router.push("/onboarding/?step=briefing");
            if (ok) go(shown + 1);
          }}
        >
          <StepInput stepId={stepId} draft={draft} setDraft={setDraft} now={now} map={map} advance={() => go(shown + 1)} />

          <div className="ob-actions">
            {stepId === "finish" ? (
              <Button type="submit">{FINISH.action}</Button>
            ) : (
              <>
                <Button type="submit" disabled={!ok}>
                  {shown === STEP_IDS.length - 1 ? "Finish" : "Continue"}
                </Button>
                {copy?.skip ? (
                  <Button
                    variant="quiet"
                    onClick={() => {
                      if (stepId === "age") setDraft({ ageBand: null });
                      if (stepId === "city") setDraft({ cityId: null, seasonOverride: null });
                      if (stepId === "worries") setDraft({ worries: [] });
                      if (stepId === "letter") setDraft({ letter: "" });
                      go(shown + 1);
                    }}
                  >
                    {copy.skip}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function StepInput({
  stepId,
  draft,
  setDraft,
  now,
  map,
  advance,
}: {
  stepId: StepId | "finish";
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  now: Date;
  map: ReturnType<typeof mapState>;
  advance: () => void;
}) {
  switch (stepId) {
    case "name":
      return (
        <label className="ob-field">
          <span className="sr-only">Your name or nickname</span>
          <input
            className="ob-text"
            autoFocus
            autoComplete="given-name"
            maxLength={24}
            placeholder="e.g. Arjun"
            value={draft.nickname ?? ""}
            onChange={(e) => setDraft({ nickname: e.target.value })}
          />
          <span className="ob-hint">Leave it blank and we&apos;ll say &ldquo;you&rdquo;.</span>
        </label>
      );
    case "age":
      return (
        <Choice
          label="Age band"
          options={AGE_OPTIONS}
          value={draft.ageBand ?? undefined}
          onPick={(v) => {
            const times = defaultTimes(v);
            setDraft({ ageBand: v, morning: draft.morning ?? times.morning, evening: draft.evening ?? times.evening });
            advance();
          }}
        />
      );
    case "city":
      return <CityStep draft={draft} setDraft={setDraft} season={map.season} start={map.start} />;
    case "products":
      return (
        <Chips
          label="Products"
          options={PRODUCT_OPTIONS}
          values={draft.products ?? []}
          onChange={(products) => setDraft({ products })}
          note={draft.pack ? `From your pack: ${skuByCode(draft.pack.sku)?.name ?? draft.pack.sku}.` : "Pick at least one."}
        />
      );
    case "channel":
      return (
        <Choice
          label="Where you bought it"
          options={CHANNEL_OPTIONS}
          value={draft.channel}
          onPick={(channel) => {
            setDraft({ channel });
            advance();
          }}
        />
      );
    case "start":
      return <StartStep draft={draft} setDraft={setDraft} now={now} season={map.season} />;
    case "worries":
      return <Chips label="What bothers you most" options={WORRY_OPTIONS} values={draft.worries ?? []} onChange={(worries) => setDraft({ worries })} />;
    case "letter":
      return <LetterStep draft={draft} setDraft={setDraft} />;
    case "reminders":
      return <RemindersStep draft={draft} setDraft={setDraft} />;
    case "finish":
      return <PlanSummary draft={draft} map={map} />;
  }
}

/** Single choice: big rows, auto-advance after a beat so the choice registers. */
function Choice<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { value: T; label: string; note?: string }[];
  value: T | undefined;
  onPick: (v: T) => void;
}) {
  const [picked, setPicked] = useState<T | undefined>(value);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div role="radiogroup" aria-label={label} className="ob-choices">
      {options.map((o) => {
        const on = picked === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className="ob-choice"
            onClick={() => {
              setPicked(o.value);
              window.clearTimeout(timer.current);
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              timer.current = window.setTimeout(() => onPick(o.value), reduced ? 0 : 360);
            }}
          >
            <span className="grid text-left">
              <span className="font-medium">{o.label}</span>
              {o.note ? <span className="ob-choice-note">{o.note}</span> : null}
            </span>
            <span className="ob-tick" aria-hidden="true">
              {on ? <Check size={16} weight="bold" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Chips<T extends string>({
  label,
  options,
  values,
  onChange,
  note,
}: {
  label: string;
  options: { value: T; label: string }[];
  values: T[];
  onChange: (v: T[]) => void;
  note?: string;
}) {
  return (
    <div>
      <div role="group" aria-label={label} className="ob-chips">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              className="ob-chip"
              onClick={() => onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])}
            >
              {on ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
              {o.label}
            </button>
          );
        })}
      </div>
      {note ? <p className="ob-hint">{note}</p> : null}
    </div>
  );
}

function seasonLine(season: Season, place: string): string {
  if (!season.weeks) return `No rainy months inside your 24 weeks${place ? ` in ${place}` : ""}. One less thing muddying the picture.`;
  const [a, b] = season.weeks;
  const span = a === b ? `week ${a}` : `weeks ${a} to ${b}`;
  if (season.overlapsShed) return `The rains land on ${span}, on top of the shed window. We'll tell you which hair fall is the season.`;
  return `The rains land on ${span} of your plan, clear of the shed window.`;
}

function CityStep({ draft, setDraft, season, start }: { draft: Draft; setDraft: (p: Partial<Draft>) => void; season: Season; start: string }) {
  const chosen = cityById(draft.cityId);
  const elsewhere = draft.cityId === null && draft.seasonOverride !== undefined;
  const [query, setQuery] = useState(chosen?.name ?? "");
  const results = searchCities(chosen && query === chosen.name ? "" : query, 6);
  const answered = Boolean(chosen) || elsewhere;
  return (
    <div className="grid gap-4">
      <label className="ob-search">
        <MagnifyingGlass size={20} aria-hidden="true" />
        <span className="sr-only">Search cities</span>
        <input
          className="ob-text ob-text-sm"
          value={query}
          placeholder="Search, e.g. Pune"
          autoComplete="address-level2"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div role="radiogroup" aria-label="City" className="ob-chips">
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={draft.cityId === c.id}
            className="ob-chip"
            onClick={() => {
              setDraft({ cityId: c.id, seasonOverride: null });
              setQuery(c.name);
            }}
          >
            {draft.cityId === c.id ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
            {c.name}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={elsewhere}
          className="ob-chip"
          onClick={() => setDraft({ cityId: null, seasonOverride: "monsoon" })}
        >
          {elsewhere ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
          {SOMEWHERE_ELSE.label}
        </button>
      </div>
      {elsewhere ? (
        <div className="ob-sub">
          <p className="font-medium">{SOMEWHERE_ELSE.question}</p>
          <div role="radiogroup" aria-label={SOMEWHERE_ELSE.question} className="ob-chips mt-3">
            {SOMEWHERE_ELSE.options.map((o) => {
              const on = o.value === "no-monsoon" ? draft.seasonOverride === "no-monsoon" : o.value === "monsoon" ? draft.seasonOverride === "monsoon" : false;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className="ob-chip"
                  onClick={() => setDraft({ cityId: null, seasonOverride: o.value === "no-monsoon" ? "no-monsoon" : "monsoon" })}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <p className="ob-hint">Not sure counts as yes. You can change it later.</p>
        </div>
      ) : null}
      <p className="ob-live" aria-live="polite">
        {answered ? (
          <>
            <span className="ob-live-dot" data-tone="rain" aria-hidden="true" />
            {seasonLine(season, chosen?.name ?? "")}
            {draft.startDate ? null : ` (Counted from ${fmtDate(start)}; you'll set your start in a moment.)`}
          </>
        ) : (
          "Pick one and watch the rings: rain marks the weeks your monsoon covers."
        )}
      </p>
    </div>
  );
}

function StartStep({ draft, setDraft, now, season }: { draft: Draft; setDraft: (p: Partial<Draft>) => void; now: Date; season: Season }) {
  const picks = startPicks(now, draft.pack?.reg);
  const value = draft.startDate;
  const problem = value ? startDateProblem(value, now) : null;
  const day = value && !problem ? journeyDay(value, now) : null;
  const shedFrom = value && !problem ? fmtDate(toISODate(dateOfDay(value, SHED_WINDOW.startDay))) : null;
  const shedTo = value && !problem ? fmtDate(toISODate(dateOfDay(value, SHED_WINDOW.endDay))) : null;
  return (
    <div className="grid gap-4">
      <div role="radiogroup" aria-label="Quick picks" className="ob-chips">
        {picks.map((p) => (
          <button key={p.label} type="button" role="radio" aria-checked={value === p.value} className="ob-chip" onClick={() => setDraft({ startDate: p.value })}>
            {value === p.value ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
            {p.label}
          </button>
        ))}
      </div>
      <label className="ob-date">
        <span className="text-sm font-medium">Or pick a day</span>
        <input
          type="date"
          className="ob-text ob-text-sm num"
          value={value ?? ""}
          min={toISODate(addDays(now, -365))}
          max={toISODate(addDays(now, 60))}
          onChange={(e) => setDraft({ startDate: e.target.value || undefined })}
        />
      </label>
      <p className="ob-live" aria-live="polite">
        {problem ? (
          <span className="text-alert">{problem}</span>
        ) : day === null ? (
          "Day one is the first day you put it on. If you haven't yet, pick when you will."
        ) : (
          <>
            <span className="ob-live-dot" aria-hidden="true" />
            {day >= 1
              ? `Day one is ${fmtDate(value!)}. Today is day ${day}, week ${Math.min(24, weekOf(day))}. Your shed window runs ${shedFrom} to ${shedTo}.`
              : `Your plan starts in ${1 - day} ${1 - day === 1 ? "day" : "days"}, on ${fmtDate(value!)}. The shed window runs ${shedFrom} to ${shedTo}.`}
            {season.overlapsShed ? " The rains overlap it." : ""}
          </>
        )}
      </p>
    </div>
  );
}

function LetterStep({ draft, setDraft }: { draft: Draft; setDraft: (p: Partial<Draft>) => void }) {
  const text = draft.letter ?? "";
  return (
    <label className="ob-letter">
      <span className="sr-only">A note to yourself for week five</span>
      <textarea
        maxLength={400}
        rows={5}
        placeholder={LETTER.placeholder}
        value={text}
        onChange={(e) => setDraft({ letter: e.target.value })}
      />
      <span className="ob-hint flex justify-between gap-4">
        <span>{LETTER.hint}</span>
        <span className="num shrink-0">{400 - text.length}</span>
      </span>
    </label>
  );
}

function RemindersStep({ draft, setDraft }: { draft: Draft; setDraft: (p: Partial<Draft>) => void }) {
  const times = defaultTimes(draft.ageBand);
  const [denied, setDenied] = useState(false);
  const supported = typeof window !== "undefined" && "Notification" in window;
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="ob-time">
          <span className="text-sm font-medium">{REMINDERS.morning}</span>
          <input type="time" className="ob-text ob-text-sm num" value={draft.morning ?? times.morning} onChange={(e) => setDraft({ morning: e.target.value || times.morning })} />
        </label>
        <label className="ob-time">
          <span className="text-sm font-medium">{REMINDERS.evening}</span>
          <input type="time" className="ob-text ob-text-sm num" value={draft.evening ?? times.evening} onChange={(e) => setDraft({ evening: e.target.value || times.evening })} />
        </label>
      </div>
      {supported ? (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(draft.notifications)}
          className="ob-switch"
          onClick={async () => {
            if (draft.notifications) return setDraft({ notifications: false });
            const result = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
            setDenied(result !== "granted");
            setDraft({ notifications: result === "granted" });
          }}
        >
          <span className="grid text-left">
            <span className="font-medium">{REMINDERS.notifications}</span>
            <span className="ob-choice-note">{denied ? REMINDERS.denied : REMINDERS.notificationsNote}</span>
          </span>
          <span className="ob-switch-track" aria-hidden="true">
            <span />
          </span>
        </button>
      ) : (
        <p className="ob-hint">{REMINDERS.denied}</p>
      )}
    </div>
  );
}

function PlanSummary({ draft, map }: { draft: Draft; map: ReturnType<typeof mapState> }) {
  const start = map.start;
  const rows: [string, string][] = [
    ["Day one", fmtDate(start, true)],
    ["Shed window", `${fmtDate(toISODate(dateOfDay(start, SHED_WINDOW.startDay)))} to ${fmtDate(toISODate(dateOfDay(start, SHED_WINDOW.endDay)))}`],
    ["Rains", map.season.weeks ? `Weeks ${map.season.weeks[0]} to ${map.season.weeks[1]}` : "None in your 24 weeks"],
    ["Photo days", `Every four weeks, first on ${fmtDate(toISODate(dateOfDay(start, 28)))}`],
    ["A fair verdict", fmtDate(toISODate(dateOfDay(start, 168)), true)],
  ];
  return (
    <div className="grid gap-5">
      <p className="text-lead text-text-2">{curl(`${draft.nickname?.trim() ? `${draft.nickname.trim()}, here` : "Here"}'s your plan. ${FINISH.lead}`)}</p>
      <dl className="ob-summary">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className="num">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Labels on the rings for the questions that change them. */
function SetupLabels({ map, stepId }: { map: ReturnType<typeof mapState>; stepId: StepId | "finish" }) {
  const pool = usePool();
  const ref = useRef<HTMLDivElement>(null);
  const rain = map.season.weeks;
  useEffect(() => {
    if (!pool || !ref.current) return;
    // Spread round the rings so they never stack. Phones have room for one, beside the answers.
    const wide = landscapeness(pool.aspect) > 0.5;
    const el = (n: string) => ref.current!.querySelector<HTMLElement>(`[data-label="${n}"]`)!;
    const show = (on: boolean) => () => (on ? 1 : 0);
    pool.setLabels([
      { el: el("now"), at: onRing(Math.max(1, map.week), wide ? 0.55 : LABEL_ANGLE_PHONE + 3.4), weight: show(map.week > 0 && (wide || stepId !== "city")) },
      { el: el("rain"), at: onRing(rain ? rain[1] : 1, wide ? -0.55 : -1.95), weight: show(Boolean(rain) && (wide || stepId === "city")) },
      { el: el("shed"), at: onRing(8, -1.75), weight: show(wide && stepId !== "city") },
      { el: el("verdict"), at: onRing(24, LABEL_ANGLE), weight: show(wide && (stepId === "finish" || stepId === "start")) },
    ]);
    return () => pool.setLabels([]);
  }, [pool, map.week, rain, stepId]);
  return (
    <div ref={ref} aria-hidden="true">
      <div className="pool-label" data-label="now" data-tone="accent">
        <span>{map.week > 0 ? `You are here, week ${map.week}` : ""}</span>
      </div>
      <div className="pool-label" data-label="rain" data-tone="rain">
        <span>{rain ? `Rains, ${rain[0] === rain[1] ? `week ${rain[0]}` : `weeks ${rain[0]} to ${rain[1]}`}` : ""}</span>
      </div>
      <div className="pool-label" data-label="shed">
        <span>Shed window</span>
      </div>
      <div className="pool-label" data-label="verdict">
        <span>Week 24, a fair verdict</span>
      </div>
    </div>
  );
}
