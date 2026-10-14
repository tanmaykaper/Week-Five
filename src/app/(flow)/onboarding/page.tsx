import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shell/Gate";
import { OnboardingStory } from "./OnboardingStory";

export const metadata: Metadata = { title: "Set up your plan" };

// useSearchParams (the pack details and the briefing step) needs a Suspense boundary in a static export.
export default function Page() {
  return (
    <Suspense fallback={<div className="wrap"><PageSkeleton /></div>}>
      <OnboardingStory />
    </Suspense>
  );
}
