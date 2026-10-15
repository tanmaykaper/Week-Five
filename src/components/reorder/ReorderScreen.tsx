"use client";

import { ArrowSquareOut, CalendarPlus, Check } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LABEL_ANGLE, onRing } from "@/components/pool/geometry";
import { frame, weekFrame } from "@/components/pool/poses";
import { PoolStage } from "@/components/pool/PoolStage";
import { StagePool } from "@/components/pool/StagePool";
import { Gate } from "@/components/shell/Gate";
import { Button, Pair, Tag } from "@/components/ui/primitives";
import { SKUS, skuByCode } from "@/content/skus";
import { SUPPLY } from "@/content/supply";
import { TODAY } from "@/content/today";
import { useJourney } from "@/lib/hooks/useJourney";
import { downloadIcs, icsCalendar } from "@/lib/ics";
import { calendarEvents, supplyWord, upcoming } from "@/lib/reminders";
import { addPack, REORDER_PROMPT_DAYS, removePack, reorderAllowed, runway } from "@/lib/runway";
import { seasonFor } from "@/lib/season";
import { useApp } from "@/lib/storage/store";
import { addDays, differenceInCalendarDays, journeyDay, parseISODate, toISODate, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";
import "@/components/ui/stage.css";
import "./reorder.css";

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
const fmtWhen = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const read = () => setOnline(navigator.onLine);
    read();
    window.addEventListener("online", read);
    window.addEventListener("offline", read);
    return () => {
      window.removeEventListener("online", read);
      window.removeEventListener("offline", read);
    };
  }, []);
  return online;
}

/**
 * Supply (BUILD_DOC F12): what's left of the pack as a level, the weeks it still covers lit
 * on the rings, the reorder only after reassurance, the packs, and the reminders to come.
 */
export function ReorderScreen() {
  return (
    <Gate>
      <Supply />
    </Gate>
  );
}

