"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mark } from "@/components/ui/primitives";
import { useApp } from "@/lib/storage/store";

/** Sends people to the right place: the intro once, setup until it's done, then Today. */
export default function Root() {
  const router = useRouter();
  const status = useApp((s) => s.status);
  const mode = useApp((s) => s.mode);
  const introSeen = useApp((s) => s.data.settings.introSeen);
  const planReady = useApp((s) => s.data.profile !== null && Boolean(s.data.onboarding.completedAt));

  useEffect(() => {
    if (status !== "ready") return;
    if (mode === "demo" || planReady) router.replace("/home");
    else if (!introSeen) router.replace("/intro");
    else router.replace("/start");
  }, [status, mode, introSeen, planReady, router]);

  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true">
      <Mark className="size-10 opacity-60" />
      <span className="sr-only">Opening Week Five</span>
    </div>
  );
}
