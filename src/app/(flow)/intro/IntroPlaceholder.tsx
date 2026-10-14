"use client";

import { useRouter } from "next/navigation";
import { Upcoming } from "@/components/shell/Gate";
import { Button, PageHead } from "@/components/ui/primitives";
import { INTRO_BEATS } from "@/content/intro";
import { useApp } from "@/lib/storage/store";

/** Phase 1 stand-in for the scroll story: the same six sentences, readable and skippable. */
export function IntroPlaceholder() {
  const update = useApp((s) => s.update);
  const router = useRouter();
  const finish = () => {
    update((s) => ({ ...s, settings: { ...s.settings, introSeen: true } }));
    router.push("/start");
  };

  return (
    <section className="pt-[clamp(40px,6vw,88px)]">
      <PageHead title="Before you start, six things worth knowing." />
      <ol className="mt-10 grid max-w-2xl gap-0 border-t border-line">
        {INTRO_BEATS.map((beat, i) => (
          <li
            key={beat}
            className="reveal flex gap-5 border-b border-line py-5 text-statement"
            style={{ "--i": i + 2 } as React.CSSProperties}
          >
            <span className="num w-6 shrink-0 pt-1 text-sm text-text-3">{i + 1}</span>
            {beat}
          </li>
        ))}
      </ol>
      <div className="reveal mt-10" style={{ "--i": 8 } as React.CSSProperties}>
        <Button onClick={finish}>Let&apos;s set up your plan</Button>
      </div>
      <Upcoming phase={2}>These six lines become the scroll-driven dropper story.</Upcoming>
    </section>
  );
}
