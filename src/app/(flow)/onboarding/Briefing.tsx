"use client";

import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePool, usePoolPose, type Pose } from "@/components/pool/controller";
import { frame, SETUP_FRAMES } from "@/components/pool/poses";
import { Button, curl, Pair } from "@/components/ui/primitives";
import { BRIEFING, BRIEFING_CARDS } from "@/content/onboarding";
import { seasonFor } from "@/lib/season";
import { useApp } from "@/lib/storage/store";
import { journeyDay, weekOf } from "@/lib/time/journey";

/**
 * "The bit nobody tells you": five cards for people nobody briefed, three for the
 * assessment route. Swipe, the buttons or the arrow keys move between them, and the
 * rings light up the weeks each card is about.
 */
export function Briefing() {
  const profile = useApp((s) => s.data.profile);
  const update = useApp((s) => s.update);
  const router = useRouter();
  const pool = usePool();
  const variant = profile?.channel === "assessment" ? BRIEFING.short : BRIEFING.full;
  const cards = variant.cards.map((i) => BRIEFING_CARDS[i]!);
  const [at, setAt] = useState(0);
  const card = cards[at]!;
  const last = at === cards.length - 1;
  const touch = useRef<{ x: number; y: number } | null>(null);

  const day = profile ? journeyDay(profile.startDate, new Date()) : 0;
  const season = profile ? seasonFor(profile.startDate, profile.cityId, profile.seasonOverride) : null;
  const key = `brief-${at}`;
  const make = useCallback(
    (aspect: number): Pose => ({
      ...frame(SETUP_FRAMES.briefing, aspect),
      dY: 14,
      map: 1,
      week: day >= 1 ? Math.min(24, weekOf(day)) : 0,
      seasonFrom: season?.weeks?.[0] ?? 0,
      seasonTo: season?.weeks?.[1] ?? 0,
      focusFrom: card.weeks?.[0] ?? 0,
      focusTo: card.weeks?.[1] ?? 0,
      focus: card.weeks ? 1 : 0,
      shed: 1,
      dots: 1,
      labels: 0,
      idle: 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  usePoolPose(make, key, { ms: 1000 });
  useEffect(() => () => void pool?.set({ focus: 0 }), [pool]);

  const move = useCallback((d: 1 | -1) => setAt((a) => Math.max(0, Math.min(cards.length - 1, a + d))), [cards.length]);

  const finish = () => {
    update((s) => ({ ...s, onboarding: { ...s.onboarding, briefingSeenAt: new Date().toISOString() } }));
    router.push("/baseline/");
  };

  return (
    <section
      className="ob ob-brief wrap"
      aria-labelledby="brief-title"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") move(1);
        if (e.key === "ArrowLeft") move(-1);
      }}
      onTouchStart={(e) => (touch.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY })}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const dx = e.changedTouches[0]!.clientX - start.x;
        const dy = e.changedTouches[0]!.clientY - start.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
      }}
    >
      <div className="ob-hud">
        <p className="ob-count">
          <span id="brief-title" className="font-medium text-ink">
            {curl(variant.title)}
          </span>
        </p>
        <div className="ob-dots" aria-hidden="true">
          {cards.map((c, i) => (
            <i key={c.title} data-on={i <= at || undefined} />
          ))}
        </div>
      </div>

      <div className="ob-body">
        <p className="ob-brief-lead ob-in" style={{ "--i": 0 } as React.CSSProperties}>
          {curl(variant.lead)}
        </p>
        <div key={at} className="ob-card" aria-live="polite" aria-atomic="true">
          <p className="sr-only">
            Card {at + 1} of {cards.length}.
          </p>
          <Pair as="h2" title={card.title} className="ob-q ob-in" style={{ "--i": 0 } as React.CSSProperties} />
          <p className="ob-card-body ob-in" style={{ "--i": 1 } as React.CSSProperties}>
            {curl(card.body)}
          </p>
          {card.weeks ? (
            <p className="ob-live ob-in" style={{ "--i": 2 } as React.CSSProperties}>
              <span className="ob-live-dot" aria-hidden="true" />
              {card.weeks[0] === card.weeks[1] ? `Week ${card.weeks[0]}` : `Weeks ${card.weeks[0]} to ${card.weeks[1]}`}, lit up on your rings.
            </p>
          ) : null}
        </div>

        <div className="ob-actions">
          <Button variant="quiet" onClick={() => move(-1)} disabled={at === 0} aria-label="Previous card">
            <ArrowLeft size={18} aria-hidden="true" />
          </Button>
          {last ? (
            <Button onClick={finish}>{BRIEFING.done}</Button>
          ) : (
            <Button onClick={() => move(1)}>Next</Button>
          )}
        </div>
      </div>
    </section>
  );
}
