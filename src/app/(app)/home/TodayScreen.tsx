"use client";

import { ArrowSquareOut, Check, Drop } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { checkinSheet } from "@/components/checkin/sheet";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { DOT_ANGLE, onRing } from "@/components/pool/geometry";
import { frame, landscapeness, TODAY_FRAME } from "@/components/pool/poses";
import { PoolStage } from "@/components/pool/PoolStage";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, Pair, Tag } from "@/components/ui/primitives";
import { WeekTicks } from "@/components/ui/WeekTicks";
import { VIEW_COPY } from "@/content/baseline";
import { PRODUCT_WORDS, TODAY } from "@/content/today";
import { painterView } from "@/lib/baseline";
import { cohortGlance } from "@/lib/cohort";
import { activeSlots, isDone, setDose, slotItems, streak, type Slot } from "@/lib/doses";
import { useJourney } from "@/lib/hooks/useJourney";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { REORDER_PROMPT_DAYS, reorderAllowed, runway } from "@/lib/runway";
import { seasonFor } from "@/lib/season";
import { useLatestProjection, usePhotos, type Shot } from "@/lib/hooks/usePhotos";
import { baselineDay, firstPhotoWeek } from "@/lib/mirror";
import type { View } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { Breathe, WhyLink } from "@/components/insight/WhyAndBreathe";
import { LetterReadButton } from "@/components/letter/Letter";
import { cityById } from "@/content/cities";
import { logInsight, pickInsight, type Insight } from "@/lib/insights";
import { letterStatus } from "@/lib/letter";
import { addDays, dateOfDay, greetingWord, nextPhotoWeek, phasePhrase, progress, timeOfDay, toISODate, TOTAL_DAYS, weekOf } from "@/lib/time/journey";
import "./today.css";

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

/**
 * Today (Phase 5): the plan seen from above on the pool, the greeting in two voices, the
 * day's one sentence, and a sheet that rises over the water with the routine, day one and
 * now, supply, the people who started with you, and the way out if it gets hard.
 */
export function TodayScreen() {
  return (
    <Gate>
      <Today />
    </Gate>
  );
}

