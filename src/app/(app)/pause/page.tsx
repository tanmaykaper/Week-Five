import type { Metadata } from "next";
import { Suspense } from "react";
import { PauseFlow } from "@/components/pause/PauseFlow";

export const metadata: Metadata = { title: "Before you stop" };

export default function Page() {
  return (
    <Suspense>
      <PauseFlow />
    </Suspense>
  );
}
