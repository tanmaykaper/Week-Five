import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shell/Gate";
import { StartScreen } from "./StartScreen";

export const metadata: Metadata = { title: "Welcome" };

// useSearchParams needs a Suspense boundary in a static export.
export default function StartPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StartScreen />
    </Suspense>
  );
}
