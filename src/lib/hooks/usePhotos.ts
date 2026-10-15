"use client";

import { useEffect, useState } from "react";
import { ensureDemoPhotos } from "@/lib/demo/photos";
import type { Persona } from "@/lib/demo/personas";
import type { Mode } from "@/lib/storage/keys";
import { latestProjection, listPhotos, type PhotoRecord } from "@/lib/storage/photos";

export type Shot = { rec: PhotoRecord; url: string };

/**
 * Every photo in this namespace, each with an object URL that lives as long as the screen.
 * Demo mode draws its sample heads first, once. Null until loaded.
 */
export function usePhotos(mode: Mode, persona: Persona | null, startDate: string): Shot[] | null {
  const [shots, setShots] = useState<Shot[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    void (async () => {
      if (mode === "demo" && persona) await ensureDemoPhotos(persona, startDate);
      const list = await listPhotos(mode);
      if (cancelled) return;
      setShots(
        list.map((rec) => {
          const url = URL.createObjectURL(rec.blob);
          urls.push(url);
          return { rec, url };
        }),
      );
    })();
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [mode, persona, startDate]);
  return shots;
}

/** The most recent week-24 illustration, as an object URL, or null. */
export function useLatestProjection(mode: Mode): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    let made = "";
    void latestProjection(mode).then((p) => {
      if (cancelled || !p) return;
      made = URL.createObjectURL(p.blob);
      setUrl(made);
    });
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [mode]);
  return url;
}
