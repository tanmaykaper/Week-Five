"use client";

import { Printer } from "@phosphor-icons/react/ssr";
import { Button, Pair } from "@/components/ui/primitives";
import { RED_FLAG_LABELS, SHED_WORDS, WORRY_WORDS } from "@/content/checkin";
import { DOCTOR } from "@/content/journey";
import { CHANNEL_OPTIONS, PRODUCT_OPTIONS } from "@/content/onboarding";
import { useJourney } from "@/lib/hooks/useJourney";
import { useApp } from "@/lib/storage/store";
import { parseISODate, weekOf } from "@/lib/time/journey";

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * One page for a doctor: dates, what they use (names only, never amounts), how they bought
 * it, recent check-ins and anything flagged. Printable. Built only from what was entered.
 */
export function DoctorSummary() {
  const profile = useApp((s) => s.data.profile)!;
  const checkins = useApp((s) => s.data.checkins);
  const { now, day } = useJourney();
  const recent = checkins
    .filter((c) => Date.parse(c.at) <= now.getTime())
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);
  const flagged = [...new Set(recent.flatMap((c) => c.redFlags))];
  const products = profile.products.map((p) => PRODUCT_OPTIONS.find((o) => o.value === p)?.label ?? p).join(", ");
  const channel = CHANNEL_OPTIONS.find((o) => o.value === profile.channel)?.label ?? profile.channel;
  const d = day ?? 1;

  return (
    <section className="dr print-sheet" aria-labelledby="dr-title">
      <Pair id="dr-title" tabIndex={-1} title={DOCTOR.title} turn={DOCTOR.turn} className="dr-title" />
      <p className="dr-lead">{DOCTOR.lead}</p>
      <dl className="dr-facts">
        <div>
          <dt>{DOCTOR.started}</dt>
          <dd>{fmt(parseISODate(profile.startDate))}</dd>
        </div>
        <div>
          <dt>{DOCTOR.day}</dt>
          <dd className="num">{d >= 1 ? `Day ${d}, week ${weekOf(d)}` : "Not started yet"}</dd>
        </div>
        <div>
          <dt>{DOCTOR.products}</dt>
          <dd>{products}</dd>
        </div>
        <div>
          <dt>{DOCTOR.channel}</dt>
          <dd>{channel}</dd>
        </div>
        <div>
          <dt>{DOCTOR.flags}</dt>
          <dd>{flagged.length ? flagged.map((f) => RED_FLAG_LABELS[f]).join(", ") : DOCTOR.noFlags}</dd>
        </div>
      </dl>

      <h2 className="dr-h">{DOCTOR.checkins}</h2>
      {recent.length ? (
        <table className="dr-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Hair fall</th>
              <th scope="col">Worry</th>
              <th scope="col">Missed</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id}>
                <td className="num">{new Date(c.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                <td>{SHED_WORDS[c.shed]}</td>
                <td>{WORRY_WORDS[c.worry]}</td>
                <td className="num">{c.missedDoses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="dr-lead">{DOCTOR.none}</p>
      )}

      <h2 className="dr-h">{DOCTOR.ask}</h2>
      <ul className="dr-questions">
        {DOCTOR.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <p className="dr-fine">{DOCTOR.disclaimer}</p>
      <Button className="no-print" onClick={() => window.print()}>
        <Printer size={18} aria-hidden="true" />
        {DOCTOR.print}
      </Button>
    </section>
  );
}
