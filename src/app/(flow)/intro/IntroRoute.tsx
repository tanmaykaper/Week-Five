"use client";

import { Suspense, useState } from "react";
import { focusMainWhenVisible, IntroOverlay } from "@/components/intro/IntroOverlay";
import { PageSkeleton } from "@/components/shell/Gate";
import { withBase } from "@/lib/paths";
import { StartScreen } from "../start/StartScreen";

/** Replaying the intro from About: the story plays over the welcome screen, then the URL becomes /start. */
export function IntroRoute() {
  const [open, setOpen] = useState(true);
  const [revealKey, setRevealKey] = useState(0);
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <StartScreen hostsIntro={false} revealKey={revealKey} introRunning={open} />
      </Suspense>
      {open && (
        <IntroOverlay
          onImpact={() => setRevealKey((k) => k + 1)}
          onDone={() => {
            setOpen(false);
            window.history.replaceState(null, "", withBase("/start/"));
            focusMainWhenVisible();
          }}
        />
      )}
    </>
  );
}