function Today() {
  const mode = useApp((s) => s.mode);
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const profile = data.profile!;
  const { now, day: rawDay } = useJourney();
  const day = rawDay ?? 1;
  const week = day >= 1 ? Math.min(24, weekOf(day)) : 0;
  const shots = usePhotos(mode, data.demo?.persona ?? null, profile.startDate);
  const projection = useLatestProjection(mode);

  // Only what has happened by now (demo mode carries the whole plan).
  const seen = useMemo(() => (shots ?? []).filter((s) => Date.parse(s.rec.takenAt) <= now.getTime()), [shots, now]);
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);
  const hasBaseline = seen.some((s) => s.rec.week === 0);
  const note = useMemo(
    () =>
      pickInsight({
        day,
        now,
        startDate: profile.startDate,
        channel: profile.channel,
        products: profile.products,
        cityName: cityById(profile.cityId)?.name ?? null,
        season,
        checkins: data.checkins,
        // Until the photos have loaded, assume they exist rather than nag for them.
        hasBaseline: shots === null ? true : hasBaseline,
        photoWeeks: [...new Set(seen.map((s) => s.rec.week))],
        firstPhotoWeek: firstPhotoWeek(baselineDay(seen.map((s) => s.rec), profile.startDate) ?? 1),
        letter: data.letter,
        intercepts: data.intercepts,
        insightLog: data.insightLog,
        rollerNights: data.routine.rollerNights,
      }),
    [day, now, profile, season, data.checkins, data.letter, data.intercepts, data.insightLog, data.routine.rollerNights, hasBaseline, seen, shots],
  );

  // Remember what was shown today, so ambient notes rest for a week (once the photos are known).
  const today = toISODate(now);
  const logged = data.insightLog.some((l) => l.id === note.id && l.on === today);
  useEffect(() => {
    if (shots === null || logged) return;
    update((s) => ({ ...s, insightLog: logInsight(s.insightLog, note.id, new Date(now)) }));
  }, [shots, logged, note.id, now, update]);

  // The mirror shows the area they worry about: day one next to the latest photo of it.
  const view: View = painterView(profile.worries);
  const pick = (v: View) => seen.filter((s) => s.rec.view === v).sort((a, b) => a.rec.week - b.rec.week || a.rec.takenAt.localeCompare(b.rec.takenAt));
  const ofView = pick(view).length ? pick(view) : pick("crown").length ? pick("crown") : pick("hairline").length ? pick("hairline") : pick("parting");
  const first = ofView.find((s) => s.rec.week === 0) ?? null;
  const last = ofView.length > 1 ? ofView[ofView.length - 1]! : null;

  const heroRef = useRef<HTMLElement>(null);

  return (
    <div className="td">
      <PoolStage />
      <TodayPool day={day} week={week} seasonWeeks={season.weeks} heroRef={heroRef} />

      <section ref={heroRef} className="td-hero" aria-labelledby="td-greeting">
        <div className="td-hero-words">
          <p className="td-date reveal" style={{ "--i": 0 } as React.CSSProperties}>
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <Pair
            id="td-greeting"
            title={`${greetingWord(now)}, ${profile.nickname.trim() || "you"}${timeOfDay(now) === "night" ? "?" : "."}`}
            turn={turnLine(day, week)}
            className="td-pair reveal"
            style={{ "--i": 1 } as React.CSSProperties}
          />
          {/* The night card for a worried mind carries no numbers. */}
          {note.noNumbers ? null : <Progress day={day} />}
          <NoteBlock note={note} first={first} hasBaseline={shots === null || hasBaseline} letterReady={letterStatus(data.letter, day) === "ready"} />
        </div>
      </section>

      <div className="td-sheet">
        <div className="wrap td-grid">
          <Routine
            products={profile.products}
            routine={data.routine}
            doses={data.doses}
            now={now}
            startDate={profile.startDate}
            onToggle={(slot, done) => update((s) => ({ ...s, doses: setDose(s.doses, toISODate(now), slot, done, now) }))}
          />
          <Mirror loading={shots === null} first={first} last={last} day={day} startDate={profile.startDate} demo={mode === "demo"} />
          <Supply
            packs={profile.packs}
            checkins={data.checkins}
            now={now}
            snoozedUntil={data.settings.reorder.snoozedUntil}
            onSnooze={() =>
              update((s) => ({ ...s, settings: { ...s.settings, reorder: { ...s.settings.reorder, snoozedUntil: toISODate(addDays(now, 3)) } } }))
            }
          />
          <Mates startDate={profile.startDate} day={day} />
          <Projection url={projection} />
          <section className="td-stop" aria-labelledby="td-stop">
            <div>
              <h2 id="td-stop" className="td-h">
                {TODAY.stopTitle}
              </h2>
              <p className="td-body">{TODAY.stopBody}</p>
            </div>
            <ButtonLink variant="quiet" href="/pause">
              {TODAY.stopAction}
            </ButtonLink>
          </section>
        </div>
      </div>
    </div>
  );
}

function turnLine(day: number, week: number): string {
  if (day <= 0) return TODAY.notStarted(1 - day);
  if (day > TOTAL_DAYS) return "Past six months.";
  return `Week ${week}, ${phasePhrase(day)}.`;
}

function Progress({ day }: { day: number }) {
  const pct = Math.round(progress(day) * 100);
  return (
    <div className="td-progress reveal" style={{ "--i": 2 } as React.CSSProperties}>
      <p className="num">
        {day >= 1 ? (
          <>
            <span className="text-ink">Day {Math.min(day, 999)}</span> of 168
          </>
        ) : (
          "Day one is coming"
        )}
      </p>
      <WeekTicks day={day} className="td-ticks" label={TODAY.progressSr(Math.max(0, day), pct)} />
      <p className="num">{TODAY.progress(pct)}</p>
    </div>
  );
}

