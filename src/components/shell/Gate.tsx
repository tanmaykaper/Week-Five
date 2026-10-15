"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button, ButtonLink, PageHead } from "@/components/ui/primitives";
import { useApp } from "@/lib/storage/store";

/**
 * Device data only exists in the browser, so every data-driven screen waits for the
 * store to load. Screens that need a plan show a calm empty state instead of breaking.
 */
export function Gate({ children, needsPlan = true }: { children: ReactNode; needsPlan?: boolean }) {
  const status = useApp((s) => s.status);
  const hasPlan = useApp((s) => s.data.profile !== null);
  if (status !== "ready") return <PageSkeleton />;
  if (needsPlan && !hasPlan) return <NoPlan />;
  return <>{children}</>;
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="pt-[clamp(40px,6vw,88px)]">
      <div className="h-4 w-40 rounded-sm bg-sunk motion-safe:animate-pulse" />
      <div className="mt-5 h-16 w-[min(520px,90%)] rounded-md bg-sunk motion-safe:animate-pulse" />
      <div className="mt-5 h-5 w-[min(380px,70%)] rounded-sm bg-sunk motion-safe:animate-pulse" />
    </div>
  );
}

function NoPlan() {
  const enterDemo = useApp((s) => s.enterDemo);
  const router = useRouter();
  return (
    <section className="pt-[clamp(40px,6vw,88px)]">
      <PageHead
        title="Your plan isn't set up yet."
        lead="It takes about two minutes. No account, and everything stays on this device."
      />
      <div className="reveal mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
        <ButtonLink href="/start">Start setup</ButtonLink>
        <Button
          variant="quiet"
          onClick={() => {
            enterDemo("steady");
            router.refresh();
          }}
        >
          Try it with sample data
        </Button>
      </div>
    </section>
  );
}
