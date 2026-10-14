"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mark } from "@/components/ui/primitives";
import { setupInProgress } from "@/lib/onboarding";
import { useApp } from "@/lib/storage/store";

/** Sends people to the right place: the welcome screen (which plays the intro on a first visit), back into setup if it was left halfway, then Today. */
export default function Root() {
  const router = useRouter();
  const status = useApp((s) => s.status);
  const mode = useApp((s) => s.mode);
  const planReady = useApp((s) => s.data.profile !== null && Boolean(s.data.onboarding.completedAt));
  const midway = useApp((s) => setupInProgress(s.data));

  useEffect(() => {
    if (status !== "ready") return;
    router.replace(mode === "demo" || planReady ? "/home" : midway ? "/onboarding" : "/start");
  }, [status, mode, planReady, midway, router]);

  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true">
      <Mark className="size-10 opacity-60" />
      <span className="sr-only">Opening Week Five</span>
    </div>
  );
}
