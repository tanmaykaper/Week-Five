import type { Metadata } from "next";
import { Suspense } from "react";
import { BaselineFlow } from "./BaselineFlow";

export const metadata: Metadata = { title: "Photos" };

export default function Page() {
  return (
    <Suspense>
      <BaselineFlow />
    </Suspense>
  );
}
