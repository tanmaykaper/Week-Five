"use client";

import { ArrowDown } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { poolController, usePool } from "@/components/pool/controller";
import type { PoolEngine } from "@/components/pool/engine";
import { DOT_ANGLE, LABEL_ANGLE, LABEL_ANGLE_PHONE, onRing, SHED_WEEKS } from "@/components/pool/geometry";
import { BASE_STATE, frame, INTRO_FRAMES, landscapeness, WELCOME_FRAME, WELCOME_STATE } from "@/components/pool/poses";
import { Mark, curl } from "@/components/ui/primitives";
import { INTRO_BEATS, INTRO_FINAL, INTRO_FINAL_NOTE, INTRO_LABELS } from "@/content/intro";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useApp } from "@/lib/storage/store";
import "./intro.css";

type Gsap = typeof import("gsap").gsap;
type Timeline = ReturnType<Gsap["timeline"]>;

/** Each beat owns an equal slice of the first 84 percent of the scroll; the rest is the way out. */
/**
 * Moves focus to the page once it is really visible. The page behind the intro is hidden
 * with `visibility`, which (like every property) gets a 1 ms transition under reduced
 * motion, so focusing in the same frame would land nowhere.
 */
export function focusMainWhenVisible(tries = 12) {
  const main = document.getElementById("main");
  if (!main) return;
  if (getComputedStyle(main).visibility === "visible" || tries <= 0) {
    main.focus({ preventScroll: true });
    return;
  }
  requestAnimationFrame(() => focusMainWhenVisible(tries - 1));
}

const SEG = 0.14;
const BEAT_CENTRES = INTRO_BEATS.map((_, i) => i * SEG + SEG / 2);
/** Where the calm path cuts to: each beat's settled pose, after its camera move has finished. */
const CALM_AT = [0.07, 0.24, 0.4, 0.535, 0.695, 0.83];
const END_AT = INTRO_BEATS.length * SEG;
const RELEASE_AT = 0.985;
const TICKS = 24;

/**
 * The first-visit story, told on the pool. Scroll (or swipe, or the arrow keys) moves the
 * camera around a glass dropper while six two-line beats pass: the bulb squeezes, a drop
 * forms and falls, its ripple spreads into the 24 week rings, and other people's drops
 * land around it. At the end the camera settles on the welcome screen underneath.
 * Under reduced motion it becomes a calm, auto-advancing sequence with cuts, not travel.
 */
