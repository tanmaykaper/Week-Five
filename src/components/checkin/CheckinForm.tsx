"use client";

import { Minus, Plus } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { HeadGhost } from "@/components/heads/HeadGhost";
import { Button, curl, Pair } from "@/components/ui/primitives";
import { CHECKIN, RED_FLAG_LABELS, RESPONSE_TITLES, SHED_WORDS, WORRY_WORDS } from "@/content/checkin";
import { painterView } from "@/lib/baseline";
import { makeCheckin, respond, type CheckinResponse } from "@/lib/checkin";
import { useJourney } from "@/lib/hooks/useJourney";
import { baselinePhotos } from "@/lib/storage/photos";
import { redFlags, type RedFlag } from "@/lib/storage/schema";
import { useApp } from "@/lib/storage/store";
import { WeekTicks } from "@/components/ui/WeekTicks";
import "./checkin.css";

/**
 * The check-in: hair fall, worry, missed applications, anything worrying, a note. Thirty
 * seconds, and then an answer for where the person is: a red flag replaces everything
 * with a doctor card; doubt in the shed window brings back the day-one photo and the map.
 */
export function CheckinForm({ onDone, titleId = "ck-title" }: { onDone?: () => void; titleId?: string }) {
  const update = useApp((s) => s.update);
  const { now, day } = useJourney();
  const [shed, setShed] = useState<number | null>(null);
  const [worry, setWorry] = useState<number | null>(null);
  const [missed, setMissed] = useState(0);
  const [flags, setFlags] = useState<RedFlag[]>([]);
  const [note, setNote] = useState("");
  const [answer, setAnswer] = useState<CheckinResponse | null>(null);
  const [savedFlags, setSavedFlags] = useState<RedFlag[]>([]);

  const d = day ?? 1;
  const ready = shed !== null && worry !== null;

  if (answer) return <Answer answer={answer} flags={savedFlags} day={d} titleId={titleId} onDone={onDone} />;

  return (
    <form
      className="ck-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (shed === null || worry === null) return;
        const checkin = makeCheckin({ shed, worry, missedDoses: missed, redFlags: flags, note }, d, now);
        update((s) => ({ ...s, checkins: [...s.checkins, checkin] }));
        setSavedFlags(flags);
        setAnswer(respond(checkin, d));
        requestAnimationFrame(() => document.getElementById(titleId)?.focus({ preventScroll: true }));
      }}
    >
      <Pair id={titleId} tabIndex={-1} as="h2" title={CHECKIN.title} turn={CHECKIN.turn} className="ck-title" />

      <Scale name="shed" legend={CHECKIN.shed} words={SHED_WORDS} value={shed} onChange={setShed} />
      <Scale name="worry" legend={CHECKIN.worry} words={WORRY_WORDS} value={worry} onChange={setWorry} />

      <div className="ck-row">
        <span id="ck-missed" className="ck-legend">
          {CHECKIN.missed}
        </span>
        <div className="ck-stepper" role="group" aria-labelledby="ck-missed">
          <button type="button" aria-label="One fewer" onClick={() => setMissed((m) => Math.max(0, m - 1))} disabled={missed === 0}>
            <Minus size={16} weight="bold" aria-hidden="true" />
          </button>
          <output className="num" aria-live="polite">
            {missed}
          </output>
          <button type="button" aria-label="One more" onClick={() => setMissed((m) => Math.min(14, m + 1))} disabled={missed === 14}>
            <Plus size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <fieldset className="ck-field">
        <legend className="ck-legend">{CHECKIN.flags}</legend>
        <div className="ck-pills">
          {redFlags.map((f) => (
            <label key={f} className="ck-pill" data-flag>
              <input
                type="checkbox"
                checked={flags.includes(f)}
                onChange={(e) => setFlags((all) => (e.target.checked ? [...all, f] : all.filter((x) => x !== f)))}
              />
              <span>{RED_FLAG_LABELS[f]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="ck-field">
        <span className="ck-legend">{CHECKIN.note}</span>
        <textarea maxLength={280} rows={2} value={note} placeholder={CHECKIN.notePlaceholder} onChange={(e) => setNote(e.target.value)} />
      </label>

      <div className="ck-actions">
        <Button type="submit" disabled={!ready}>
          {CHECKIN.save}
        </Button>
        <p className="ck-fine">{CHECKIN.privacy}</p>
      </div>
    </form>
  );
}

function Scale({
  name,
  legend,
  words,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  words: readonly string[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <fieldset className="ck-field">
      <legend className="ck-legend">{legend}</legend>
      <div className="ck-pills" data-scale>
        {words.map((w, i) => (
          <label key={w} className="ck-pill" style={{ "--level": i } as React.CSSProperties}>
            <input type="radio" name={name} value={i} checked={value === i} onChange={() => onChange(i)} />
            <span>{w}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Answer({
  answer,
  flags,
  day,
  titleId,
  onDone,
}: {
  answer: CheckinResponse;
  flags: RedFlag[];
  day: number;
  titleId: string;
  onDone?: () => void;
}) {
  const t = RESPONSE_TITLES[answer.kind];
  return (
    <div className="ck-answer" data-kind={answer.kind}>
      <p className="ck-saved">{CHECKIN.saved}</p>
      <Pair id={titleId} tabIndex={-1} as="h2" title={t.title} turn={t.turn || undefined} className="ck-title" />
      <p className="ck-response">{curl(answer.text)}</p>
      {answer.kind === "red" && flags.length > 0 ? (
        <ul className="ck-flags" aria-label="What you ticked">
          {flags.map((f) => (
            <li key={f}>{RED_FLAG_LABELS[f]}</li>
          ))}
        </ul>
      ) : null}
      {answer.kind !== "red" && answer.showBaseline ? <DayOne /> : null}
      {answer.kind !== "red" && answer.showMap ? <WeekTicks day={day} className="ck-map" /> : null}
      <div className="ck-actions">
        <Button onClick={onDone}>{CHECKIN.done}</Button>
      </div>
    </div>
  );
}

const NO_WORRIES: never[] = [];

/** The day-one photo of the area they worry about, for comparing against the feeling. */
function DayOne() {
  const mode = useApp((s) => s.mode);
  const worries = useApp((s) => s.data.profile?.worries) ?? NO_WORRIES;
  const [shot, setShot] = useState<{ url: string; view: string } | null | undefined>(undefined);
  useEffect(() => {
    let url = "";
    let cancelled = false;
    void baselinePhotos(mode).then((all) => {
      if (cancelled) return;
      const rec = all[painterView(worries)] ?? all.crown ?? all.hairline ?? all.parting;
      if (!rec) return setShot(null);
      url = URL.createObjectURL(rec.blob);
      setShot({ url, view: rec.view });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [mode, worries]);
  if (shot === undefined) return <div className="ck-dayone" aria-busy="true" />;
  return (
    <figure className="ck-dayone">
      <span className="ck-disc">
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot.url} alt={`Your day-one ${shot.view} photo`} width={240} height={240} />
        ) : (
          <HeadGhost view="crown" />
        )}
      </span>
      <figcaption>{shot ? "Day 1. Compare it with today in daylight, not with the drain." : "No day-one photo yet. Take one tonight; it makes next month easier."}</figcaption>
    </figure>
  );
}
