import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shell/Gate";
import "@/components/intro/intro.css";
import { StartScreen } from "./StartScreen";

export const metadata: Metadata = { title: "Welcome" };

// useSearchParams needs a Suspense boundary in a static export. The style block is static
// HTML: on a first visit the head script's flag plus this rule keep the welcome screen
// hidden before any JavaScript runs, so it never flashes before the intro. It only exists
// while /start is on screen.
const HOLD = `html[data-intro="pending"] #main, html[data-intro="pending"] #flow-header { visibility: hidden; }`;

export default function StartPage() {
  return (
    <>
      <style>{HOLD}</style>
      <Suspense fallback={<PageSkeleton />}>
        <StartScreen />
      </Suspense>
    </>
  );
}
