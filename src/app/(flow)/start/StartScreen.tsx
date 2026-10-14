"use client";

import { Drop, LockSimple } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { focusMainWhenVisible, IntroOverlay } from "@/components/intro/IntroOverlay";
import { usePoolPose } from "@/components/pool/controller";
import { frame, WELCOME_FRAME, WELCOME_STATE } from "@/components/pool/poses";
import { Gate } from "@/components/shell/Gate";
import { Button, ButtonLink, Pair } from "@/components/ui/primitives";
import { skuByCode } from "@/content/skus";
import { setupInProgress } from "@/lib/onboarding";
import { parseStartParams } from "@/lib/params";
import { useApp } from "@/lib/storage/store";
import { parseISODate } from "@/lib/time/journey";

const welcomePose = (aspect: number) => ({ ...frame(WELCOME_FRAME, aspect), ...WELCOME_STATE });

const noop = () => () => {};
/** Read once per page load: the head script marks a first visit before anything renders. */
let firstVisitFlag: boolean | undefined;
const readFirstVisit = () => (firstVisitFlag ??= document.documentElement.dataset.intro === "pending");

/**
 * The welcome screen. On a first visit it also hosts the intro, which plays on the same
 * pool and settles onto this screen. This component only ever renders in the browser
 * (it reads the URL inside a Suspense boundary), so it can read the head script's flag.
 */
export function StartScreen({
  hostsIntro = true,
  revealKey = 0,
  introRunning = false,
}: {
  hostsIntro?: boolean;
  revealKey?: number;
  /** Set when another component (the /intro replay) is playing the intro over this screen. */
  introRunning?: boolean;
}) {
  // The server sent the Suspense fallback, so the flag is read from the client snapshot,
  // not during the first render. The head script's flag (with the hold marker) keeps this
  // screen hidden until the intro mounts.
  const firstVisit = useSyncExternalStore(noop, readFirstVisit, () => false);
  const [closed, setClosed] = useState(false);
  const introOpen = hostsIntro && firstVisit && !closed;
  const [ownRevealKey, setOwnRevealKey] = useState(0);
  const search = useSearchParams();
  const parsed = parseStartParams(search);
  const enterDemo = useApp((s) => s.enterDemo);
  const midway = useApp((s) => s.mode === "real" && setupInProgress(s.data));
  const resumeAt = useApp((s) => s.data.onboarding.step);
  const router = useRouter();

  const playing = introOpen || introRunning;
  // While the intro plays it owns the camera. Afterwards (or on a return visit) the rings
  // spread out once from the middle.
  usePoolPose(playing ? null : welcomePose, playing ? "intro" : "welcome", { enter: { map: 0, ripple: 0.4 }, ms: 1900 });

  const sku = parsed.kind === "ok" ? skuByCode(parsed.params.sku) : undefined;
  const bought =
    parsed.kind === "ok"
      ? parseISODate(parsed.params.reg).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : null;

  return (
    <>
      {introOpen && (
        <IntroOverlay
          onImpact={() => setOwnRevealKey((k) => k + 1)}
          onDone={() => {
            firstVisitFlag = false;
            setClosed(true);
            focusMainWhenVisible();
          }}
        />
      )}
      <Gate needsPlan={false}>
        <section
          key={revealKey + ownRevealKey}
          className="wrap grid min-h-[calc(100dvh-var(--header-h))] content-end pt-[34dvh] pb-[clamp(28px,6dvh,72px)] lg:content-center lg:pt-0 lg:pb-[calc(var(--header-h)+24px)]"
        >
          <div className="max-w-[640px]">
            {parsed.kind === "ok" ? (
              <Pair title="Welcome." turn="Let's set up your plan." className="reveal" style={{ fontSize: "var(--t-hero)", "--i": 0 } as React.CSSProperties} />
            ) : (
              <Pair title="Let's set up" turn="your plan." className="reveal" style={{ fontSize: "var(--t-hero)", "--i": 0 } as React.CSSProperties} />
            )}

            <p className="reveal mt-6 max-w-[42ch] text-lead text-text-2" style={{ "--i": 1 } as React.CSSProperties}>
              {parsed.kind === "ok"
                ? "One question at a time, about two minutes. You can change anything later."
                : parsed.kind === "bad"
                  ? "We couldn't read that code. Pick your products instead, it takes a minute."
                  : "Tell us what you're using and when you started. One question at a time, about two minutes."}
            </p>

            {sku ? (
              <div
                className="reveal mt-7 inline-flex items-center gap-3.5 rounded-2xl bg-surface/80 py-3 pr-5 pl-3.5"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                <span className="grid size-10 place-items-center rounded-full bg-info-bg text-accent" aria-hidden="true">
                  <Drop size={20} weight="fill" />
                </span>
                <span className="grid">
                  <span className="text-sm text-text-2">We read this from your pack</span>
                  <span className="font-medium">{sku.name}</span>
                  <span className="num text-sm text-text-2">
                    Bought {bought}
                    {parsed.kind === "ok" && parsed.params.batch ? `, batch ${parsed.params.batch}` : ""}
                  </span>
                </span>
              </div>
            ) : null}

            <div className="reveal mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
              <ButtonLink href={parsed.kind === "ok" ? `/onboarding/?${search.toString()}` : "/onboarding/"}>
                {midway ? `Carry on from question ${Math.min(resumeAt + 1, 9)}` : "Start setup"}
              </ButtonLink>
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

            <p className="reveal mt-8 flex max-w-[46ch] items-start gap-3 text-sm text-text-2" style={{ "--i": 4 } as React.CSSProperties}>
              <LockSimple size={18} className="mt-px shrink-0 text-ink" aria-hidden="true" />
              <span>
                <span className="font-medium text-ink">Your details and photos stay on this phone.</span> No account,
                nothing sent anywhere. Clear this browser&apos;s data and your plan goes with it, so we&apos;ll remind you
                to export a copy now and then.
              </span>
            </p>
          </div>
        </section>
      </Gate>
    </>
  );
}
