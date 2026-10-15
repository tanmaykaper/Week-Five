"use client";

import { Check, Intersect, Plus } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { onRing } from "@/components/pool/geometry";
import { fogFor, frame, LENS_RIM_WEEK, rimBelow, TODAY_FRAME } from "@/components/pool/poses";
import { useLensAnchor } from "@/components/pool/useLensAnchor";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, buttonClass, curl, Pair } from "@/components/ui/primitives";
import { VIEW_COPY, VIEWS } from "@/content/baseline";
import { MIRROR } from "@/content/mirror";
import { aboutHour, painterView } from "@/lib/baseline";
import { useJourney } from "@/lib/hooks/useJourney";
import { useLatestProjection, usePhotos } from "@/lib/hooks/usePhotos";
import { compareChoices, dayOneOf, lightDiffers, photoDays, weekToTake, type PhotoDay } from "@/lib/mirror";
import { seasonFor } from "@/lib/season";
import type { PhotoRecord, View } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { weekOf } from "@/lib/time/journey";
import { CompareLens, type Side } from "./CompareLens";
import "./mirror.css";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const takeHref = (week: number) => `/baseline/?week=${week}`;

/**
 * The mirror (BUILD_DOC F14). Day one sits at the centre of the rings, in a round lens,
 * with a later photo beside it behind a divider. Choosing a later week raises the camera so
 * the weeks in between pass under the lens and the chosen week's ring sits lit at its rim.
 * Below, on a sheet: every photo day, what's due, and the week-24 illustration.
 */
export function MirrorScreen() {
  return (
    <Gate>
      <Mirror />
    </Gate>
  );
}