function NoteBlock({ note, first, hasBaseline, letterReady }: { note: Insight; first: Shot | null; hasBaseline: boolean; letterReady: boolean }) {
  const action = (() => {
    switch (note.attach) {
      case "baseline":
        return first ? (
          <ButtonLink variant="quiet" href="#td-mirror" className="h-11 px-5">
            {TODAY.compare}
          </ButtonLink>
        ) : null;
      case "photos":
        return hasBaseline ? (
          <ButtonLink variant="quiet" href={note.photoWeek ? `/baseline/?week=${note.photoWeek}` : "/mirror/"} className="h-11 px-5">
            {note.photoWeek ? TODAY.takeWeek(note.photoWeek) : TODAY.openMirror}
          </ButtonLink>
        ) : (
          <ButtonLink href="/baseline" className="h-11 px-5">
            {TODAY.takeDayOne}
          </ButtonLink>
        );
      case "letter":
        // Week five's moment: the note, with day one beside it to compare against.
        return letterReady ? (
          <>
            <LetterReadButton variant="primary" className="h-11 px-5" />
            {first ? (
              <ButtonLink variant="quiet" href="#td-mirror" className="h-11 px-5">
                {TODAY.compare}
              </ButtonLink>
            ) : null}
          </>
        ) : (
          <ButtonLink variant="quiet" href="/map#letter" className="h-11 px-5">
            {TODAY.writeNote}
          </ButtonLink>
        );
      case "checkin":
        return (
          <Button variant="quiet" className="h-11 px-5" onClick={() => checkinSheet.open()}>
            {TODAY.checkIn}
          </Button>
        );
      case "doctor":
        return (
          <ButtonLink variant="danger-quiet" href="/pause/?step=doctor" className="h-11 px-5">
            {TODAY.talkToDoctor}
          </ButtonLink>
        );
      case "map":
        return (
          <ButtonLink variant="quiet" href="/map" className="h-11 px-5">
            {TODAY.seeMap}
          </ButtonLink>
        );
      default:
        return null;
    }
  })();
  return (
    <div className="td-note reveal" data-tone={note.tone} data-id={note.id} style={{ "--i": 3 } as React.CSSProperties} aria-live="polite">
      {(note.attach === "baseline" || (note.attach === "letter" && letterReady)) && first ? (
        <a href="#td-mirror" className="td-note-disc" aria-label={TODAY.compare}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first.url} alt="" width={160} height={160} />
          <span>{TODAY.dayOne}</span>
        </a>
      ) : note.attach === "breathe" ? (
        <Breathe />
      ) : null}
      <div className="td-note-body">
        <p className="td-note-text">{curl(note.text)}</p>
        <div className="td-note-actions">
          {action}
          <WhyLink insight={note} />
        </div>
      </div>
    </div>
  );
}

