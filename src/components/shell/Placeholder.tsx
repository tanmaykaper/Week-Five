"use client";

import type { ReactNode } from "react";
import { PageHead } from "@/components/ui/primitives";
import { Gate, Upcoming } from "./Gate";

export function Placeholder({
  title,
  lead,
  phase,
  note,
  needsPlan = true,
  children,
}: {
  title: string;
  lead?: string;
  phase: number;
  note: string;
  needsPlan?: boolean;
  children?: ReactNode;
}) {
  return (
    <Gate needsPlan={needsPlan}>
      <section className="pt-[clamp(40px,6vw,88px)]">
        <PageHead title={title} lead={lead} />
        {children}
        <Upcoming phase={phase}>{note}</Upcoming>
      </section>
    </Gate>
  );
}
