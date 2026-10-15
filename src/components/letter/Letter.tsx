"use client";

import { EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { Button, curl, Pair } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/Sheet";
import { LETTER } from "@/content/journey";
import { useJourney } from "@/lib/hooks/useJourney";
import { letterOpens, letterStatus, revealLetter, writeLetter } from "@/lib/letter";
import type { Letter } from "@/lib/storage/schema";
import { useApp } from "@/lib/storage/store";
import { letterSheet, useLetterSheet } from "./sheet";
import "./letter.css";

const fmt = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long" });

/** The note itself, in the serif, with when it was written. */
export function LetterText({ letter }: { letter: Letter }) {
  return (
    <figure className="lt-paper">
      <blockquote className="lt-text">{curl(letter.text)}</blockquote>
      <figcaption className="lt-date">{LETTER.wroteOn(fmt(letter.writtenAt))}</figcaption>
    </figure>
  );
}

/** "Read your note": a deliberate tap. The sheet itself is LetterDialog, in the app layout. */
export function LetterReadButton({ variant = "quiet", className = "" }: { variant?: "primary" | "quiet"; className?: string }) {
  const letter = useApp((s) => s.data.letter);
  if (!letter) return null;
  return (
    <Button variant={variant} className={className} onClick={() => letterSheet.open()} aria-haspopup="dialog">
      <EnvelopeSimple size={18} aria-hidden="true" />
      {LETTER.read}
    </Button>
  );
}

/** The note in a sheet. Opening it is what counts as reading it. */
export function LetterDialog() {
  const open = useLetterSheet();
  const letter = useApp((s) => s.data.letter);
  const update = useApp((s) => s.update);
  useEffect(() => {
    if (open) update((s) => revealLetter(s, "week-4", new Date()));
  }, [open, update]);
  return (
    <Sheet open={open && Boolean(letter)} onClose={() => letterSheet.close()} labelledBy="lt-read-title" closeLabel={LETTER.close}>
      {letter ? (
        <div className="lt-sheet">
          <Pair id="lt-read-title" as="h2" title={LETTER.readTitle} className="lt-title" />
          <LetterText letter={letter} />
          <Button onClick={() => letterSheet.close()}>{LETTER.close}</Button>
        </div>
      ) : null}
    </Sheet>
  );
}

/** The map's letter block: write it, see it sealed, open it when it's ready, or read it again. */
export function LetterSection() {
  const letter = useApp((s) => s.data.letter);
  const start = useApp((s) => s.data.profile?.startDate ?? null);
  const update = useApp((s) => s.update);
  const { day } = useJourney();
  const [draft, setDraft] = useState("");
  const status = letterStatus(letter, day ?? 1);

  return (
    <section id="letter" className="lt-section" aria-labelledby="lt-title" data-status={status}>
      {status === "none" ? (
        <form
          className="lt-write"
          onSubmit={(e) => {
            e.preventDefault();
            update((s) => writeLetter(s, draft, new Date()));
          }}
        >
          <Pair id="lt-title" as="h2" title={LETTER.writeTitle} turn={LETTER.writeTurn} className="lt-title" />
          <label className="lt-field">
            <span className="sr-only">A note to yourself for week five</span>
            <textarea maxLength={400} rows={4} value={draft} placeholder={LETTER.placeholder} onChange={(e) => setDraft(e.target.value)} />
            <span className="lt-hint">
              <span>{LETTER.hint}</span>
              <span className="num">{400 - draft.length}</span>
            </span>
          </label>
          <Button type="submit" disabled={!draft.trim()}>
            {LETTER.seal}
          </Button>
        </form>
      ) : status === "sealed" ? (
        <div className="lt-sealed">
          <span className="lt-seal" aria-hidden="true">
            <EnvelopeSimple size={26} />
          </span>
          <div>
            <Pair id="lt-title" as="h2" title={LETTER.sealedTitle} turn={start ? LETTER.sealedTurn(fmt(letterOpens(start))) : undefined} className="lt-title" />
            <p className="lt-body">{LETTER.sealedBody}</p>
          </div>
        </div>
      ) : status === "ready" ? (
        <div className="lt-sealed" data-ready>
          <span className="lt-seal" aria-hidden="true">
            <EnvelopeSimple size={26} />
          </span>
          <div>
            <Pair id="lt-title" as="h2" title={LETTER.readyTitle} turn={LETTER.readyTurn} className="lt-title" />
            <LetterReadButton variant="primary" className="mt-5" />
          </div>
        </div>
      ) : (
        <div>
          <h2 id="lt-title" className="lt-kicker">
            {LETTER.readTitle}
          </h2>
          <LetterText letter={letter!} />
        </div>
      )}
    </section>
  );
}
