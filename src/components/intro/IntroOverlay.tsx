"use client";

import { ArrowDown } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Mark } from "@/components/ui/primitives";
import { INTRO_BEATS } from "@/content/intro";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useApp } from "@/lib/storage/store";
import { Dropper, TIP_Y } from "./Dropper";
import "./intro.css";

type Gsap = typeof import("gsap").gsap;

/** Each beat owns an equal slice of the first 90 percent of the scroll; the last slice releases the drop. */
const SEG = 0.15;
/** Where each beat sits fully on screen, used by the keyboard and the Next button. */
const BEAT_CENTRES = INTRO_BEATS.map((_, i) => i * SEG + SEG / 2);
const RELEASE_AT = 0.97;

/**
 * The first-visit story. Scroll (or swipe, or the arrow keys) drives a dropper through
 * six sentences; the last drop falls, and its ripple opens onto the welcome screen
 * underneath. Under reduced motion it becomes a calm, auto-advancing sequence.
 */
export function IntroOverlay({ onImpact, onDone }: { onImpact?: () => void; onDone: () => void }) {
  const markIntroSeen = useApp((s) => s.markIntroSeen);
  const router = useRouter();
  const headingId = useId();

  const reduced = useReducedMotion();
  const [loadFailed, setLoadFailed] = useState(false);
  const mode: "scroll" | "calm" = reduced || loadFailed ? "calm" : "scroll";
  const [beat, setBeat] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [paused, setPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const dropperRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement[]>([]);
  const beatsRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const bulbRef = useRef<SVGGElement>(null);
  const liquidRef = useRef<SVGGElement>(null);
  const gsapRef = useRef<Gsap | null>(null);
  const released = useRef(false);

  const finish = useCallback(() => {
    markIntroSeen();
    onDone();
  }, [markIntroSeen, onDone]);

  /** Fade out without ceremony: Skip, or reduced motion's last step. */
  const leave = useCallback(() => {
    if (released.current) return;
    released.current = true;
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onImpact?.();
      finish();
      return;
    }
    root.classList.add("is-leaving");
    onImpact?.();
    window.setTimeout(finish, 230);
  }, [finish, onImpact]);

  /** The drop falls, hits the surface, and the ripple opens a window onto the page below. */
  const release = useCallback(() => {
    const gsap = gsapRef.current;
    const root = rootRef.current;
    const art = artRef.current;
    const dropper = dropperRef.current;
    const surface = surfaceRef.current;
    const drop = dropRef.current;
    if (released.current) return;
    if (!gsap || !root || !art || !dropper || !surface || !drop) return leave();
    released.current = true;
    scrollerRef.current?.style.setProperty("overflow", "hidden");

    const tipX = dropper.offsetLeft + dropper.offsetWidth / 2;
    const tipY = dropper.offsetTop + dropper.offsetHeight * TIP_Y;
    const surfaceY = surface.offsetTop;
    const box = art.getBoundingClientRect();
    const ix = box.left + tipX;
    const iy = box.top + surfaceY;
    const radius = Math.hypot(Math.max(ix, window.innerWidth - ix), Math.max(iy, window.innerHeight - iy)) + 48;
    root.style.setProperty("--x", `${ix}px`);
    root.style.setProperty("--y", `${iy}px`);
    root.style.setProperty("--r", "0px");

    const fall = surfaceY - tipY - drop.offsetHeight;
    gsap
      .timeline({ onComplete: finish })
      .to([beatsRef.current, footRef.current], { opacity: 0, y: -10, duration: 0.35, ease: "power2.out" }, 0)
      .to(drop, { scale: 1, scaleY: 1.15, duration: 0.18, ease: "power1.out" }, 0)
      .to(drop, { y: fall, scaleY: 1.25, duration: 0.55, ease: "power2.in" }, 0.18)
      .to(drop, { scaleX: 1.7, scaleY: 0.2, opacity: 0, transformOrigin: "50% 100%", duration: 0.14, ease: "power2.out" }, 0.73)
      .add(() => {
        root.classList.add("is-revealing");
        onImpact?.();
      }, 0.73)
      .fromTo(
        ringsRef.current,
        { scale: 0.2, opacity: 0.9 },
        { scale: (i: number) => 5 + i * 3.5, opacity: 0, duration: 1.1, ease: "power2.out", stagger: 0.12 },
        0.73,
      )
      .to(root, { "--r": `${radius}px`, duration: 0.95, ease: "power2.inOut" }, 0.82);
  }, [finish, leave, onImpact]);

  // Lock the page behind, take focus, keep everything else out of reach while open.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    // The overlay lives inside the page, so walk up to <body> and make every other branch inert.
    const others: HTMLElement[] = [];
    for (let node: HTMLElement = root; node.parentElement && node !== document.body; node = node.parentElement) {
      for (const sib of Array.from(node.parentElement.children) as HTMLElement[]) {
        if (sib !== node && !sib.inert && sib.tagName !== "SCRIPT") others.push(sib);
      }
    }
    others.forEach((el) => (el.inert = true));
    // The overlay now covers the page itself, so the first-paint cover can go. Otherwise
    // the ripple would open onto the cover instead of the welcome screen.
    delete html.dataset.intro;
    scrollerRef.current?.focus({ preventScroll: true });
    router.prefetch("/onboarding");
    router.prefetch("/home");
    return () => {
      html.style.overflow = previous;
      others.forEach((el) => (el.inert = false));
    };
  }, [router]);

  // Choose the path and, for the scroll path, build the scrubbed timeline.
  useEffect(() => {
    if (mode !== "scroll") return;
    let cancelled = false;
    let cleanup = () => {};
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        gsapRef.current = gsap;
        const scroller = scrollerRef.current!;
        const beats = Array.from(beatsRef.current!.children) as HTMLElement[];
        const drop = dropRef.current!;
        const dropper = dropperRef.current!;
        const surface = surfaceRef.current!;

        const place = () => {
          drop.style.left = `${dropper.offsetLeft + dropper.offsetWidth / 2}px`;
          drop.style.top = `${dropper.offsetTop + dropper.offsetHeight * TIP_Y - 1}px`;
          const x = `${dropper.offsetLeft + dropper.offsetWidth / 2}px`;
          const y = `${surface.offsetTop}px`;
          ringsRef.current.forEach((ring) => {
            ring.style.left = x;
            ring.style.top = y;
          });
        };
        place();

        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.to(dropper, { rotate: 0, ease: "power2.inOut", duration: 0.14 }, 0.0)
          .to(bulbRef.current, { scaleX: 0.84, scaleY: 0.95, svgOrigin: "60 92", duration: 0.05, ease: "power2.inOut" }, 0.17)
          .to(bulbRef.current, { scaleX: 1, scaleY: 1, svgOrigin: "60 92", duration: 0.05, ease: "power2.out" }, 0.23)
          .to(liquidRef.current, { y: 34, duration: 0.12, ease: "power1.inOut" }, 0.31)
          .to(liquidRef.current, { y: 68, duration: 0.12, ease: "power1.inOut" }, 0.46)
          .to(bulbRef.current, { scaleX: 0.8, scaleY: 0.94, svgOrigin: "60 92", duration: 0.06, ease: "power2.inOut" }, 0.62)
          .to(liquidRef.current, { y: 78, duration: 0.06 }, 0.62)
          .to(drop, { scale: 0.75, duration: 0.08, ease: "power2.out" }, 0.64)
          .to(surface, { opacity: 1, duration: 0.06 }, 0.76)
          .to(drop, { scale: 1, scaleY: 1.12, duration: 0.1, ease: "power1.inOut" }, 0.77);
        beats.forEach((el, i) => {
          const start = i * SEG;
          if (i > 0) tl.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.035, ease: "power2.out" }, start + 0.01);
          if (i < beats.length - 1) tl.to(el, { opacity: 0, y: -12, duration: 0.03, ease: "power2.in" }, start + SEG - 0.035);
        });
        tl.set({}, {}, 1);

        let lastBeat = -1;
        const st = ScrollTrigger.create({
          trigger: trackRef.current,
          scroller,
          start: "top top",
          end: "bottom bottom",
          animation: tl,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: place,
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            const b = Math.min(INTRO_BEATS.length - 1, Math.floor(self.progress / SEG));
            if (b !== lastBeat) {
              lastBeat = b;
              setBeat(b);
            }
            setAtEnd(self.progress > 0.8);
            if (self.progress >= RELEASE_AT) release();
          },
        });
        cleanup = () => {
          st.kill();
          tl.kill();
        };
      } catch {
        // If the animation library can't load, the calm path still tells the story.
        if (!cancelled) setLoadFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [mode, release]);

  // Reduced motion: advance every 3.5 s unless paused.
  useEffect(() => {
    if (mode !== "calm" || paused || beat >= INTRO_BEATS.length - 1) return;
    const id = window.setTimeout(() => setBeat((b) => b + 1), 3500);
    return () => window.clearTimeout(id);
  }, [mode, paused, beat]);

  const scrollToProgress = useCallback((p: number) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const max = track.offsetHeight - scroller.clientHeight;
    scroller.scrollTo({ top: Math.max(0, Math.min(max, p * max)), behavior: "smooth" });
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (mode === "calm") {
        if (dir === 1 && beat >= INTRO_BEATS.length - 1) return leave();
        setBeat((b) => Math.max(0, Math.min(INTRO_BEATS.length - 1, b + dir)));
        return;
      }
      if (dir === 1 && beat >= INTRO_BEATS.length - 1) return release();
      scrollToProgress(BEAT_CENTRES[Math.max(0, Math.min(INTRO_BEATS.length - 1, beat + dir))]!);
    },
    [mode, beat, leave, release, scrollToProgress],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (["ArrowDown", "PageDown", " ", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      step(1);
    } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter" && beat >= INTRO_BEATS.length - 1) {
      e.preventDefault();
      if (mode === "calm") leave();
      else release();
    }
  };

  const last = beat >= INTRO_BEATS.length - 1;

  return (
    <div ref={rootRef} className="intro" data-mode={mode} role="dialog" aria-modal="true" aria-labelledby={headingId}>
      <div ref={scrollerRef} className="intro-scroller" tabIndex={-1} onKeyDown={onKeyDown}>
        <div ref={trackRef} className="intro-track">
          <div className="intro-stage">
            <div ref={artRef} className="intro-art" aria-hidden="true">
              <div ref={dropperRef} className="intro-dropper">
                <Dropper bulbRef={bulbRef} liquidRef={liquidRef} liquidOffset={mode === "calm" ? 40 : 0} />
              </div>
              <div ref={surfaceRef} className="intro-surface" style={mode === "calm" ? { opacity: 1 } : undefined} />
              <div ref={dropRef} className="intro-drop">
                <svg viewBox="0 0 12 16" width="12" height="16">
                  <path d="M6 0.5C4.4 3.6 1.5 6.4 1.5 10a4.5 4.5 0 0 0 9 0C10.5 6.4 7.6 3.6 6 0.5z" fill="var(--intro-accent)" />
                </svg>
              </div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="intro-ring"
                  ref={(el) => {
                    if (el) ringsRef.current[i] = el;
                  }}
                />
              ))}
            </div>

            <div ref={beatsRef} className="intro-beats" aria-hidden="true">
              {INTRO_BEATS.map((text, i) => (
                <p
                  key={text}
                  className="intro-beat"
                  style={mode === "calm" ? { opacity: i === beat ? 1 : 0, transition: "opacity 300ms var(--ease-settle)" } : undefined}
                >
                  {text.replace(/'/g, "’")}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="intro-top">
        <span className="inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.01em]">
          <Mark className="size-[26px] [&_path:first-child]:fill-[var(--intro-line)]" />
          Week Five
        </span>
        <button type="button" className="intro-skip" onClick={leave}>
          Skip intro
        </button>
      </div>

      <div ref={footRef} className="intro-foot">
        {mode === "calm" ? (
          <div className="intro-calm-controls">
            {!last && (
              <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                {paused ? "Play" : "Pause"}
              </button>
            )}
            {last ? (
              <button type="button" className="intro-cta" onClick={leave}>
                Let&apos;s set up your plan
              </button>
            ) : (
              <button type="button" onClick={() => step(1)}>
                Next
              </button>
            )}
          </div>
        ) : atEnd ? (
          <button type="button" className="intro-cta" onClick={release}>
            Let&apos;s set up your plan
          </button>
        ) : (
          <p className="intro-hint" aria-hidden="true">
            <ArrowDown size={16} />
            {beat === 0 ? "Scroll to begin" : "Keep scrolling"}
          </p>
        )}
        <div className="intro-progress" aria-hidden="true">
          <i
            ref={progressRef}
            style={mode === "calm" ? { transform: `scaleX(${(beat + 1) / INTRO_BEATS.length})` } : undefined}
          />
        </div>
      </div>

      {/* The whole story for screen readers, without the animation. */}
      <div className="sr-only">
        <h1 id={headingId}>Before you start, six things worth knowing.</h1>
        <ol>
          {INTRO_BEATS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <p>Use Skip intro, or press Enter at the end, to set up your plan.</p>
      </div>
    </div>
  );
}
