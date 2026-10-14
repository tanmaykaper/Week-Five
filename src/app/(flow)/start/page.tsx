import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shell/Gate";
import "@/components/intro/intro.css";
import { StartScreen } from "./StartScreen";

export const metadata: Metadata = { title: "Welcome" };

// useSearchParams needs a Suspense boundary in a static export. The cover is static HTML:
// on a first visit the head script shows it before any JavaScript runs, so the welcome
// screen never flashes before the intro.
export default function StartPage() {
  return (
    <>
      <div className="intro-cover" aria-hidden="true" />
      <Suspense fallback={<PageSkeleton />}>
        <StartScreen />
      </Suspense>
    </>
  );
}
