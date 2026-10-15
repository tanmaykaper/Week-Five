"use client";

import { useMemo, useRef } from "react";
import { WEEK } from "@/content/journey";
import { useJourney } from "@/lib/hooks/useJourney";
import { seasonFor } from "@/lib/season";
import { useApp } from "@/lib/storage/store";
import { PHOTO_WEEKS, TOTAL_WEEKS, weekOf } from "@/lib/time/journey";
import { MapPool } from "./MapPool";

/**
 * The live part of a week page: the camera on that week's ring, and whether this is the
 * user's week, a photo week or a rainy one. The rest of the page is static text.
 */
export function WeekPose({ week }: { week: number }) {
  const profile = useApp((s) => s.data.profile);
  const ready = useApp((s) => s.status === "ready");
  const { day } = useJourney();
  const here = day !== null && day >= 1 ? Math.min(TOTAL_WEEKS, weekOf(day)) : 0;
  const season = useMemo(
    () => (profile ? seasonFor(profile.startDate, profile.cityId, profile.seasonOverride).weeks : null),
    [profile],
  );
  // The hero is server-rendered around this component; find it from here once mounted.
  const probe = useRef<HTMLDivElement>(null);
  const heroRef = useMemo(
    () => ({
      get current() {
        return probe.current?.closest("section") ?? null;
      },
    }),
    [],
  );
  const rainy = Boolean(season && week >= season[0] && week <= season[1]);
  return (
    <>
      <MapPool selected={week} here={profile ? here : 0} season={season} heroRef={heroRef} />
      {ready ? (
        <div ref={probe} className="wk-status">
          {profile && week === here ? <span className="mp-tag" data-tone="accent">{WEEK.here}</span> : null}
          {(PHOTO_WEEKS as readonly number[]).includes(week) ? <span className="mp-tag" data-tone="amber">{WEEK.photoWeek}</span> : null}
          {rainy ? <span className="mp-tag" data-tone="rain">{WEEK.rainWeek}</span> : null}
        </div>
      ) : (
        <div ref={probe} className="wk-status" aria-hidden="true" />
      )}
    </>
  );
}
