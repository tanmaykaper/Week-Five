"use client";

import { LockSimple } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { Gate, Upcoming } from "@/components/shell/Gate";
import { Button, ButtonLink, curl, PageHead } from "@/components/ui/primitives";
import { skuByCode } from "@/content/skus";
import { parseStartParams } from "@/lib/params";
import { useApp } from "@/lib/storage/store";

/**
 * The welcome screen. On a first visit it also hosts the intro, which plays on top and
 * opens onto this screen. This component only ever renders in the browser (it reads the
 * URL inside a Suspense boundary), so it can read the head script's first-visit flag.
 */
export function StartScreen({
  hostsIntro = true,
  revealKey = 0,
}: {
  hostsIntro?: boolean;
  revealKey?: number;
}) {
  const [introOpen, setIntroOpen] = useState(
    () =>
      hostsIntro && typeof document !== "undefined" && document.documentElement.dataset.intro === "pending",
  );
  const [ownRevealKey, setOwnRevealKey] = useState(0);
  const search = useSearchParams();
  const parsed = parseStartParams(search);
  const enterDemo = useApp((s) => s.enterDemo);
  const router = useRouter();

  const title = parsed.kind === "ok" ? "Welcome. Let's set up your plan." : "Let's set up your plan.";
  const lead =
    parsed.kind === "ok"
      ? `We read this from your pack: ${skuByCode(parsed.params.sku)?.name}. You can change it in a minute.`
      : parsed.kind === "bad"
        ? "We couldn't read that code. Pick your products instead."
        : "Tell us what you're using and when you started.";

  return (
    <>
      {introOpen && (
        <IntroOverlay
          onImpact={() => setOwnRevealKey((k) => k + 1)}
          onDone={() => {
            setIntroOpen(false);
            document.getElementById("main")?.focus({ preventScroll: true });
          }}
        />
      )}
      <Gate needsPlan={false}>
        <section key={revealKey + ownRevealKey} className="pt-[clamp(40px,6vw,88px)]">
          <PageHead title={title} lead={lead} />

          <div
            className="reveal mt-12 max-w-2xl border-t border-line pt-8"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <p className="flex items-start gap-3 font-serif text-[clamp(1.6rem,1.3rem+1.2vw,2.25rem)] leading-[1.15]">
              <LockSimple size={22} className="mt-2 shrink-0 text-accent" aria-hidden="true" />
              {curl("Your details and photos stay on this phone.")}
            </p>
            <p className="mt-4 max-w-[52ch] text-text-2">
              No account, no sign-up, nothing sent anywhere. If you clear this browser&apos;s data, your plan
              goes with it, so we&apos;ll remind you to export a copy now and then.
            </p>
          </div>

          <div
            className="reveal mt-10 flex flex-wrap items-center gap-3"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <ButtonLink href="/onboarding">Start setup</ButtonLink>
            <Button
              variant="quiet"
              onClick={() => {
                enterDemo("steady");
                router.push("/home");
              }}
            >
              Try it with sample data
            </Button>
          </div>
          <Upcoming phase={3}>The pack details read here carry into the nine-step setup.</Upcoming>
        </section>
      </Gate>
    </>
  );
}