export function IntroOverlay({ onImpact, onDone }: { onImpact?: () => void; onDone: () => void }) {
  const markIntroSeen = useApp((s) => s.markIntroSeen);
  const router = useRouter();
  const headingId = useId();
  const pool = usePool();

  const reduced = useReducedMotion();
  const [loadFailed, setLoadFailed] = useState(false);
  const mode: "scroll" | "calm" = reduced || loadFailed ? "calm" : "scroll";
  const [beat, setBeat] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [paused, setPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<Gsap | null>(null);
  const tlRef = useRef<Timeline | null>(null);
  const released = useRef(false);
  const lastTick = useRef(-1);

  const finish = useCallback(() => {
    markIntroSeen();
    onDone();
  }, [markIntroSeen, onDone]);

  const reveal = useCallback(() => {
    delete document.documentElement.dataset.intro;
    onImpact?.();
  }, [onImpact]);

  /** Out without ceremony: Skip, or reduced motion's last step. */
  const leave = useCallback(() => {
    if (released.current) return;
    released.current = true;
    tlRef.current?.scrollTrigger?.kill();
    const root = rootRef.current;
    const engine = poolController.get();
    if (engine) void engine.to({ ...frame(WELCOME_FRAME, engine.aspect), ...WELCOME_STATE }, 1000);
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      finish();
      return;
    }
    root.classList.add("is-leaving");
    reveal();
    window.setTimeout(finish, 260);
  }, [finish, reveal]);

  /** The way out at the end: the camera settles over the rings and the welcome screen rises under it. */
  const release = useCallback(() => {
    const gsap = gsapRef.current;
    const engine = poolController.get();
    if (released.current) return;
    if (!gsap) return leave();
    released.current = true;
    tlRef.current?.scrollTrigger?.kill();
    scrollerRef.current?.style.setProperty("overflow", "hidden");

    const out = gsap.timeline({ onComplete: finish });
    out.to([beatsRef.current, footRef.current, labelsRef.current], { opacity: 0, y: -14, duration: 0.5, ease: "power2.out" }, 0);
    if (engine) {
      const { camX, camY, camZ, tx, ty, tz, fov, shiftX, shiftY } = frame(WELCOME_FRAME, engine.aspect);
      out
        .to(engine.rig, { camX, camY, camZ, tx, ty, tz, fov, shiftX, shiftY, duration: 1.7, ease: "power3.inOut" }, 0)
        .to(engine.state, { ...WELCOME_STATE, duration: 1.3, ease: "power2.inOut" }, 0);
    }
    out.add(reveal, engine ? 0.55 : 0.3);
  }, [finish, leave, reveal]);

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
    // The page behind stays hidden until the camera settles on it.
    html.dataset.intro = "open";
    scrollerRef.current?.focus({ preventScroll: true });
    router.prefetch("/onboarding");
    router.prefetch("/home");
    return () => {
      html.style.overflow = previous;
      others.forEach((el) => (el.inert = false));
      if (html.dataset.intro === "open") delete html.dataset.intro;
    };
  }, [router]);

  // Labels on the rings, placed where they read best for the screen's shape.
  const placeLabels = useCallback((engine: PoolEngine) => {
    const box = labelsRef.current;
    if (!box) return;
    const l = landscapeness(engine.aspect);
    const angle = LABEL_ANGLE_PHONE + (LABEL_ANGLE - LABEL_ANGLE_PHONE) * l;
    const el = (name: string) => box.querySelector<HTMLElement>(`[data-label="${name}"]`)!;
    engine.setLabels([
      { el: el("start"), at: onRing(1, angle) },
      { el: el("shed"), at: onRing((SHED_WEEKS[0] + SHED_WEEKS[1]) / 2, angle), weight: () => engine.state.shed },
      // Phones have no room beside the stacked labels; the amber dots speak for themselves there.
      { el: el("photos"), at: onRing(12, DOT_ANGLE), weight: () => (l > 0.5 ? engine.state.dots : 0) },
      { el: el("hairs"), at: onRing(13, angle) },
      { el: el("verdict"), at: onRing(24, angle) },
    ]);
  }, []);

  // Build the story: one timeline on the camera, the scene and the words.
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        gsapRef.current = gsap;
        const scroller = scrollerRef.current!;
        const engine = poolController.get();

        const build = () => {
          const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
          if (engine) {
            const a = engine.aspect;
            const F = Object.fromEntries(Object.entries(INTRO_FRAMES).map(([k, f]) => [k, frame(f, a)])) as Record<
              keyof typeof INTRO_FRAMES,
              ReturnType<typeof frame>
            >;
            engine.claim();
            engine.set({ ...F.hero, ...BASE_STATE });
            placeLabels(engine);
            const R = engine.rig;
            const S = engine.state;
            tl
              // 1. The roots: the dropper turns upright.
              .to(R, { ...F.upright, duration: 0.15, ease: "power2.inOut" }, 0)
              .to(S, { tilt: 0, spin: 0.25, duration: 0.14, ease: "power2.inOut" }, 0)
              // 2. The shed: a squeeze, the level drops.
              .to(S, { squeeze: 1, duration: 0.04, ease: "power2.inOut" }, 0.17)
              .to(S, { squeeze: 0, duration: 0.05, ease: "power2.out" }, 0.215)
              .to(S, { level: 0.48, duration: 0.07, ease: "power1.inOut" }, 0.18)
              .to(S, { spin: -0.2, duration: 0.12 }, 0.15)
              // 3. Six months: close on the tip, a drop forms.
              .to(R, { ...F.tip, duration: 0.13, ease: "power2.inOut" }, 0.27)
              .to(S, { squeeze: 0.85, duration: 0.05, ease: "power2.inOut" }, 0.33)
              .to(S, { level: 0.4, duration: 0.05 }, 0.33)
              .to(S, { drop: 0.7, duration: 0.07, ease: "power2.out" }, 0.34)
              // 4. The photo: the drop swells, lets go, and the water takes it.
              .to(S, { drop: 1, squeeze: 1, duration: 0.03, ease: "power1.inOut" }, 0.42)
              .to(R, { ...F.fall, duration: 0.09, ease: "power2.inOut" }, 0.44)
              .to(S, { fall: 1, duration: 0.05, ease: "power2.in" }, 0.455)
              .to(S, { squeeze: 0.2, duration: 0.04 }, 0.46)
              .to(S, { ripple: 1.1, duration: 0.07 }, 0.505)
              // 5. The map: the camera climbs, the ripple freezes into 24 rings.
              .to(S, { dY: 14, duration: 0.1, ease: "power2.in" }, 0.53)
              .to(R, { ...F.map, duration: 0.13, ease: "power2.inOut" }, 0.55)
              .to(S, { ripple: 4.2, duration: 0.19 }, 0.575)
              .to(S, { map: 1, duration: 0.11, ease: "power1.out" }, 0.53)
              .to(S, { shed: 1, duration: 0.04 }, 0.63)
              .to(S, { dots: 1, duration: 0.04 }, 0.62)
              .to(S, { labels: 1, duration: 0.035 }, 0.6)
              // 6. Not alone: other drops land around yours.
              .to(R, { ...F.cohort, duration: 0.13, ease: "power1.inOut" }, 0.7)
              .to(S, { labels: 0.45, duration: 0.03 }, 0.72)
              .to(S, { cohort: 1, duration: 0.13 }, 0.71)
              // The way out: settle above the rings.
              .to(R, { ...F.end, duration: 0.12, ease: "power2.inOut" }, END_AT)
              .to(S, { labels: 0, duration: 0.04 }, END_AT);
          }
          if (mode === "scroll") {
            const beats = Array.from(beatsRef.current!.children) as HTMLElement[];
            beats.forEach((el, i) => {
              const parts = Array.from(el.children) as HTMLElement[];
              const start = i * SEG;
              if (i > 0) tl.fromTo(parts, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.03, stagger: 0.008, ease: "power2.out" }, start + 0.008);
              tl.to(parts, { opacity: 0, y: -20, duration: 0.025, stagger: 0.005, ease: "power2.in" }, start + SEG - 0.03);
            });
          }
          tl.set({}, {}, 1);
          return tl;
        };

        let tl = build();
        tlRef.current = tl;

        if (mode === "calm") {
          tl.progress(CALM_AT[0]!);
          const off = poolController.onResize(() => {
            const p = tl.progress();
            tl.kill();
            tl = build();
            tl.progress(p);
            tlRef.current = tl;
          });
          cleanup = () => {
            off();
            tl.kill();
          };
          return;
        }

        let lastBeat = -1;
        const onUpdate = (self: { progress: number }) => {
          const p = self.progress;
          const tick = Math.min(TICKS, Math.round(p * TICKS));
          if (tick !== lastTick.current && ticksRef.current) {
            lastTick.current = tick;
            ticksRef.current.style.setProperty("--on", String(tick));
            Array.from(ticksRef.current.children).forEach((t, i) => t.toggleAttribute("data-on", i < tick));
          }
          const b = Math.min(INTRO_BEATS.length - 1, Math.floor(p / SEG));
          if (b !== lastBeat) {
            lastBeat = b;
            setBeat(b);
          }
          setAtEnd(p > END_AT);
          if (p >= RELEASE_AT) release();
        };
        let st = ScrollTrigger.create({
          trigger: trackRef.current,
          scroller,
          start: "top top",
          end: "bottom bottom",
          animation: tl,
          scrub: 0.6,
          onUpdate,
        });
        // A new screen shape means new framings: rebuild at the same place.
        const off = poolController.onResize(() => {
          if (released.current) return;
          st.kill();
          tl.kill();
          tl = build();
          tlRef.current = tl;
          st = ScrollTrigger.create({
            trigger: trackRef.current,
            scroller,
            start: "top top",
            end: "bottom bottom",
            animation: tl,
            scrub: 0.6,
            onUpdate,
          });
        });
        cleanup = () => {
          off();
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
  }, [mode, pool, release, placeLabels]);

  // Calm path: cut to each beat's pose; advance every 4 s unless paused.
  useEffect(() => {
    if (mode !== "calm") return;
    tlRef.current?.progress(CALM_AT[beat]!);
    if (paused || beat >= INTRO_BEATS.length - 1) return;
    const id = window.setTimeout(() => setBeat((b) => b + 1), 4000);
    return () => window.clearTimeout(id);
  }, [mode, paused, beat]);

  const scrollToProgress = useCallback((p: number) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const max = track.offsetHeight - scroller.clientHeight;
    scroller.scrollTo({ top: Math.max(0, Math.min(max, p * max)), behavior: "smooth" });
  }, []);

  const last = beat >= INTRO_BEATS.length - 1;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (mode === "calm") {
        if (dir === 1 && last) return leave();
        setBeat((b) => Math.max(0, Math.min(INTRO_BEATS.length - 1, b + dir)));
        return;
      }
      if (dir === 1 && atEnd) return release();
      if (dir === 1 && last) return scrollToProgress(END_AT + 0.06);
      scrollToProgress(BEAT_CENTRES[Math.max(0, Math.min(INTRO_BEATS.length - 1, beat + dir))]!);
    },
    [mode, beat, last, atEnd, leave, release, scrollToProgress],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (["ArrowDown", "PageDown", " ", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      step(1);
    } else if (["ArrowUp", "PageUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter" && (atEnd || (mode === "calm" && last))) {
      e.preventDefault();
      if (mode === "calm") leave();
      else release();
    }
  };

  const ending = mode === "scroll" ? atEnd : last;

  return (
    <div ref={rootRef} className="intro theme-light" data-mode={mode} role="dialog" aria-modal="true" aria-labelledby={headingId}>
      <div ref={scrollerRef} className="intro-scroller" tabIndex={-1} onKeyDown={onKeyDown}>
        <div ref={trackRef} className="intro-track">
          <div className="intro-stage">
            <div ref={beatsRef} className="intro-beats" aria-hidden="true">
              {INTRO_BEATS.map((b, i) => (
                <div
                  key={b.title}
                  className="intro-beat"
                  data-on={mode === "calm" ? i === beat || undefined : undefined}
                >
                  <p className="intro-line">{curl(b.title)}</p>
                  <p className="intro-line intro-turn">{curl(b.turn)}</p>
                  <p className="intro-note">{curl(b.note)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={labelsRef} className="intro-labels" aria-hidden="true">
        <div className="pool-label" data-label="start">
          <span>{INTRO_LABELS.start}</span>
        </div>
        <div className="pool-label" data-label="shed" data-tone="accent">
          <span>{INTRO_LABELS.shed}</span>
        </div>
        <div className="pool-label" data-label="photos" data-tone="amber">
          <span>{INTRO_LABELS.photos}</span>
        </div>
        <div className="pool-label" data-label="hairs">
          <span>{INTRO_LABELS.hairs}</span>
        </div>
        <div className="pool-label" data-label="verdict">
          <span>{INTRO_LABELS.verdict}</span>
        </div>
      </div>

      <div className="intro-top">
        <span className="inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em]">
          <Mark />
          Week Five
        </span>
        <button type="button" className="intro-skip" onClick={leave}>
          Skip intro
        </button>
      </div>

      <div ref={footRef} className="intro-foot" data-ending={ending || undefined}>
        <div className="intro-final" aria-hidden={!ending}>
          <p className="intro-final-title">{curl(INTRO_FINAL)}</p>
          <p className="intro-final-note">{INTRO_FINAL_NOTE}</p>
        </div>
        <div className="intro-hud">
          <p className="intro-chapter" aria-hidden="true">
            {ending ? "Your plan" : INTRO_BEATS[beat]!.chapter}
          </p>
          <div
            ref={ticksRef}
            className="intro-ticks"
            aria-hidden="true"
            style={mode === "calm" ? ({ "--on": Math.round(((beat + 1) / INTRO_BEATS.length) * TICKS) } as React.CSSProperties) : undefined}
          >
            {Array.from({ length: TICKS }, (_, i) => (
              <i key={i} data-on={mode === "calm" && i < ((beat + 1) / INTRO_BEATS.length) * TICKS ? true : undefined} />
            ))}
          </div>
          <div className="intro-actions">
            {mode === "calm" && !last ? (
              <>
                <button type="button" className="intro-quiet" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
                  {paused ? "Play" : "Pause"}
                </button>
                <button type="button" className="intro-quiet" onClick={() => step(1)}>
                  Next
                </button>
              </>
            ) : ending ? (
              <button type="button" className="intro-cta" onClick={mode === "calm" ? leave : release}>
                Let&apos;s set up your plan
              </button>
            ) : (
              <p className="intro-hint" aria-hidden="true">
                <ArrowDown size={16} />
                {beat === 0 ? "Scroll to begin" : "Keep scrolling"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* The whole story for screen readers, without the animation. */}
      <div className="sr-only">
        <h1 id={headingId}>Before you start, six things worth knowing.</h1>
        <ol>
          {INTRO_BEATS.map((b) => (
            <li key={b.title}>
              {b.title} {b.turn} {b.note}
            </li>
          ))}
        </ol>
        <p>Use Skip intro, or press Enter at the end, to set up your plan.</p>
      </div>
    </div>
  );
}
