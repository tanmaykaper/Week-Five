"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LetterSection } from "@/components/letter/Letter";
import { Gate } from "@/components/shell/Gate";
import { ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { MAP, PAUSE } from "@/content/journey";
import { TODAY } from "@/content/today";
import { weekText, WEEK_GROUPS } from "@/content/weeks";
import { useJourney } from "@/lib/hooks/useJourney";
import { seasonFor } from "@/lib/season";
import { useApp } from "@/lib/storage/store";
import { PHOTO_WEEKS, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";
import { MapPool } from "./MapPool";
import "./map.css";

const isPhotoWeek = (w: number) => (PHOTO_WEEKS as readonly number[]).includes(w);
const inShed = (w: number) => w >= 3 && w <= 8;

/**
 * The map (BUILD_DOC F7): the 24 rings from above, a week picker that moves the camera
 * ring by ring, the season in words, and the whole plan as a list on a sheet below, with
 * the note to week five and the way out if it gets hard.
 */
export function MapScreen() {
  return (
    <Gate>
      <MapView />
    </Gate>
  );
}

function MapView() {
  const profile = useApp((s) => s.data.profile)!;
  const { day } = useJourney();
  const here = day !== null && day >= 1 ? Math.min(TOTAL_WEEKS, weekOf(day)) : 0;
  const [selected, setSelected] = useState(Math.max(1, here));
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);
  const rains = season.weeks;
  const heroRef = useRef<HTMLElement>(null);
  const text = weekText(selected);
  const step = (d: number) => setSelected((w) => Math.min(TOTAL_WEEKS, Math.max(1, w + d)));
  const inRains = (w: number) => Boolean(rains && w >= rains[0] && w <= rains[1]);

  return (
    <div className="mp">
      <MapPool selected={selected} here={here} season={rains} heroRef={heroRef} />

      <section ref={heroRef} className="mp-hero" aria-labelledby="mp-title">
        <div className="mp-words">
          <Pair id="mp-title" title={MAP.title} turn={MAP.turn} className="mp-pair reveal" style={{ "--i": 0 } as React.CSSProperties} />
          <p className="mp-lead reveal" style={{ "--i": 1 } as React.CSSProperties}>
            {curl(MAP.lead)}
          </p>

          <div
            className="mp-picker reveal"
            style={{ "--i": 2 } as React.CSSProperties}
            role="group"
            aria-label="Choose a week"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
          >
            <button type="button" className="mp-step" onClick={() => step(-1)} disabled={selected === 1} aria-label={MAP.prev}>
              <CaretLeft size={18} weight="bold" aria-hidden="true" />
            </button>
            <div className="mp-week" aria-live="polite">
              <p className="mp-week-title">
                <span className="num">Week {selected}</span>
                {selected === here ? <span className="mp-tag" data-tone="accent">{MAP.here}</span> : null}
                {isPhotoWeek(selected) ? <span className="mp-tag" data-tone="amber">{MAP.photos}</span> : null}
                {inRains(selected) ? <span className="mp-tag" data-tone="rain">{MAP.rains}</span> : null}
              </p>
              <p className="mp-week-turn">{curl(text.turn)}</p>
              <p className="mp-week-line">{curl(text.line)}</p>
            </div>
            <button type="button" className="mp-step" onClick={() => step(1)} disabled={selected === TOTAL_WEEKS} aria-label={MAP.next}>
              <CaretRight size={18} weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div className="mp-dots reveal" style={{ "--i": 3 } as React.CSSProperties} aria-hidden="true">
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
              const w = i + 1;
              return (
                <button
                  key={w}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setSelected(w)}
                  data-on={w === selected || undefined}
                  data-here={w === here || undefined}
                  data-done={w < here || undefined}
                  data-shed={inShed(w) || undefined}
                />
              );
            })}
          </div>
          <div className="mp-actions reveal" style={{ "--i": 4 } as React.CSSProperties}>
            <ButtonLink href={`/map/week/${selected}`} className="h-11 px-5">
              {MAP.read(selected)}
            </ButtonLink>
          </div>
          <p className="mp-season reveal" style={{ "--i": 5 } as React.CSSProperties}>
            <span className="mp-key" data-tone="rain" aria-hidden="true" />
            {rains ? (season.overlapsShed ? MAP.rainsOverlap(rains[0], rains[1]) : MAP.rainsClear(rains[0], rains[1])) : MAP.rainsNone}
          </p>
          <ul className="mp-legend reveal" style={{ "--i": 6 } as React.CSSProperties} aria-label="What the rings show">
            <li>
              <span className="mp-key" data-tone="shed" aria-hidden="true" />
              {MAP.legendShed}
            </li>
            <li>
              <span className="mp-key" data-tone="amber" aria-hidden="true" />
              {MAP.legendPhotos}
            </li>
            {rains ? (
              <li>
                <span className="mp-key" data-tone="rain" aria-hidden="true" />
                {MAP.legendRains}
              </li>
            ) : null}
            <li>
              <span className="mp-key" data-tone="accent" aria-hidden="true" />
              {MAP.legendHere}
            </li>
          </ul>
        </div>
      </section>

      <div className="mp-sheet">
        <div className="wrap mp-grid">
          <section className="mp-list" aria-labelledby="mp-list-title">
            <h2 id="mp-list-title" className="mp-h">
              {MAP.listTitle}
            </h2>
            {WEEK_GROUPS.map((g) => (
              <div key={g.label} className="mp-group" data-shed={g.from === 3 || undefined}>
                <h3 className="mp-group-title">
                  {g.label}
                  <span className="num">{g.from === g.to ? `Week ${g.from}` : `Weeks ${g.from} to ${g.to}`}</span>
                </h3>
                <ol className="mp-rows">
                  {Array.from({ length: g.to - g.from + 1 }, (_, i) => g.from + i).map((w) => (
                    <li key={w}>
                      <Link href={`/map/week/${w}`} className="mp-row" data-here={w === here || undefined} data-done={w < here || undefined}>
                        <span className="mp-row-n num">{w}</span>
                        <span className="mp-row-line">{curl(weekText(w).line)}</span>
                        <span className="mp-row-tags">
                          {w === here ? <span className="mp-tag" data-tone="accent">{MAP.here}</span> : null}
                          {isPhotoWeek(w) ? <span className="mp-tag" data-tone="amber">{MAP.photos}</span> : null}
                          {inRains(w) ? <span className="mp-tag" data-tone="rain">{MAP.rains}</span> : null}
                          {w === 5 ? <span className="mp-tag">{MAP.letterWeek}</span> : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>

          <aside className="mp-side">
            <LetterSection />
            <section className="mp-stop" aria-labelledby="mp-stop">
              <h2 id="mp-stop" className="mp-h">
                {TODAY.stopTitle}
              </h2>
              <p className="mp-body">{TODAY.stopBody}</p>
              <ButtonLink variant="quiet" href="/pause" className="mt-4">
                {PAUSE.entry}
              </ButtonLink>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
