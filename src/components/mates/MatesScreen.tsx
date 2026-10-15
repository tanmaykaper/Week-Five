"use client";

import { Check, Drop, HandWaving, ShareNetwork } from "@phosphor-icons/react/ssr";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePool } from "@/components/pool/controller";
import { COHORT_SPOTS, onRing } from "@/components/pool/geometry";
import { frame, MATES_FRAME } from "@/components/pool/poses";
import { PoolStage } from "@/components/pool/PoolStage";
import { StagePool, type StageLabel } from "@/components/pool/StagePool";
import { Gate } from "@/components/shell/Gate";
import { Button, Pair, Tag } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/Sheet";
import { eventText, MATES } from "@/content/mates";
import { useJourney } from "@/lib/hooks/useJourney";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { withBase } from "@/lib/paths";
import { cohortProvider, startWeekOf, type Mate, type MateEvent } from "@/lib/providers/cohort";
import { seasonFor } from "@/lib/season";
import { useApp } from "@/lib/storage/store";
import { toISODate, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";
import "@/components/ui/stage.css";
import "./mates.css";

/**
 * Journey mates (BUILD_DOC F16): the people who started when you did, as drops landing on
 * the same water, with a fortnight of small events, a nudge you can send, and an honest note
 * on how a real version would work. Simulated, and labelled so.
 */
export function MatesScreen() {
  return (
    <Gate>
      <Mates />
    </Gate>
  );
}

function Mates() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const profile = data.profile!;
  const { now, day: rawDay } = useJourney();
  const day = Math.max(1, rawDay ?? 1);
  const started = (rawDay ?? 0) >= 1;
  const here = Math.min(TOTAL_WEEKS, weekOf(day));
  const provider = useMemo(() => cohortProvider(profile.startDate), [profile.startDate]);
  const [people, setPeople] = useState<Mate[] | null>(null);
  const [events, setEvents] = useState<MateEvent[] | null>(null);
  const [nudging, setNudging] = useState<Mate | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const pool = usePool();
  const reduced = useReducedMotion();
  const season = useMemo(() => seasonFor(profile.startDate, profile.cityId, profile.seasonOverride), [profile.startDate, profile.cityId, profile.seasonOverride]);

  useEffect(() => {
    let live = true;
    Promise.all([provider.cohort(), provider.events(day, 18)]).then(([p, e]) => {
      if (!live) return;
      setPeople(p);
      setEvents(e);
    });
    return () => {
      live = false;
    };
  }, [provider, day]);

  const byId = useMemo(() => new Map((people ?? []).map((m) => [m.id, m])), [people]);
  const startWeek = people ? startWeekOf(people) : [];
  const sameWeek = startWeek.filter((m) => weekOf(day - m.offset) === weekOf(day)).length;
  const today = toISODate(now);
  const nudged = new Set(data.nudgesSent.filter((n) => n.on === today).map((n) => n.mateId));

  // Other people's drops land on your water, again every so often while you watch.
  const landedAt = useRef(0);
  useEffect(() => {
    if (!pool || reduced) return;
    const land = () => {
      if (!landedAt.current) landedAt.current = performance.now();
      pool.landCohort(9000);
    };
    const first = window.setTimeout(land, 1500);
    const again = window.setInterval(land, 16000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(again);
    };
  }, [pool, reduced]);

  const names = startWeek.slice(0, 4);
  const labels: StageLabel[] = [
    { name: "you", text: started ? `You, week ${here}` : "You", tone: "accent", at: onRing(Math.max(1, here), 0.55), show: () => true },
    ...names.map((m, i) => ({
      name: `mate-${i}`,
      text: `${m.firstName}, ${m.city}`,
      at: COHORT_SPOTS[i]!,
      // Each name appears once its drop has landed.
      show: (wide: boolean) => wide && (reduced || (landedAt.current > 0 && performance.now() - landedAt.current > i * 1500 + 900)),
    })),
  ];

  const invite = async () => {
    const url = `${window.location.origin}${withBase("/")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Week Five", text: MATES.shareText, url });
      } catch {
        /* closed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${MATES.shareText} ${url}`);
      setInviteStatus(MATES.copied);
    } catch {
      setInviteStatus(url);
    }
  };

  const faces = startWeek.slice(0, 5);

  return (
    <div className="st mt">
      <PoolStage />
      <StagePool
        heroRef={heroRef}
        poseKey={`mates|${here}|${names.map((m) => m.id).join(",")}|${season.weeks?.join("-") ?? "dry"}`}
        pose={(aspect) => ({
          ...frame(MATES_FRAME, aspect),
          dY: 14,
          drop: 0,
          fall: 0,
          ripple: 0,
          map: 1,
          week: started ? here : 0,
          seasonFrom: season.weeks?.[0] ?? 0,
          seasonTo: season.weeks?.[1] ?? 0,
          shed: 0.6,
          dots: 0.6,
          cohort: 0,
          labels: 1,
          focus: 0,
          focusFrom: 0,
          focusTo: 0,
          idle: 1,
        })}
        labels={labels}
      />

      <section ref={heroRef} className="st-hero" aria-labelledby="mt-title">
        <div className="st-words">
          <p className="st-kicker reveal" style={{ "--i": 0 } as React.CSSProperties}>
            {MATES.kicker}
            <Tag tone="info">{MATES.demo}</Tag>
          </p>
          <Pair
            id="mt-title"
            title={MATES.title}
            turn={started && people ? MATES.turn(sameWeek, here) : MATES.turnBefore}
            className="st-pair reveal"
            style={{ "--i": 1 } as React.CSSProperties}
          />
          <div className="mt-faces-row reveal" style={{ "--i": 2 } as React.CSSProperties}>
            <span className="st-faces" aria-hidden="true">
              {faces.map((m) => (
                <span key={m.id}>{m.firstName[0]}</span>
              ))}
              {startWeek.length > faces.length ? (
                <span data-more className="num">
                  +{startWeek.length - faces.length}
                </span>
              ) : null}
            </span>
            <span className="mt-faces-note num">{people ? `${people.length} people started within two weeks of you` : ""}</span>
          </div>
          <p className="st-lead st-phone-hide reveal" style={{ "--i": 3 } as React.CSSProperties}>
            {MATES.lead}
          </p>
          <div className="st-actions reveal" style={{ "--i": 4 } as React.CSSProperties}>
            <Button onClick={invite}>
              <ShareNetwork size={18} aria-hidden="true" />
              {MATES.invite}
            </Button>
            <a href="#mt-feed" className="st-link px-2">
              {MATES.feedTitle}
            </a>
          </div>
          <p className="st-status" role="status">
            {inviteStatus}
          </p>
        </div>
      </section>

      <div className="st-sheet">
        <div className="wrap st-grid">
          <section className="st-main" aria-labelledby="mt-feed">
            <div>
              <div className="st-head">
                <h2 id="mt-feed" className="st-h">
                  {MATES.feedTitle}
                </h2>
                <Tag tone="info">{MATES.demo}</Tag>
              </div>
              {events === null ? (
                <div className="st-rows" aria-busy="true">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="st-row mt-skel" />
                  ))}
                </div>
              ) : (
                <ol className="st-rows mt-feed">
                  {events.map((e) => {
                    const mate = e.mateId ? byId.get(e.mateId) : undefined;
                    const ago = day - e.at;
                    const when = ago === 0 ? MATES.today : ago === 1 ? MATES.yesterday : MATES.daysAgo(ago);
                    return (
                      <li key={e.id} className="st-row mt-event" data-kind={e.kind}>
                        <span className="mt-avatar" aria-hidden="true">
                          {mate ? mate.firstName[0] : <Drop size={18} weight="fill" />}
                        </span>
                        <span className="st-row-main">
                          <span className="mt-event-text">{eventText(e, mate)}</span>
                          <span className="st-row-sub">{when}</span>
                        </span>
                        {mate ? (
                          <button
                            type="button"
                            className="st-mini mt-nudge-btn"
                            disabled={nudged.has(mate.id)}
                            aria-label={nudged.has(mate.id) ? `${MATES.nudged}: ${mate.firstName}` : `${MATES.nudge} ${mate.firstName}`}
                            onClick={() => setNudging(mate)}
                          >
                            {nudged.has(mate.id) ? <Check size={14} weight="bold" aria-hidden="true" /> : <HandWaving size={16} aria-hidden="true" />}
                            <span className="mt-nudge-label">{nudged.has(mate.id) ? MATES.nudged : MATES.nudge}</span>
                          </button>
                        ) : (
                          <span />
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </section>

          <aside className="st-side">
            <section className="st-panel" aria-labelledby="mt-real">
              <h2 id="mt-real" className="st-h">
                {MATES.realTitle}
              </h2>
              <p className="st-body">{MATES.realBody}</p>
              <ul className="mt-points">
                {MATES.realPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="mt-invite">
              <h2 id="mt-invite" className="st-h">
                {MATES.inviteTitle}
              </h2>
              <p className="st-body">{MATES.inviteBody}</p>
              <Button variant="quiet" className="mt-5" onClick={invite}>
                <ShareNetwork size={18} aria-hidden="true" />
                {MATES.invite}
              </Button>
            </section>
          </aside>
        </div>
      </div>

      <NudgeSheet
        mate={nudging}
        onClose={() => setNudging(null)}
        onSend={async (mate, message) => {
          await provider.nudge(mate.id, message);
          update((s) => ({ ...s, nudgesSent: [...s.nudgesSent, { mateId: mate.id, on: today }].slice(-200) }));
          // Your nudge goes out across the water.
          pool?.splash();
        }}
      />
    </div>
  );
}

function NudgeSheet({ mate, onClose, onSend }: { mate: Mate | null; onClose: () => void; onSend: (mate: Mate, message: string) => Promise<void> }) {
  return (
    <Sheet open={mate !== null} onClose={onClose} labelledBy="mt-nudge-title">
      {mate ? <NudgeBody key={mate.id} mate={mate} onClose={onClose} onSend={onSend} /> : null}
    </Sheet>
  );
}

function NudgeBody({ mate, onClose, onSend }: { mate: Mate; onClose: () => void; onSend: (mate: Mate, message: string) => Promise<void> }) {
  const [sent, setSent] = useState<string | null>(null);
  const send = (p: string) => void onSend(mate, p).then(() => setSent(p));
  return (
    <div className="mt-nudge">
      <h2 id="mt-nudge-title" className="pair mt-nudge-pair">
        <span>{MATES.sheetTitle(mate.firstName)}</span>
      </h2>
      {sent ? (
        <div className="mt-sent" role="status">
          <span className="mt-sent-drop" aria-hidden="true">
            <span>{sent}</span>
          </span>
          <p className="mt-sent-title">{MATES.sent}</p>
          <p className="st-body">{MATES.sentNote}</p>
          <Button variant="quiet" className="mt-6" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <p className="st-body mt-2">{MATES.sheetLead}</p>
          <div className="st-chips mt-6" role="group" aria-label="Phrases">
            {MATES.phrases.map((p) => (
              <button key={p} type="button" className="st-chip" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
          <div className="st-chips mt-3" role="group" aria-label="Or a single emoji">
            {MATES.emoji.map((p) => (
              <button key={p} type="button" className="st-chip mt-emoji" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
          <p className="st-fine">{MATES.sentNote}</p>
        </>
      )}
    </div>
  );
}