function Routine({
  products,
  routine,
  doses,
  now,
  startDate,
  onToggle,
}: {
  products: Parameters<typeof slotItems>[0];
  routine: { morning: string; evening: string };
  doses: Parameters<typeof setDose>[0];
  now: Date;
  startDate: string;
  onToggle: (slot: Slot, done: boolean) => void;
}) {
  const items = slotItems(products);
  const slots = activeSlots(products);
  const today = toISODate(now);
  const run = streak(doses, slots, today, now, startDate);
  return (
    <section className="td-routine" aria-labelledby="td-routine">
      <div className="td-head">
        <h2 id="td-routine" className="td-h">
          {TODAY.routine}
        </h2>
        {run > 0 ? (
          <p className="td-meta num">
            <Drop size={14} weight="fill" className="text-today-dot" aria-hidden="true" />
            {TODAY.streak(run)}
          </p>
        ) : null}
      </div>
      {slots.length === 0 ? (
        <p className="td-body">{TODAY.nothingToday}</p>
      ) : (
        <ul className="td-slots">
          {slots.map((slot) => {
            const done = isDone(doses, today, slot, now);
            const label = slot === "am" ? TODAY.morning : TODAY.evening;
            const time = slot === "am" ? routine.morning : routine.evening;
            return (
              <li key={slot} className="td-slot" data-done={done || undefined}>
                <span className="td-slot-when">
                  <span className="font-medium">{label}</span>
                  <span className="num text-text-2">{time}</span>
                </span>
                <span className="td-slot-what">{items[slot].map((p) => PRODUCT_WORDS[p]).join(", ")}</span>
                <button
                  type="button"
                  className="td-done"
                  aria-pressed={done}
                  aria-label={`${label}, ${time}: ${done ? TODAY.done : TODAY.markDone}`}
                  onClick={() => onToggle(slot, !done)}
                >
                  {done ? <Check size={16} weight="bold" aria-hidden="true" /> : null}
                  {done ? TODAY.done : TODAY.markDone}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="td-fine">{TODAY.guidance}</p>
    </section>
  );
}

function Disc({ shot, view, caption, sub, empty }: { shot: Shot | null; view: View; caption: string; sub?: string; empty?: boolean }) {
  return (
    <figure className="td-disc-fig" data-empty={empty || undefined}>
      <span className="td-disc">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.url} alt={`${caption}, ${VIEW_COPY[view].name.toLowerCase()}`} width={300} height={300} loading="lazy" />
        ) : (
          <HeadGhost view={view} />
        )}
      </span>
      <figcaption>
        <span className="font-medium">{caption}</span>
        {sub ? <span className="text-text-2">{sub}</span> : null}
      </figcaption>
    </figure>
  );
}

function Mirror({ loading, first, last, day, startDate, demo }: { loading: boolean; first: Shot | null; last: Shot | null; day: number; startDate: string; demo: boolean }) {
  const next = nextPhotoWeek(Math.max(1, day));
  const nextDate = next ? fmtDay(dateOfDay(startDate, next * 7)) : null;
  const view = first?.rec.view ?? "crown";
  return (
    <section id="td-mirror" className="td-mirror" aria-labelledby="td-mirror-h" aria-busy={loading || undefined}>
      <div className="td-head">
        <h2 id="td-mirror-h" className="td-h">
          {TODAY.mirror}
        </h2>
        {first ? (
          <Link href="/mirror" className="td-link">
            {TODAY.openMirror}
          </Link>
        ) : null}
      </div>
      {loading ? (
        <div className="td-pairs">
          <span className="td-disc td-skel" />
          <span className="td-disc td-skel" />
        </div>
      ) : first ? (
        <>
          <div className="td-pairs">
            <Disc shot={first} view={view} caption={TODAY.dayOne} sub={fmtDay(new Date(first.rec.takenAt))} />
            {last ? (
              <Disc shot={last} view={view} caption={`Week ${last.rec.week}`} sub={fmtDay(new Date(last.rec.takenAt))} />
            ) : (
              <Disc shot={null} view={view} caption={next ? `Week ${next}` : "Next"} sub={nextDate ?? undefined} empty />
            )}
          </div>
          {demo ? <p className="td-fine">{TODAY.sample}</p> : !last && next && nextDate ? <p className="td-fine">{TODAY.nextPhotos(next, nextDate)}</p> : null}
        </>
      ) : (
        <div className="td-mirror-empty">
          <Disc shot={null} view="crown" caption={TODAY.dayOne} empty />
          <div>
            <p className="td-body">{TODAY.mirrorEmpty}</p>
            <ButtonLink href="/baseline" className="mt-4">
              {TODAY.takePhotos}
            </ButtonLink>
          </div>
        </div>
      )}
    </section>
  );
}

function Supply({
  packs,
  checkins,
  now,
  snoozedUntil,
  onSnooze,
}: {
  packs: Parameters<typeof runway>[0];
  checkins: Parameters<typeof reorderAllowed>[0];
  now: Date;
  snoozedUntil?: string;
  onSnooze: () => void;
}) {
  const r = runway(packs, now);
  const allowed = reorderAllowed(checkins, now, snoozedUntil);
  const product = r ? (r.sku.products.length > 1 ? "kit" : PRODUCT_WORDS[r.sku.products[0]!].toLowerCase()) : "";
  return (
    <section className="td-supply" aria-labelledby="td-supply">
      <h2 id="td-supply" className="td-h">
        {TODAY.supply}
      </h2>
      {r ? (
        <>
          <p className="td-big num">{TODAY.daysLeft(r.daysLeft)}</p>
          <div className="td-bar" data-low={r.daysLeft <= REORDER_PROMPT_DAYS || undefined} role="img" aria-label={`${Math.round((1 - r.used) * 100)} percent of the pack left`}>
            <i style={{ width: `${Math.max(2, (1 - r.used) * 100)}%` }} />
          </div>
          <p className="td-body">{r.daysLeft > 0 ? TODAY.runsOut(product, fmtDay(r.runsOut)) : TODAY.ranOut(product)}</p>
          {r.daysLeft <= REORDER_PROMPT_DAYS && allowed ? (
            <div className="td-actions">
              <a className="td-reorder" href="https://manmatters.com" target="_blank" rel="noopener noreferrer">
                {TODAY.reorder}
                <ArrowSquareOut size={16} aria-hidden="true" />
              </a>
              <Button variant="quiet" className="h-11 px-4" onClick={onSnooze}>
                {TODAY.snooze}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="td-body">{TODAY.noPack}</p>
          <ButtonLink variant="quiet" href="/reorder" className="mt-4 h-11 px-5">
            {TODAY.addPack}
          </ButtonLink>
        </>
      )}
    </section>
  );
}

function Mates({ startDate, day }: { startDate: string; day: number }) {
  const g = useMemo(() => cohortGlance(startDate, Math.max(1, day)), [startDate, day]);
  const faces = g.startWeek.slice(0, 4);
  return (
    <section className="td-mates" aria-labelledby="td-mates">
      <div className="td-head">
        <h2 id="td-mates" className="td-h">
          {TODAY.mates}
        </h2>
      </div>
      <Tag tone="info">{TODAY.demoCommunity}</Tag>
      <div className="td-faces" aria-hidden="true">
        {faces.map((m) => (
          <span key={m.id}>{m.firstName[0]}</span>
        ))}
        {g.startWeek.length > faces.length ? <span className="num">+{g.startWeek.length - faces.length}</span> : null}
      </div>
      <p className="td-body">{TODAY.matesLine(g.startWeek.length, g.week)}</p>
      <p className="td-fine">{g.event}</p>
      <Link href="/mates" className="td-link mt-3 inline-flex">
        {TODAY.seeMates}
      </Link>
    </section>
  );
}

function Projection({ url }: { url: string | null }) {
  return (
    <section className="td-projection" aria-labelledby="td-projection">
      <span className="td-proj-disc" data-photo={url ? true : undefined} aria-hidden="true">
        {url ? (
          // The illustration drawn on this device; the line under the title says what it is.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" width={160} height={160} />
        ) : (
          <HeadGhost view="crown" />
        )}
      </span>
      <h2 id="td-projection" className="td-h">
        {TODAY.projection}
      </h2>
      <p className="td-body">{TODAY.projectionNote}</p>
      <ButtonLink variant="quiet" href="/mirror/projection" className="mt-4 h-11 px-5">
        {TODAY.seeProjection}
      </ButtonLink>
    </section>
  );
}

/** Today's camera on the pool: the plan from above, your week lit, labels on the rings. */
function TodayPool({ day, week, seasonWeeks, heroRef }: { day: number; week: number; seasonWeeks: [number, number] | null; heroRef: React.RefObject<HTMLElement | null> }) {
  const pool = usePool();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const next = nextPhotoWeek(Math.max(1, day)) ?? 24;
  const key = `today|${week}|${seasonWeeks?.join("-") ?? "dry"}|${next}`;
  const make = useCallback(
    (aspect: number): Pose => ({
      ...frame(TODAY_FRAME, aspect),
      dY: 14,
      drop: 0,
      fall: 0,
      ripple: 0,
      map: 1,
      week,
      seasonFrom: seasonWeeks?.[0] ?? 0,
      seasonTo: seasonWeeks?.[1] ?? 0,
      shed: 0.8,
      dots: 1,
      cohort: 0,
      labels: 1,
      focus: 0,
      focusFrom: 0,
      focusTo: 0,
      idle: 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  usePoolPose(make, key, { enter: { map: 0, ripple: 0.4 }, ms: 1900 });

  // Other people's drops land once, after the rings have spread: the cohort, on the water.
  useEffect(() => {
    if (!pool || reduced) return;
    const id = window.setTimeout(() => pool.landCohort(9000), 2200);
    return () => window.clearTimeout(id);
  }, [pool, reduced]);

  // Nothing to draw once the sheet covers the water.
  useEffect(() => {
    const hero = heroRef.current;
    if (!pool || !hero) return;
    const io = new IntersectionObserver(([e]) => pool.setPaused(!e!.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => {
      io.disconnect();
      pool.setPaused(false);
    };
  }, [pool, heroRef]);

  useEffect(() => {
    if (!pool || !ref.current) return;
    const wide = landscapeness(pool.aspect) > 0.5;
    const el = (n: string) => ref.current!.querySelector<HTMLElement>(`[data-label="${n}"]`)!;
    pool.setLabels([
      // On phones the label sits to the right of the ring, above the words.
      { el: el("now"), at: onRing(Math.max(1, week), wide ? 0.55 : -1.25), weight: () => (week > 0 ? 1 : 0) },
      { el: el("next"), at: onRing(next, DOT_ANGLE), weight: () => (wide && next !== week ? 1 : 0) },
      { el: el("rain"), at: onRing(seasonWeeks ? seasonWeeks[1] : 1, -0.55), weight: () => (wide && seasonWeeks ? 1 : 0) },
      { el: el("shed"), at: onRing(8, -1.75), weight: () => (wide ? 1 : 0) },
    ]);
    return () => pool.setLabels([]);
  }, [pool, week, next, seasonWeeks]);

  return (
    <div ref={ref} aria-hidden="true">
      <div className="pool-label" data-label="now" data-tone="accent">
        <span>{week > 0 ? `You are here, week ${week}` : ""}</span>
      </div>
      <div className="pool-label" data-label="next" data-tone="amber">
        <span>Week {next}, next photos</span>
      </div>
      <div className="pool-label" data-label="rain" data-tone="rain">
        <span>{seasonWeeks ? `Rains, ${seasonWeeks[0] === seasonWeeks[1] ? `week ${seasonWeeks[0]}` : `weeks ${seasonWeeks[0]} to ${seasonWeeks[1]}`}` : ""}</span>
      </div>
      <div className="pool-label" data-label="shed">
        <span>Shed window</span>
      </div>
    </div>
  );
}
