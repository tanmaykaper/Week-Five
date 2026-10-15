"use client";

import { ArrowClockwise, DeviceMobile, X } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mark } from "@/components/ui/primitives";
import { BASE_PATH } from "@/lib/paths";
import { safeLocal } from "@/lib/storage/keys";
import "./phone-view.css";

/**
 * Phone view: a button on the right edge of every wide screen (shaped like a phone's side
 * button) that lays the same site, live, inside a phone in the middle of an empty white
 * page. It is the real app in an iframe at a phone's width, so every layout rule for phones
 * applies, and it shares this window's data. Closing it brings the big screen to wherever
 * the phone was.
 */

const SIZES = [
  { w: 360, h: 780, label: "360" },
  { w: 390, h: 844, label: "390" },
  { w: 430, h: 932, label: "430" },
] as const;

const BEZEL = 12;
const STATUS = 44;
const HOME = 22;
const SIZE_KEY = "weekfive:phone-size";
const WIDE = 1100;

const isFramed = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const noop = () => () => {};

/** How big the phone can be drawn: beside the caption on wide screens, under it otherwise. */
function fitBox(size: number) {
  const d = SIZES[size]!;
  const wide = window.innerWidth >= WIDE;
  const availW = wide ? window.innerWidth - 2 * 300 : window.innerWidth - 32;
  const availH = wide ? window.innerHeight - 64 : window.innerHeight - 112 - 24;
  const scale = Math.min(1, availW / (d.w + BEZEL * 2), availH / (d.h + BEZEL * 2));
  return { scale: Math.max(0.4, scale), wide };
}

