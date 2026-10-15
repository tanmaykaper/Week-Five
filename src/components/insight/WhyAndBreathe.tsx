"use client";

import { useState } from "react";
import { Button, Pair } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/Sheet";
import { BREATHE, WHY } from "@/content/journey";
import { citationFor } from "@/content/references";
import { reasonSentence, type Insight } from "@/lib/insights";
import "./insight.css";

/** "Why am I seeing this?": the plain trigger and where the claim comes from. */
export function WhyLink({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const sources = insight.refs.map(citationFor).filter((c): c is string => Boolean(c));
  return (
    <>
      <button type="button" className="why-link" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {WHY.link}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} labelledBy="why-title">
        <div className="why-sheet">
          <Pair id="why-title" as="h2" title={WHY.title} turn={WHY.turn} className="why-title" />
          <p className="why-reason">{reasonSentence(insight.reasons)}</p>
          {sources.length ? (
            <div>
              <h3 className="why-h">{WHY.from}</h3>
              <ul className="why-sources">
                {sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button onClick={() => setOpen(false)}>{WHY.done}</Button>
        </div>
      </Sheet>
    </>
  );
}

/**
 * The night card's breathing circle: four seconds in, six out, no numbers. Under reduced
 * motion it stays still and says the same thing in words.
 */
export function Breathe() {
  return (
    <div className="breathe" role="img" aria-label={BREATHE.still}>
      <span className="breathe-ring" aria-hidden="true" />
      <span className="breathe-words" aria-hidden="true">
        <span data-phase="in">{BREATHE.in}</span>
        <span data-phase="out">{BREATHE.out}</span>
        <span data-phase="still">{BREATHE.still}</span>
      </span>
    </div>
  );
}