function Supply() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const profile = data.profile!;
  const { now, day } = useJourney();
  const online = useOnline();
  const heroRef = useRef<HTMLElement>(null);
  const [calendarSaved, setCalendarSaved] = useState(false);

  const r = runway(profile.packs, now);
  const snoozedUntil = data.settings.reorder.snoozedUntil;
  const snoozed = Boolean(snoozedUntil && differenceInCalendarDays(parseISODate(snoozedUntil), now) > 0);
  const held = !reorderAllowed(data.checkins, now);
  const allowed = reorderAllowed(data.checkins, now, snoozedUntil);
  const low = Boolean(r && r.daysLeft <= REORDER_PROMPT_DAYS);
  const word = r ? supplyWord(r) : "";
  const newest = profile.packs.length ? profile.packs.reduce((a, b) => (b.reg >= a.reg ? b : a)) : null;

  const here = day !== null && day >= 1 ? Math.min(TOTAL_WEEKS, weekOf(day)) : 0;
  const outDay = r ? journeyDay(profile.startDate, r.runsOut) : 0;
  const outWeek = r ? Math.min(TOTAL_WEEKS, Math.max(1, weekOf(outDay))) : 0;
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);
  const lit = r && r.daysLeft > 0 && here > 0 ? ([Math.min(here, outWeek), outWeek] as const) : null;
  const viewWeek = Math.max(4, outWeek || here || 4);

  const saveCalendar = () => {
    downloadIcs("week-five-reminders.ics", icsCalendar(calendarEvents(data, now)));
    setCalendarSaved(true);
  };

  return (
    <div className="st sp">
      <PoolStage />
      <StagePool
        heroRef={heroRef}
        poseKey={`supply|${here}|${lit?.join("-") ?? "none"}|${season.weeks?.join("-") ?? "dry"}`}
        pose={(aspect) => ({
          ...frame(weekFrame(viewWeek), aspect),
          dY: 14,
          drop: 0,
          fall: 0,
          ripple: 0,
          map: 1,
          week: here,
          seasonFrom: season.weeks?.[0] ?? 0,
          seasonTo: season.weeks?.[1] ?? 0,
          shed: 0.6,
          dots: 1,
          cohort: 0,
          labels: 1,
          focus: lit ? 1 : 0,
          focusFrom: lit?.[0] ?? 0,
          focusTo: lit?.[1] ?? 0,
          idle: 1,
        })}
        labels={[
          { name: "here", text: here > 0 ? `You are here, week ${here}` : "", tone: "accent", at: onRing(Math.max(1, here), 1.2), show: (wide) => wide && here > 0 && here !== outWeek },
          { name: "out", text: r && r.daysLeft > 0 ? `Pack runs out, week ${outWeek}` : "", tone: "amber", at: onRing(Math.max(1, outWeek), LABEL_ANGLE), show: () => Boolean(r && r.daysLeft > 0 && outWeek > 0) },
        ]}
      />

      <section ref={heroRef} className="st-hero" aria-labelledby="sp-title">
        <div className="st-words">
          <p className="st-kicker reveal" style={{ "--i": 0 } as React.CSSProperties}>
            {SUPPLY.kicker}
            {r ? <span className="num">{r.sku.name}</span> : null}
          </p>
          {r ? (
            <>
              <Pair
                id="sp-title"
                title={TODAY.daysLeft(r.daysLeft)}
                turn={r.daysLeft > 0 ? TODAY.runsOut(word, fmtDay(r.runsOut)) : TODAY.ranOut(word)}
                className="st-pair reveal"
                style={{ "--i": 1 } as React.CSSProperties}
              />
              <div className="reveal" style={{ "--i": 2 } as React.CSSProperties}>
                <div
                  className="st-level"
                  data-low={low || undefined}
                  role="img"
                  aria-label={`${Math.round((1 - r.used) * 100)} percent of the pack left`}
                >
                  <i style={{ width: `${Math.max(2, (1 - r.used) * 100)}%`, "--from": 1 / Math.max(0.02, 1 - r.used) } as React.CSSProperties} />
                </div>
                <p className="st-level-labels num">
                  <span>{newest ? SUPPLY.bought(fmtDay(parseISODate(newest.reg))) : ""}</span>
                  <span>{SUPPLY.runsOut(fmtDay(r.runsOut))}</span>
                </p>
              </div>
              <div className="reveal" style={{ "--i": 3 } as React.CSSProperties}>
                {low && allowed ? (
                  <div className="st-actions">
                    {online ? (
                      <a className="sp-reorder" href="https://manmatters.com" target="_blank" rel="noopener noreferrer">
                        {TODAY.reorder}
                        <ArrowSquareOut size={16} aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="st-line">{SUPPLY.offline}</p>
                    )}
                    <Button
                      variant="quiet"
                      onClick={() =>
                        update((s) => ({ ...s, settings: { ...s.settings, reorder: { ...s.settings.reorder, snoozedUntil: toISODate(addDays(now, 3)) } } }))
                      }
                    >
                      {TODAY.snooze}
                    </Button>
                  </div>
                ) : low && held ? (
                  <p className="st-line">{SUPPLY.heldLine}</p>
                ) : low && snoozed ? (
                  <div className="st-actions">
                    <p className="st-line mt-0">{SUPPLY.snoozedLine(fmtDay(parseISODate(snoozedUntil!)))}</p>
                    <Button
                      variant="quiet"
                      className="h-11 px-5"
                      onClick={() => update((s) => ({ ...s, settings: { ...s.settings, reorder: { ...s.settings.reorder, snoozedUntil: undefined } } }))}
                    >
                      {SUPPLY.showNow}
                    </Button>
                  </div>
                ) : (
                  <p className="st-line">{SUPPLY.calmLine}</p>
                )}
                <div className="st-actions">
                  <Button variant="quiet" className="h-11 px-5" onClick={saveCalendar}>
                    <CalendarPlus size={18} aria-hidden="true" />
                    {SUPPLY.calendar}
                  </Button>
                </div>
                <p className="st-status" role="status">
                  {calendarSaved ? SUPPLY.calendarDone : ""}
                </p>
              </div>
            </>
          ) : (
            <>
              <Pair id="sp-title" title={SUPPLY.noPackTitle} turn={SUPPLY.noPackTurn} className="st-pair reveal" style={{ "--i": 1 } as React.CSSProperties} />
              <p className="st-lead reveal" style={{ "--i": 2 } as React.CSSProperties}>
                {SUPPLY.noPackLead}
              </p>
              <div className="sp-hero-form reveal" style={{ "--i": 3 } as React.CSSProperties}>
                <AddPack now={now} onAdd={(pack) => update((s) => ({ ...s, profile: addPack(s.profile!, pack) }))} />
              </div>
            </>
          )}
        </div>
      </section>

      <div className="st-sheet">
        <div className="wrap st-grid">
          <div className="st-main">
            <section aria-labelledby="sp-packs">
              <div className="st-head">
                <h2 id="sp-packs" className="st-h">
                  {SUPPLY.packsTitle}
                </h2>
              </div>
              <p className="st-body">{SUPPLY.packsLead}</p>
              {profile.packs.length ? (
                <Packs packs={profile.packs} onRemove={(i) => update((s) => ({ ...s, profile: removePack(s.profile!, i) }))} />
              ) : null}
              <div className="mt-8">
                <h3 className="st-h">{SUPPLY.addTitle}</h3>
                <div className="mt-4">
                  <AddPack now={now} onAdd={(pack) => update((s) => ({ ...s, profile: addPack(s.profile!, pack) }))} />
                </div>
              </div>
            </section>
          </div>

          <aside className="st-side">
            <Upcoming />
            <p className="st-fine">{SUPPLY.linkNote}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Packs({ packs, onRemove }: { packs: { sku: string; reg: string; batch?: string }[]; onRemove: (i: number) => void }) {
  const [confirm, setConfirm] = useState<number | null>(null);
  const newest = packs.reduce((best, p, i) => (p.reg >= packs[best]!.reg ? i : best), 0);
  return (
    <ul className="st-rows mt-5">
      {packs.map((p, i) => {
        const sku = skuByCode(p.sku);
        return (
          <li key={`${p.sku}-${p.reg}-${i}`} className="st-row">
            <span className="st-row-main">
              <span className="st-row-title">
                {sku?.name ?? p.sku} {i === newest ? <Tag tone="info" className="ml-1.5 align-middle">{SUPPLY.newest}</Tag> : null}
              </span>
              <span className="st-row-sub num">
                {SUPPLY.bought(fmtDay(parseISODate(p.reg)))}
                {sku ? `, about ${sku.daysOfSupply} days of supply` : ""}
                {p.batch ? `, batch ${p.batch}` : ""}
              </span>
            </span>
            <span className="st-row-end">
              {confirm === i ? (
                <>
                  <button type="button" className="st-mini" data-tone="danger" onClick={() => (onRemove(i), setConfirm(null))}>
                    {SUPPLY.removeConfirm}
                  </button>
                  <button type="button" className="st-mini" onClick={() => setConfirm(null)}>
                    {SUPPLY.keep}
                  </button>
                </>
              ) : (
                <button type="button" className="st-mini" onClick={() => setConfirm(i)} aria-label={`${SUPPLY.remove} ${sku?.name ?? p.sku}`}>
                  {SUPPLY.remove}
                </button>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AddPack({ now, onAdd }: { now: Date; onAdd: (pack: { sku: string; reg: string; scannedAt: string }) => void }) {
  const [sku, setSku] = useState(SKUS[0]!.code);
  const [reg, setReg] = useState(() => toISODate(now));
  const [status, setStatus] = useState<string | null>(null);
  const today = toISODate(now);
  const earliest = toISODate(addDays(now, -365));
  return (
    <form
      className="sp-add"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reg || reg > today || reg < earliest) {
          setStatus(SUPPLY.dateProblem);
          return;
        }
        onAdd({ sku, reg, scannedAt: new Date().toISOString() });
        setStatus(SUPPLY.added(skuByCode(sku)?.name ?? sku));
      }}
    >
      <label className="st-label">
        {SUPPLY.which}
        <select className="st-field" value={sku} onChange={(e) => setSku(e.target.value)}>
          {SKUS.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="st-label">
        {SUPPLY.when}
        <input className="st-field" type="date" value={reg} min={earliest} max={today} onChange={(e) => setReg(e.target.value)} required />
      </label>
      <button type="submit" className="sp-add-go">
        <Check size={16} weight="bold" aria-hidden="true" />
        {SUPPLY.addPack}
      </button>
      <p className="st-status sp-add-status" role="status">
        {status}
      </p>
    </form>
  );
}

function Upcoming() {
  const data = useApp((s) => s.data);
  const { now } = useJourney();
  const next = upcoming(data, now, 5);
  return (
    <section aria-labelledby="sp-upcoming">
      <h2 id="sp-upcoming" className="st-h">
        {SUPPLY.upcomingTitle}
      </h2>
      <p className="st-body">{SUPPLY.upcomingLead}</p>
      <ol className="st-rows mt-5">
        {next.map((r) => (
          <li key={r.id} className="st-row sp-up" data-kind={r.kind}>
            <span className="st-row-main">
              <span className="st-row-title">{r.title}</span>
              <span className="st-row-sub num">
                {fmtWhen(r.at)}, {r.at.toTimeString().slice(0, 5)}
              </span>
            </span>
            <i className="sp-up-dot" aria-hidden="true" />
          </li>
        ))}
      </ol>
      <p className="st-fine">
        {data.settings.notifications ? SUPPLY.notifyOn : SUPPLY.notifyOff}{" "}
        <Link href="/profile#reminders" className="font-medium text-ink underline decoration-ink/25 underline-offset-4">
          {SUPPLY.notifyChange}
        </Link>
      </p>
    </section>
  );
}
