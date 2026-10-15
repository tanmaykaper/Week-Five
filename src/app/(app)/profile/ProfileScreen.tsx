"use client";

import { CalendarPlus, CaretRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { onRing } from "@/components/pool/geometry";
import { frame, PROFILE_FRAME } from "@/components/pool/poses";
import { PoolStage } from "@/components/pool/PoolStage";
import { StagePool } from "@/components/pool/StagePool";
import { Gate } from "@/components/shell/Gate";
import { ButtonLink, Pair } from "@/components/ui/primitives";
import { CITIES, cityById } from "@/content/cities";
import { AGE_OPTIONS, CHANNEL_OPTIONS, PRODUCT_OPTIONS, WORRY_OPTIONS } from "@/content/onboarding";
import { PROFILE } from "@/content/profile";
import { ROUTINE_COPY } from "@/content/routines";
import { PRODUCT_WORDS } from "@/content/today";
import { useJourney } from "@/lib/hooks/useJourney";
import { downloadIcs, icsCalendar } from "@/lib/ics";
import { askToNotify, notifyState, type NotifyState } from "@/lib/notify";
import { startDateProblem } from "@/lib/onboarding";
import { calendarEvents, dailyEvents } from "@/lib/reminders";
import { hoursApart, MONDAY_FIRST, routineAdvice, toggleRollerNight, weekPlan } from "@/lib/routine";
import { monsoonMonths, seasonFor } from "@/lib/season";
import type { AgeBand, AppState, Channel, ProductId, Profile, Worry } from "@/lib/storage/schema";
import { useApp, type ThemeSetting } from "@/lib/storage/store";
import { parseISODate, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";
import "@/components/ui/stage.css";
import "./profile.css";

const THEMES: { value: ThemeSetting; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const LANGS: { value: "en" | "hinglish"; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hinglish", label: "Hinglish" },
];

const noopSubscribe = () => () => {};

const fmtDate = (iso: string) => parseISODate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * You (BUILD_DOC F18 and F13): every setup answer, the routine with its timing suggestions,
 * reminders, the look, sample data, and the way to your data. On the pool like the other
 * app pages, with the whole plan lying calm on the water.
 */
export function ProfileScreen() {
  return (
    <Gate needsPlan={false}>
      <YouPage />
    </Gate>
  );
}

function YouPage() {
  const profile = useApp((s) => s.data.profile);
  const { day } = useJourney();
  const heroRef = useRef<HTMLElement>(null);
  const here = day !== null && day >= 1 ? Math.min(TOTAL_WEEKS, weekOf(day)) : 0;
  const season = useMemo(
    () => (profile ? seasonFor(profile.startDate, profile.cityId, profile.seasonOverride) : null),
    [profile],
  );

  return (
    <div className="st yo">
      <PoolStage />
      <StagePool
        heroRef={heroRef}
        poseKey={`you|${here}|${season?.weeks?.join("-") ?? "dry"}`}
        pose={(aspect) => ({
          ...frame(PROFILE_FRAME, aspect),
          dY: 14,
          drop: 0,
          fall: 0,
          ripple: 0,
          map: 1,
          week: here,
          seasonFrom: season?.weeks?.[0] ?? 0,
          seasonTo: season?.weeks?.[1] ?? 0,
          shed: 0.6,
          dots: 1,
          cohort: 0,
          labels: 1,
          focus: 0,
          focusFrom: 0,
          focusTo: 0,
          idle: 1,
        })}
        labels={[{ name: "here", text: here ? `You are here, week ${here}` : "", tone: "accent", at: onRing(Math.max(1, here), 0.7), show: (wide) => wide && here > 0 }]}
      />

      <section ref={heroRef} className="st-hero" aria-labelledby="yo-title">
        <div className="st-words">
          <p className="st-kicker reveal" style={{ "--i": 0 } as React.CSSProperties}>
            {PROFILE.kicker}
          </p>
          <Pair
            id="yo-title"
            title={PROFILE.title(profile?.nickname.trim() ?? "")}
            turn={PROFILE.turn(day ?? 0)}
            className="st-pair reveal"
            style={{ "--i": 1 } as React.CSSProperties}
          />
          <p className="st-lead reveal" style={{ "--i": 2 } as React.CSSProperties}>
            {PROFILE.lead}
          </p>
          {profile ? (
            <ul className="yo-facts st-phone-hide reveal" style={{ "--i": 3 } as React.CSSProperties}>
              <li>
                <span>Started</span>
                <span className="num">{fmtDate(profile.startDate)}</span>
              </li>
              <li>
                <span>City</span>
                <span>{cityById(profile.cityId)?.name ?? (profile.seasonOverride ? PROFILE.cityElsewhere : PROFILE.cityNone)}</span>
              </li>
              <li>
                <span>Routine</span>
                <span>{profile.products.map((p) => PRODUCT_OPTIONS.find((o) => o.value === p)?.label ?? p).join(", ")}</span>
              </li>
            </ul>
          ) : null}
          <div className="st-actions reveal" style={{ "--i": 4 } as React.CSSProperties}>
            {profile ? (
              <a href="#plan" className={"inline-flex h-12 items-center rounded-full bg-action px-6 text-[0.9375rem] font-medium text-on-action transition-colors duration-200 ease-settle hover:bg-action-hover"}>
                {PROFILE.editPlan}
              </a>
            ) : (
              <ButtonLink href="/start">Start setup</ButtonLink>
            )}
            <Link href="/profile/data" className="st-link px-2">
              {PROFILE.data}
            </Link>
          </div>
        </div>
      </section>

      <div className="st-sheet">
        <div className="wrap st-grid">
          <div className="st-main">
            {profile ? <Plan profile={profile} /> : null}
            {profile ? <RoutineSection profile={profile} /> : null}
          </div>
          <aside className="st-side">
            {profile ? <RemindersSection /> : null}
            <Look />
            <Demo />
            <section aria-labelledby="yo-more">
              <h2 id="yo-more" className="st-h">
                {PROFILE.moreTitle}
              </h2>
              <div className="st-rows mt-4">
                <RowLink href="/profile/data" label={PROFILE.data} hint={PROFILE.dataHint} />
                {profile ? <RowLink href="/reorder" label={PROFILE.supply} hint={PROFILE.supplyHint} /> : null}
                <RowLink href="/about" label={PROFILE.about} hint={PROFILE.aboutHint} />
              </div>
            </section>
            {profile ? (
              <section className="st-panel" aria-labelledby="yo-stop">
                <h2 id="yo-stop" className="st-h">
                  {PROFILE.stopTitle}
                </h2>
                <p className="st-body">{PROFILE.stopBody}</p>
                <ButtonLink variant="quiet" href="/pause" className="mt-5">
                  {PROFILE.stopAction}
                </ButtonLink>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function RowLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="st-row yo-link group">
      <span className="st-row-main">
        <span className="st-row-title">{label}</span>
        <span className="st-row-sub">{hint}</span>
      </span>
      <CaretRight size={18} className="mr-2 text-text-3 transition-transform duration-200 ease-settle group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/* ---------- your plan: every setup answer, editable in place ---------- */

type Field = "name" | "age" | "city" | "products" | "channel" | "start" | "worries";

function Plan({ profile }: { profile: Profile }) {
  const update = useApp((s) => s.update);
  const [open, setOpen] = useState<Field | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { day } = useJourney();
  const save = (change: (p: Profile) => Profile) => {
    update((s: AppState) => ({ ...s, profile: change(s.profile!) }));
    setOpen(null);
    setStatus(PROFILE.saved);
  };
  const label = <T extends string>(opts: { value: T; label: string }[], v: T) => opts.find((o) => o.value === v)?.label ?? v;

  const cityText = cityById(profile.cityId)?.name ?? (profile.seasonOverride === "monsoon" ? `${PROFILE.cityElsewhere}, with rains` : profile.seasonOverride === "no-monsoon" ? `${PROFILE.cityElsewhere}, no rains` : PROFILE.cityNone);

  const rows: { id: Field; label: string; value: string; editor: ReactNode }[] = [
    { id: "name", label: PROFILE.name, value: profile.nickname.trim() || "Not set", editor: <NameEditor initial={profile.nickname} onSave={(v) => save((p) => ({ ...p, nickname: v }))} onCancel={() => setOpen(null)} /> },
    {
      id: "age",
      label: PROFILE.age,
      value: profile.ageBand ? label(AGE_OPTIONS, profile.ageBand) : PROFILE.ageNone,
      editor: <OneOf options={[...AGE_OPTIONS, { value: "none" as const, label: PROFILE.ageNone }]} initial={profile.ageBand ?? "none"} onSave={(v) => save((p) => ({ ...p, ageBand: v === "none" ? null : (v as AgeBand) }))} onCancel={() => setOpen(null)} />,
    },
    { id: "city", label: PROFILE.city, value: cityText, editor: <CityEditor profile={profile} onSave={(cityId, seasonOverride) => save((p) => ({ ...p, cityId, seasonOverride }))} onCancel={() => setOpen(null)} /> },
    {
      id: "products",
      label: PROFILE.products,
      value: profile.products.map((p) => label(PRODUCT_OPTIONS, p)).join(", "),
      editor: <ManyOf options={PRODUCT_OPTIONS} initial={profile.products} min={1} onSave={(v) => save((p) => ({ ...p, products: v as ProductId[] }))} onCancel={() => setOpen(null)} />,
    },
    {
      id: "channel",
      label: PROFILE.channel,
      value: label(CHANNEL_OPTIONS, profile.channel),
      editor: <OneOf options={CHANNEL_OPTIONS} initial={profile.channel} onSave={(v) => save((p) => ({ ...p, channel: v as Channel }))} onCancel={() => setOpen(null)} />,
    },
    {
      id: "start",
      label: PROFILE.start,
      value: `${fmtDate(profile.startDate)}${day !== null && day >= 1 ? `, day ${day}` : ""}`,
      editor: <StartEditor initial={profile.startDate} onSave={(v) => save((p) => ({ ...p, startDate: v }))} onCancel={() => setOpen(null)} />,
    },
    {
      id: "worries",
      label: PROFILE.worries,
      value: profile.worries.length ? profile.worries.map((w) => label(WORRY_OPTIONS, w)).join(", ") : PROFILE.worriesNone,
      editor: <ManyOf options={WORRY_OPTIONS} initial={profile.worries} min={0} onSave={(v) => save((p) => ({ ...p, worries: v as Worry[] }))} onCancel={() => setOpen(null)} />,
    },
  ];

  return (
    <section id="plan" aria-labelledby="yo-plan">
      <h2 id="yo-plan" className="st-h">
        {PROFILE.planTitle}
      </h2>
      <p className="st-body">{PROFILE.planLead}</p>
      <ul className="st-rows mt-5">
        {rows.map((r) => (
          <li key={r.id} className="st-row yo-field" data-open={open === r.id || undefined}>
            {open === r.id ? (
              <div className="yo-editor">
                <p className="st-row-title">{r.label}</p>
                {r.editor}
              </div>
            ) : (
              <>
                <span className="st-row-main">
                  <span className="st-row-sub">{r.label}</span>
                  <span className="st-row-title">{r.value}</span>
                </span>
                <button type="button" className="st-mini" onClick={() => (setOpen(r.id), setStatus(null))} aria-label={`${PROFILE.change} ${r.label.toLowerCase()}`}>
                  {PROFILE.change}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="st-status" role="status">
        {status}
      </p>
    </section>
  );
}

function EditorActions({ onCancel, disabled }: { onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="yo-editor-actions">
      <button type="submit" className="st-mini" data-tone="primary" disabled={disabled}>
        {PROFILE.save}
      </button>
      <button type="button" className="st-mini" onClick={onCancel}>
        {PROFILE.cancel}
      </button>
    </div>
  );
}

function NameEditor({ initial, onSave, onCancel }: { initial: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  return (
    <form className="st-form" onSubmit={(e) => (e.preventDefault(), onSave(v.trim().slice(0, 24)))}>
      <input className="st-field" value={v} maxLength={24} onChange={(e) => setV(e.target.value)} placeholder={PROFILE.namePlaceholder} aria-label={PROFILE.name} autoFocus />
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function OneOf<T extends string>({ options, initial, onSave, onCancel }: { options: { value: T; label: string }[]; initial: T; onSave: (v: T) => void; onCancel: () => void }) {
  const [v, setV] = useState<T>(initial);
  return (
    <form className="st-form" onSubmit={(e) => (e.preventDefault(), onSave(v))}>
      <div className="st-chips" role="radiogroup">
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={v === o.value} className="st-chip" onClick={() => setV(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function ManyOf<T extends string>({ options, initial, min, onSave, onCancel }: { options: { value: T; label: string }[]; initial: T[]; min: number; onSave: (v: T[]) => void; onCancel: () => void }) {
  const [v, setV] = useState<T[]>(initial);
  const toggle = (x: T) => setV((cur) => (cur.includes(x) ? cur.filter((y) => y !== x) : [...cur, x]));
  return (
    <form className="st-form" onSubmit={(e) => (e.preventDefault(), onSave(options.map((o) => o.value).filter((x) => v.includes(x))))}>
      <div className="st-chips" role="group">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={v.includes(o.value)} className="st-chip" onClick={() => toggle(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {v.length < min ? <p className="st-fine mt-0">{PROFILE.productsNeedOne}</p> : null}
      <EditorActions onCancel={onCancel} disabled={v.length < min} />
    </form>
  );
}

function CityEditor({ profile, onSave, onCancel }: { profile: Profile; onSave: (cityId: string | null, season: Profile["seasonOverride"]) => void; onCancel: () => void }) {
  const [city, setCity] = useState(profile.cityId ?? (profile.seasonOverride ? "elsewhere" : ""));
  const [rains, setRains] = useState<"monsoon" | "no-monsoon" | "unsure">(profile.seasonOverride ?? "unsure");
  const cities = useMemo(() => [...CITIES].sort((a, b) => a.name.localeCompare(b.name)), []);
  return (
    <form
      className="st-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (city === "elsewhere") onSave(null, rains === "unsure" ? null : rains);
        else onSave(city || null, null);
      }}
    >
      <select className="st-field" value={city} onChange={(e) => setCity(e.target.value)} aria-label={PROFILE.city}>
        <option value="">{PROFILE.cityNone}</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}, {c.state}
          </option>
        ))}
        <option value="elsewhere">{PROFILE.cityElsewhere}</option>
      </select>
      {city === "elsewhere" ? (
        <div className="grid gap-3">
          <p className="st-body">{PROFILE.rainsQuestion}</p>
          <div className="st-chips" role="radiogroup">
            {(
              [
                ["monsoon", "Yes"],
                ["no-monsoon", "No"],
                ["unsure", "Not sure"],
              ] as const
            ).map(([value, text]) => (
              <button key={value} type="button" role="radio" aria-checked={rains === value} className="st-chip" onClick={() => setRains(value)}>
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function StartEditor({ initial, onSave, onCancel }: { initial: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  const problem = startDateProblem(v, new Date());
  return (
    <form className="st-form" onSubmit={(e) => (e.preventDefault(), !problem && onSave(v))}>
      <input className="st-field yo-date" type="date" value={v} onChange={(e) => setV(e.target.value)} aria-label={PROFILE.start} aria-describedby="yo-start-note" />
      <p id="yo-start-note" className="st-fine mt-0">
        {problem ?? PROFILE.startNote}
      </p>
      <EditorActions onCancel={onCancel} disabled={Boolean(problem)} />
    </form>
  );
}

/* ---------- routine ---------- */

function RoutineSection({ profile }: { profile: Profile }) {
  const routine = useApp((s) => s.data.routine);
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const { now } = useJourney();
  // Unsaved edits only; until there are some, the fields show the saved times.
  const [draft, setDraft] = useState<{ morning: string; evening: string } | null>(null);
  const morning = draft?.morning ?? routine.morning;
  const evening = draft?.evening ?? routine.evening;
  const setMorning = (v: string) => setDraft({ morning: v, evening });
  const setEvening = (v: string) => setDraft({ morning, evening: v });
  const [status, setStatus] = useState<string | null>(null);

  const rainsNow = monsoonMonths(profile.cityId, profile.seasonOverride).includes(now.getMonth() + 1) && (profile.cityId !== null || profile.seasonOverride === "monsoon");
  const advice = routineAdvice({ products: profile.products, ageBand: profile.ageBand, routine: { morning, evening }, rainsNow });
  const plan = weekPlan(profile.products, routine);
  const usesRoller = profile.products.includes("roller");
  const dirty = morning !== routine.morning || evening !== routine.evening;
  const valid = /^\d{2}:\d{2}$/.test(morning) && /^\d{2}:\d{2}$/.test(evening);

  return (
    <section id="routine" aria-labelledby="yo-routine">
      <h2 id="yo-routine" className="st-h">
        {PROFILE.routineTitle}
      </h2>
      <p className="st-body">{PROFILE.routineLead}</p>

      <form
        className="yo-times"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          update((s) => ({ ...s, routine: { ...s.routine, morning, evening } }));
          setDraft(null);
          setStatus(ROUTINE_COPY.saved);
        }}
      >
        <label className="st-label">
          {ROUTINE_COPY.morning}
          <input className="st-field" type="time" value={morning} onChange={(e) => (setMorning(e.target.value), setStatus(null))} required />
        </label>
        <label className="st-label">
          {ROUTINE_COPY.evening}
          <input className="st-field" type="time" value={evening} onChange={(e) => (setEvening(e.target.value), setStatus(null))} required />
        </label>
        <button type="submit" className="yo-save" disabled={!dirty || !valid}>
          {PROFILE.saveTimes}
        </button>
        <p className="yo-apart num">{valid ? ROUTINE_COPY.apart(hoursApart(morning, evening)) : ""}</p>
      </form>
      <p className="st-status" role="status">
        {status}
      </p>

      {/* The week: two slots a day, roller nights marked apart. */}
      <div className="yo-week" role="group" aria-label="Your week">
        {plan.map((d, i) => (
          <div key={d.weekday} className="yo-day" data-roller={d.roller || undefined}>
            <span className="yo-day-name" aria-hidden="true">
              {ROUTINE_COPY.days[i]}
            </span>
            <span className="yo-day-slots" aria-hidden="true">
              {d.slots.map((s) => (
                <i key={s.slot} data-slot={s.slot} />
              ))}
            </span>
            {usesRoller ? (
              <button
                type="button"
                className="yo-roller"
                aria-pressed={d.roller}
                aria-label={`${ROUTINE_COPY.roller}: ${ROUTINE_COPY.dayNames[i]}`}
                onClick={() => update((s) => ({ ...s, routine: { ...s.routine, rollerNights: toggleRollerNight(s.routine.rollerNights, MONDAY_FIRST[i]!) } }))}
              >
                R
              </button>
            ) : null}
            <span className="sr-only">
              {ROUTINE_COPY.dayNames[i]}: {d.slots.map((s) => `${s.slot === "am" ? "morning" : "evening"} at ${s.time}, ${s.items.map((x) => PRODUCT_WORDS[x]).join(" and ")}`).join("; ")}
              {d.roller ? `; ${ROUTINE_COPY.roller.toLowerCase()}` : ""}
            </span>
          </div>
        ))}
      </div>
      <p className="st-fine">
        <span className="yo-key" data-slot="am" aria-hidden="true" /> {ROUTINE_COPY.morning} {routine.morning}
        <span className="yo-key ml-4" data-slot="pm" aria-hidden="true" /> {ROUTINE_COPY.evening} {routine.evening}
        {usesRoller ? <span className="block mt-1">{ROUTINE_COPY.rollerHint}</span> : null}
      </p>

      <ul className="yo-advice">
        {advice.map((a) => (
          <li key={a.id}>
            <p className="yo-advice-title">{a.title}</p>
            <p className="st-body">{a.body}</p>
          </li>
        ))}
      </ul>
      <p className="st-fine">
        {ROUTINE_COPY.guidance}{" "}
        <Link href="/pause/?step=doctor" className="font-medium text-ink underline decoration-ink/25 underline-offset-4">
          {ROUTINE_COPY.doctor}
        </Link>
      </p>
      <button type="button" className="st-mini mt-5 yo-cal" onClick={() => downloadIcs("week-five-daily-times.ics", icsCalendar(dailyEvents(data, now)))}>
        <CalendarPlus size={18} aria-hidden="true" />
        {ROUTINE_COPY.calendarDaily}
      </button>
    </section>
  );
}

/* ---------- reminders ---------- */

function RemindersSection() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const { now } = useJourney();
  // The browser owns the permission; re-read it after asking.
  const [, reread] = useReducer((n: number) => n + 1, 0);
  const perm: NotifyState = useSyncExternalStore(noopSubscribe, notifyState, () => "default");
  const [status, setStatus] = useState<string | null>(null);
  const on = data.settings.notifications && perm !== "denied" && perm !== "unsupported";

  const toggle = async () => {
    if (on) {
      update((s) => ({ ...s, settings: { ...s.settings, notifications: false } }));
      return;
    }
    const next = await askToNotify();
    reread();
    if (next === "granted") update((s) => ({ ...s, settings: { ...s.settings, notifications: true } }));
  };

  const note = perm === "denied" ? PROFILE.notificationsDenied : perm === "unsupported" ? PROFILE.notificationsUnsupported : PROFILE.notificationsNote;

  return (
    <section id="reminders" aria-labelledby="yo-reminders">
      <h2 id="yo-reminders" className="st-h">
        {PROFILE.remindersTitle}
      </h2>
      <div className="st-rows mt-4">
        <div className="st-row">
          <span className="st-row-main">
            <span id="yo-notify" className="st-row-title">
              {PROFILE.notifications}
            </span>
            <span className="st-row-sub">{note}</span>
          </span>
          <button type="button" role="switch" aria-checked={on} aria-labelledby="yo-notify" className="st-switch mr-2" onClick={() => void toggle()} disabled={perm === "unsupported"} />
        </div>
        <div className="st-row">
          <span className="st-row-main">
            <span className="st-row-title">{PROFILE.calendar}</span>
            <span className="st-row-sub">{PROFILE.calendarNote}</span>
          </span>
          <button
            type="button"
            className="st-mini"
            onClick={() => {
              downloadIcs("week-five-reminders.ics", icsCalendar(calendarEvents(data, now)));
              setStatus(PROFILE.calendarDone);
            }}
            aria-label={PROFILE.calendar}
          >
            <CalendarPlus size={18} aria-hidden="true" />
            .ics
          </button>
        </div>
      </div>
      <p className="st-status" role="status">
        {status}
      </p>
    </section>
  );
}

/* ---------- look and sample data ---------- */

function Look() {
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  const lang = useApp((s) => s.data.settings.lang);
  const update = useApp((s) => s.update);
  return (
    <section aria-labelledby="yo-look">
      <h2 id="yo-look" className="st-h">
        {PROFILE.lookTitle}
      </h2>
      <div className="st-rows mt-4">
        <div className="st-row">
          <span id="yo-theme" className="st-row-title">
            {PROFILE.theme}
          </span>
          <div role="radiogroup" aria-labelledby="yo-theme" className="st-seg">
            {THEMES.map((t) => (
              <button key={t.value} type="button" role="radio" aria-checked={theme === t.value} onClick={() => setTheme(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="st-row yo-lang">
          <span className="st-row-main">
            <span id="yo-lang" className="st-row-title">
              {PROFILE.language}
            </span>
            <span className="st-row-sub">{PROFILE.languageNote}</span>
          </span>
          <div role="radiogroup" aria-labelledby="yo-lang" className="st-seg">
            {LANGS.map((l) => (
              <button
                key={l.value}
                type="button"
                role="radio"
                aria-checked={lang === l.value}
                onClick={() => update((s) => ({ ...s, settings: { ...s.settings, lang: l.value } }))}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Demo() {
  const mode = useApp((s) => s.mode);
  const enterDemo = useApp((s) => s.enterDemo);
  const leaveDemo = useApp((s) => s.leaveDemo);
  const router = useRouter();
  const on = mode === "demo";
  return (
    <section aria-labelledby="yo-demo">
      <h2 id="yo-demo" className="st-h">
        {PROFILE.demoTitle}
      </h2>
      <div className="st-rows mt-4">
        <div className="st-row">
          <span className="st-row-main">
            <span id="demo-label" className="st-row-title">
              {PROFILE.demoLabel}
            </span>
            <span className="st-row-sub">{PROFILE.demoNote}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="demo-label"
            className="st-switch mr-2"
            onClick={() => {
              if (on) {
                leaveDemo();
                router.push("/");
              } else {
                enterDemo("steady");
                router.push("/home");
              }
            }}
          />
        </div>
      </div>
    </section>
  );
}