function savedSize(): number {
  const raw = safeLocal.get(SIZE_KEY);
  const n = raw === null ? NaN : Number(raw);
  return Number.isInteger(n) && n >= 0 && n < SIZES.length ? n : 1;
}

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (d: Date) => `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;

/** The first painted background at a point of the phone's page, walking up from what is there. */
function paintAt(doc: Document, x: number, y: number): string | null {
  let el = doc.elementFromPoint(x, y) as HTMLElement | null;
  while (el) {
    const bg = doc.defaultView!.getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
    el = el.parentElement;
  }
  return doc.body ? doc.defaultView!.getComputedStyle(doc.body).backgroundColor : null;
}

function isDark(color: string): boolean {
  const m = color.match(/[\d.]+/g);
  if (!m || m.length < 3) return false;
  const [r, g, b] = m.map(Number) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}

export function PhoneView() {
  // Not on the server, and never inside the phone itself.
  const available = useSyncExternalStore(noop, () => !isFramed(), () => false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [size, setSize] = useState(1);
  const [src, setSrc] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [box, setBox] = useState({ scale: 1, wide: true });
  const [chrome, setChrome] = useState({ top: "#f1f4f7", bottom: "#ffffff", dark: false });
  const [time, setTime] = useState(() => clock(new Date()));
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const device = SIZES[size]!;

  // Keep the phone fitted to the white page while the window changes size.
  useEffect(() => {
    if (!open) return;
    const fit = () => setBox(fitBox(size));
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, size]);

  // The status bar and the home strip take the colours of the page inside, so the glass reads as one screen.
  useEffect(() => {
    if (!open || !loaded) return;
    const read = () => {
      try {
        const doc = frameRef.current?.contentDocument;
        if (!doc?.body) return;
        const w = doc.documentElement.clientWidth;
        const h = doc.documentElement.clientHeight;
        const top = paintAt(doc, w / 2, 2) ?? "#f1f4f7";
        const bottom = paintAt(doc, w / 2, h - 2) ?? top;
        setChrome((c) => (c.top === top && c.bottom === bottom ? c : { top, bottom, dark: isDark(top) }));
      } catch {
        /* the page is mid-navigation */
      }
    };
    read();
    const id = window.setInterval(read, 450);
    return () => window.clearInterval(id);
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setTime(clock(new Date())), 20_000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (open && d && !d.open) {
      d.showModal();
      // The big screen's water stops drawing while it is covered.
      document.documentElement.setAttribute("data-phone-view", "");
    }
  }, [open]);

  const show = () => {
    const s = savedSize();
    setSize(s);
    setBox(fitBox(s));
    setSrc(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    setLoaded(false);
    setClosing(false);
    setTime(clock(new Date()));
    setOpen(true);
  };

  const finish = useCallback(() => {
    // The big screen picks up wherever the phone was.
    let next: string | null = null;
    try {
      const loc = frameRef.current?.contentWindow?.location;
      if (loc) next = `${loc.pathname}${loc.search}${loc.hash}`;
    } catch {
      next = null;
    }
    document.documentElement.removeAttribute("data-phone-view");
    dialogRef.current?.close();
    setOpen(false);
    setClosing(false);
    const here = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next && next !== here && !next.startsWith("about:")) {
      const path = BASE_PATH && next.startsWith(BASE_PATH) ? next.slice(BASE_PATH.length) || "/" : next;
      router.push(path);
    }
    buttonRef.current?.focus();
  }, [router]);

  const hide = useCallback(() => {
    if (closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return finish();
    setClosing(true);
    window.setTimeout(finish, 260);
  }, [closing, finish]);

  const pickSize = (i: number) => {
    setSize(i);
    setBox(fitBox(i));
    safeLocal.set(SIZE_KEY, String(i));
  };

  const reload = () => {
    try {
      setLoaded(false);
      frameRef.current?.contentWindow?.location.reload();
    } catch {
      /* nothing to reload */
    }
  };

  if (!available) return null;

  const outerW = device.w + BEZEL * 2;
  const outerH = device.h + BEZEL * 2;

  return (
    <>
      <button ref={buttonRef} type="button" className="pv-tab" onClick={show} aria-haspopup="dialog" aria-label="Phone view: see this page on a phone">
        <DeviceMobile size={18} weight="regular" aria-hidden="true" />
        <span aria-hidden="true">Phone view</span>
      </button>

      <dialog
        ref={dialogRef}
        className="pv"
        aria-labelledby="pv-title"
        data-wide={box.wide || undefined}
        data-closing={closing || undefined}
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
      >
        {open ? (
          <>
            <div className="pv-caption">
              <h2 id="pv-title" className="pair pv-pair">
                <span>Phone view.</span> <span>The same app, in one hand.</span>
              </h2>
              <p className="pv-note">
                It&apos;s live: tap around. It shares this window&apos;s data, and closing it brings the big screen to wherever the phone was.
              </p>
              <div className="pv-tools">
                <div className="pv-sizes" role="radiogroup" aria-label="Phone width">
                  {SIZES.map((s, i) => (
                    <button key={s.w} type="button" role="radio" aria-checked={size === i} onClick={() => pickSize(i)} className="num">
                      {s.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="pv-icon" onClick={reload} aria-label="Reload the phone">
                  <ArrowClockwise size={18} aria-hidden="true" />
                </button>
              </div>
              <p className="pv-size num" aria-live="polite">
                {device.w} by {device.h}
              </p>
            </div>

            <button type="button" className="pv-close" onClick={hide}>
              <X size={16} weight="bold" aria-hidden="true" />
              Back to full view
            </button>

            <div className="pv-stage">
              <div className="pv-fit" style={{ width: outerW * box.scale, height: outerH * box.scale }}>
                <div
                  className="pv-device"
                  style={{ width: outerW, height: outerH, transform: `scale(${box.scale})` }}
                >
                  <div className="pv-screen" style={{ gridTemplateRows: `${STATUS}px ${device.h - STATUS - HOME}px ${HOME}px` }}>
                    <div className="pv-status" data-dark={chrome.dark || undefined} style={{ background: chrome.top }} aria-hidden="true">
                      <span className="num">{time}</span>
                      <i className="pv-island" />
                      <span className="pv-glyphs">
                        <svg viewBox="0 0 18 12" width="18" height="12">
                          <rect x="0" y="8" width="3" height="4" rx="1" />
                          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                          <rect x="10" y="3" width="3" height="9" rx="1" />
                          <rect x="15" y="0" width="3" height="12" rx="1" />
                        </svg>
                        <svg viewBox="0 0 16 12" width="16" height="12">
                          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .3 10.6 10.6 0 0 0 .7 3.2L2 4.6a8.7 8.7 0 0 1 6-2.4Zm0 3.9c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.2c-1.8 0-3.4.7-4.7 1.8l1.3 1.4C5.5 6.6 6.7 6.1 8 6.1Zm0 3.8c.5 0 1 .2 1.3.5L8 11.8l-1.3-1.4c.3-.3.8-.5 1.3-.5Z" />
                        </svg>
                        <svg viewBox="0 0 27 12" width="27" height="12">
                          <rect x="0.5" y="0.5" width="23" height="11" rx="3.4" fill="none" stroke="currentColor" strokeOpacity="0.4" />
                          <rect x="2.2" y="2.2" width="16.5" height="7.6" rx="2" />
                          <path d="M25.3 4.2v3.6c.7-.3 1.2-1 1.2-1.8s-.5-1.5-1.2-1.8Z" fillOpacity="0.45" />
                        </svg>
                      </span>
                    </div>
                    <div className="pv-view">
                      <iframe
                        ref={frameRef}
                        key={size}
                        src={src}
                        title="Week Five on a phone"
                        width={device.w}
                        height={device.h - STATUS - HOME}
                        onLoad={() => setLoaded(true)}
                        data-loaded={loaded || undefined}
                      />
                      {loaded ? null : (
                        <span className="pv-loading" aria-hidden="true">
                          <Mark className="size-9" />
                        </span>
                      )}
                    </div>
                    <div className="pv-home" data-dark={isDark(chrome.bottom) || undefined} style={{ background: chrome.bottom }} aria-hidden="true">
                      <i />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