function Mirror() {
  const mode = useApp((s) => s.mode);
  const profile = useApp((s) => s.data.profile)!;
  const persona = useApp((s) => s.data.demo?.persona ?? null);
  const photoHour = useApp((s) => s.data.settings.photoHour);
  const search = useSearchParams();
  const pool = usePool();
  const { now, day: rawDay } = useJourney();
  const day = rawDay ?? 1;
  const here = day >= 1 ? Math.min(24, weekOf(day)) : 0;
  const shots = usePhotos(mode, persona, profile.startDate);
  const loaded = shots !== null;
  const urlOf = useMemo(() => new Map((shots ?? []).map((s) => [s.rec.id, s.url])), [shots]);
  const photos = useMemo(() => (shots ?? []).map((s) => s.rec), [shots]);
  const demo = mode === "demo";

  // The view: the one they watch, unless it has no day-one photo yet.
  const [viewPick, setViewPick] = useState<View | null>(null);
  const withDayOne = VIEWS.filter((v) => dayOneOf(photos, v, now));
  const preferred = painterView(profile.worries);
  const view = viewPick && withDayOne.includes(viewPick) ? viewPick : withDayOne.includes(preferred) ? preferred : (withDayOne[0] ?? preferred);

  // Day one, and what to compare it with: the week asked for, else the latest.
  const before = dayOneOf(photos, view, now);
  const choices = compareChoices(photos, view, now);
  const [weekPick, setWeekPick] = useState<number | null>(null);
  const asked = Number(search.get("week"));
  const after = before ? (choices.find((p) => p.week === weekPick) ?? choices.find((p) => p.week === asked) ?? choices[choices.length - 1] ?? null) : null;
  const [split, setSplit] = useState(50);
  const [ghost, setGhost] = useState(false);

  const days = useMemo(() => photoDays(photos, profile.startDate, day, now), [photos, profile.startDate, day, now]);
  const toTake = weekToTake(days);
  const upcoming = days.find((d) => d.week > 0 && d.status === "upcoming") ?? null;
  const hour = photoHour === undefined ? null : aboutHour(photoHour);

  // The pool: the lens at the centre of the rings, the compared week's ring at its rim.
  const heroRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { ref: lensRef, rig: lensAt } = useLensAnchor(pool, loaded);
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);
  const ringWeek = after ? after.week : here;
  const rimWeek = after ? after.week : 0;
  const poseKey = loaded ? `mirror|${view}|${after?.week ?? 0}|${here}|${season.weeks?.join("-") ?? "dry"}` : "loading";
  const make = useCallback(
    (aspect: number): Pose => {
      const rig = lensAt(rimWeek ? (radius: number) => rimBelow(rimWeek, radius) : LENS_RIM_WEEK) ?? frame(TODAY_FRAME, aspect);
      return {
        ...rig,
        dY: 14,
        drop: 0,
        fall: 0,
        ripple: 0,
        map: 1,
        week: ringWeek,
        seasonFrom: season.weeks?.[0] ?? 0,
        seasonTo: season.weeks?.[1] ?? 0,
        shed: 0.5,
        dots: 1,
        cohort: 0,
        labels: 1,
        focus: 0,
        focusFrom: 0,
        focusTo: 0,
        idle: 0.6,
        fog: fogFor(rig),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poseKey],
  );
  usePoolPose(loaded ? make : null, poseKey, { enter: { map: 0, ripple: 0.4 }, ms: 1300 });

  // One label, on the ring at the lens's rim: to its right when there's room, else above it.
  // Phones have the captions under the lens instead.
  useEffect(() => {
    const el = labelRef.current;
    if (!pool || !el) return;
    const wide = window.innerWidth >= 700;
    const room = window.innerWidth - (lensRef.current?.getBoundingClientRect().right ?? 0);
    pool.setLabels([{ el, at: onRing(Math.max(1, ringWeek), room > 130 ? -0.45 : -1.3), weight: () => (wide && ringWeek > 0 ? 1 : 0) }]);
    return () => pool.setLabels([]);
  }, [pool, ringWeek, loaded, lensRef]);

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
  }, [pool]);

  const side = (p: PhotoRecord | null, when: string): Side | null => {
    if (!p) return null;
    const url = urlOf.get(p.id);
    if (!url) return null;
    const name = VIEW_COPY[view].name.toLowerCase();
    return { url, alt: demo ? `Sample drawing, ${name}, ${when}` : `Your ${name} photo, ${when}` };
  };
  const beforeSide = side(before, before ? `day one, ${fmt(new Date(before.takenAt))}` : "");
  const afterSide = side(after, after ? `week ${after.week}, ${fmt(new Date(after.takenAt))}` : "");
  const comparing = Boolean(beforeSide && afterSide);

  const compareWeek = (week: number) => {
    // Compare in a view that has a photo that week.
    const d = days.find((x) => x.week === week);
    if (d && !d.views[view]) {
      const v = VIEWS.find((x) => d.views[x] && dayOneOf(photos, x, now));
      if (v) setViewPick(v);
    }
    setWeekPick(week);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const turn = !loaded ? MIRROR.turnAlone : after ? (MIRROR.turn[after.week] ?? MIRROR.turnAlone) : before ? MIRROR.turnAlone : MIRROR.turnEmpty;

  return (
    <div className="mr">
      <div ref={labelRef} className="pool-label" data-tone="accent" aria-hidden="true">
        <span>{after ? MIRROR.week(after.week) : here > 0 ? `You are here, week ${here}` : ""}</span>
      </div>

      <section ref={heroRef} className="mr-hero" aria-labelledby="mr-title" aria-busy={!loaded || undefined}>
        <div className="mr-stage">
          <div className="mr-words">
            <Pair id="mr-title" title={MIRROR.title} turn={turn} className="mr-pair reveal" style={{ "--i": 0 } as React.CSSProperties} />
            {loaded && withDayOne.length === 0 ? (
              <>
                <p className="mr-lead reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {MIRROR.empty}
                </p>
                <div className="mr-actions reveal" style={{ "--i": 2 } as React.CSSProperties}>
                  <ButtonLink href="/baseline/">{MIRROR.takeDayOne}</ButtonLink>
                </div>
              </>
            ) : (
              <>
                <p className="mr-lead reveal" style={{ "--i": 1 } as React.CSSProperties}>
                  {curl(MIRROR.caveat)}
                </p>

                {withDayOne.length > 1 ? (
                  <div role="radiogroup" aria-label={MIRROR.views} className="mr-chips reveal" style={{ "--i": 2 } as React.CSSProperties}>
                    {withDayOne.map((v) => (
                      <button key={v} type="button" role="radio" aria-checked={view === v} className="mr-chip" onClick={() => setViewPick(v)}>
                        {view === v ? <Check size={15} weight="bold" aria-hidden="true" /> : null}
                        {VIEW_COPY[v].name}
                      </button>
                    ))}
                  </div>
                ) : null}

                {loaded ? <Strip days={days} view={view} selected={after?.week ?? null} urlOf={urlOf} onPick={setWeekPick} /> : <div className="mr-strip-skel" />}

                {comparing ? (
                  <button type="button" className="mr-toggle reveal" style={{ "--i": 4 } as React.CSSProperties} aria-pressed={ghost} onClick={() => setGhost((g) => !g)}>
                    <Intersect size={18} aria-hidden="true" />
                    {MIRROR.ghost}
                  </button>
                ) : null}

                {toTake ? (
                  <div className="mr-take reveal" style={{ "--i": 5 } as React.CSSProperties}>
                    <span className="mr-take-dot" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{MIRROR.takeTitle(toTake.week, toTake.status === "taken" ? "rest" : toTake.status === "late" ? "late" : "due")}</p>
                      <p className="mr-take-body">{MIRROR.takeBody(hour)}</p>
                    </div>
                  </div>
                ) : upcoming && loaded && before ? (
                  <p className="mr-next reveal" style={{ "--i": 5 } as React.CSSProperties}>
                    {(after ? MIRROR.next : MIRROR.firstNext)(upcoming.week, fmt(upcoming.date))}
                  </p>
                ) : null}

                <div className="mr-actions reveal" style={{ "--i": 6 } as React.CSSProperties}>
                  {toTake ? (
                    <ButtonLink href={takeHref(toTake.week)}>{toTake.status === "taken" ? MIRROR.takeRest : MIRROR.take(toTake.week)}</ButtonLink>
                  ) : null}
                  <ButtonLink variant="quiet" href="/mirror/projection/">
                    {MIRROR.projection}
                  </ButtonLink>
                </div>
              </>
            )}
          </div>

          <div className="mr-lens-col">
            <CompareLens
              ref={lensRef}
              view={view}
              before={beforeSide}
              after={afterSide}
              value={split}
              onChange={setSplit}
              label={after ? MIRROR.drag(after.week) : undefined}
              valueText={after ? `Day one on the left, week ${after.week} on the right, divider at ${split} percent` : undefined}
              ghost={ghost}
            />
            {before ? (
              <div className="mr-caps">
                <p>
                  <span className="font-medium">{MIRROR.dayOne}</span>
                  <span className="num">{fmt(new Date(before.takenAt))}</span>
                </p>
                {after ? (
                  <p className="text-right">
                    <span className="font-medium">{MIRROR.week(after.week)}</span>
                    <span className="num">{fmt(new Date(after.takenAt))}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {comparing && after && before && lightDiffers(before, after) ? (
              <p className="mr-light">
                <span className="mr-take-dot" aria-hidden="true" />
                {MIRROR.light}
              </p>
            ) : null}
            {demo && before ? <p className="mr-fine">{MIRROR.sample}</p> : null}
          </div>
        </div>
      </section>

      <div className="mr-sheet">
        <div className="wrap mr-grid">
          <section aria-labelledby="mr-days-title">
            <h2 id="mr-days-title" className="mr-h">
              {MIRROR.daysTitle}
            </h2>
            {loaded ? (
              <ol className="mr-days">
                {days.map((d) => (
                  <DayRow key={d.week} d={d} urlOf={urlOf} onCompare={compareWeek} canCompare={Boolean(before)} />
                ))}
              </ol>
            ) : (
              <div className="mr-days-skel" aria-hidden="true" />
            )}
          </section>
          <aside className="mr-side">
            <ProjectionCard mode={mode} />
            <section aria-labelledby="mr-tips">
              <h2 id="mr-tips" className="mr-h">
                {MIRROR.tipsTitle}
              </h2>
              <ul className="mr-tips">
                {MIRROR.tips(hour).map((t) => (
                  <li key={t}>{curl(t)}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** The six photo weeks as a row of small round photos: the flat twin of the amber dots on the rings. */
function Strip({ days, view, selected, urlOf, onPick }: { days: PhotoDay[]; view: View; selected: number | null; urlOf: Map<string, string>; onPick: (week: number) => void }) {
  return (
    <ul className="mr-strip reveal" style={{ "--i": 3 } as React.CSSProperties} aria-label={MIRROR.strip}>
      {days
        .filter((d) => d.week > 0)
        .map((d) => {
          const photo = d.views[view];
          const url = photo ? urlOf.get(photo.id) : undefined;
          const name = <span className="mr-pick-name num">{MIRROR.week(d.week)}</span>;
          if (photo && url) {
            return (
              <li key={d.week}>
                <button
                  type="button"
                  className="mr-pick"
                  aria-pressed={selected === d.week}
                  aria-label={MIRROR.stripCompare(d.week, fmt(new Date(photo.takenAt)))}
                  onClick={() => onPick(d.week)}
                >
                  <span className="mr-pick-disc">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" width={120} height={120} />
                  </span>
                  {name}
                  <span className="mr-pick-sub num">{fmtShort(new Date(photo.takenAt))}</span>
                </button>
              </li>
            );
          }
          if (d.open && (d.status === "due" || d.status === "late" || d.status === "taken")) {
            return (
              <li key={d.week}>
                <Link href={takeHref(d.week)} className="mr-pick" data-state="due" aria-label={MIRROR.stripTake(d.week)}>
                  <span className="mr-pick-disc">
                    <Plus size={18} weight="bold" aria-hidden="true" />
                  </span>
                  {name}
                  <span className="mr-pick-sub">{d.status === "late" ? MIRROR.late : MIRROR.due}</span>
                </Link>
              </li>
            );
          }
          const sub = d.status === "missed" ? MIRROR.missed : d.status === "early" ? MIRROR.notNeeded : fmtShort(d.date);
          const label =
            d.status === "missed" ? MIRROR.stripMissed(d.week) : d.status === "early" ? MIRROR.stripEarly(d.week) : MIRROR.stripLater(d.week, fmt(d.date));
          return (
            <li key={d.week}>
              <span className="mr-pick" data-state={d.status} role="img" aria-label={label}>
                <span className="mr-pick-disc" />
                {name}
                <span className="mr-pick-sub num">{sub}</span>
              </span>
            </li>
          );
        })}
    </ul>
  );
}

function DayRow({ d, urlOf, onCompare, canCompare }: { d: PhotoDay; urlOf: Map<string, string>; onCompare: (week: number) => void; canCompare: boolean }) {
  const kept = VIEWS.filter((v) => d.views[v]).length;
  const tag =
    d.status === "taken"
      ? kept === 3
        ? { text: MIRROR.saved, tone: "ok" }
        : { text: MIRROR.savedSome(kept), tone: "neutral" }
      : d.status === "due"
        ? { text: MIRROR.dueNow, tone: "amber" }
        : d.status === "late"
          ? { text: MIRROR.aFewDaysLate, tone: "amber" }
          : d.status === "missed"
            ? { text: MIRROR.missedNoHarm, tone: "neutral" }
            : d.status === "early"
              ? { text: MIRROR.tooSoon, tone: "neutral" }
              : null;
  const name = d.week === 0 ? MIRROR.dayOne : MIRROR.week(d.week);
  return (
    <li className="mr-day" data-status={d.status}>
      <div className="mr-day-name">
        <span className="font-medium">{name}</span>
        <span className="mr-day-date num">{d.status === "taken" ? fmt(d.date) : MIRROR.around(fmt(d.date))}</span>
        {tag ? (
          <span className="mr-tag mr-day-tag" data-tone={tag.tone}>
            {tag.text}
          </span>
        ) : null}
      </div>
      <div className="mr-day-discs" aria-hidden="true">
        {VIEWS.map((v) => {
          const p = d.views[v];
          const url = p ? urlOf.get(p.id) : undefined;
          return (
            <span key={v} className="mr-day-disc" data-empty={!url || undefined}>
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" width={96} height={96} />
              ) : (
                <HeadGhost view={v} />
              )}
            </span>
          );
        })}
      </div>
      <div className="mr-day-end">
        {d.week > 0 && d.open && (d.status === "due" || d.status === "late") ? (
          <Link href={takeHref(d.week)} className={buttonClass("primary", "h-9 px-3.5 text-sm")} aria-label={MIRROR.take(d.week)}>
            {MIRROR.takePhotos}
          </Link>
        ) : null}
        {d.week > 0 && d.open && d.status === "taken" ? (
          <Link href={takeHref(d.week)} className={buttonClass("quiet", "h-9 px-3.5 text-sm")} aria-label={kept < 3 ? `${MIRROR.takeRest}, week ${d.week}` : `${MIRROR.retake} week ${d.week} photos`}>
            {kept < 3 ? MIRROR.takeRest : MIRROR.retake}
          </Link>
        ) : null}
        {d.week > 0 && d.status === "taken" && canCompare ? (
          <Button variant="quiet" className="h-9 px-3.5 text-sm" onClick={() => onCompare(d.week)} aria-label={`${MIRROR.compare} day one with week ${d.week}`}>
            {MIRROR.compare}
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function ProjectionCard({ mode }: { mode: Parameters<typeof useLatestProjection>[0] }) {
  const url = useLatestProjection(mode);
  return (
    <section className="mr-proj" aria-labelledby="mr-proj">
      <span className="mr-proj-disc" aria-hidden="true">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" width={160} height={160} />
        ) : (
          <HeadGhost view="crown" />
        )}
      </span>
      <div>
        <h2 id="mr-proj" className="mr-h">
          {MIRROR.projectionTitle}
        </h2>
        <p className="mr-body">{MIRROR.projectionNote}</p>
        <ButtonLink variant="quiet" href="/mirror/projection/" className="mt-4 h-11 px-5">
          {MIRROR.seeProjection}
        </ButtonLink>
      </div>
    </section>
  );
}
