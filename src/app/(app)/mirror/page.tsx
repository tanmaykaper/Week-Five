import type { Metadata } from "next";
import { Suspense } from "react";
import { MirrorScreen } from "@/components/mirror/MirrorScreen";

export const metadata: Metadata = { title: "Mirror" };

export default function Page() {
  return (
    <Suspense>
      <MirrorScreen />
    </Suspense>
  );
}
