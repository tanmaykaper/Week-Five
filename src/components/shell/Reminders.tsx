"use client";

import { ArrowRight, X } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { checkinSheet } from "@/components/checkin/sheet";
import { letterSheet } from "@/components/letter/sheet";
import { PRODUCT_WORDS } from "@/content/today";
import { activeSlots, isDone, slotItems } from "@/lib/doses";
import { useJourney } from "@/lib/hooks/useJourney";
import { notifyOnce } from "@/lib/notify";
import { normalisePath } from "@/lib/paths";
import { dueItem } from "@/lib/reminders";
import { safeLocal } from "@/lib/storage/keys";
import { photosOfWeek } from "@/lib/storage/photos";
import { useApp } from "@/lib/storage/store";
import { photoWeekDue, toISODate } from "@/lib/time/journey";
import "./reminders.css";

const DISMISS_KEY = "weekfive:banners";
/** Screens where a banner would talk over the moment itself. */
const QUIET_ON = ["/checkin", "/pause", "/mirror/projection"];

function readDismissed(): Record<string, string> {
  try {
    const v = JSON.parse(safeLocal.get(DISMISS_KEY) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/**
 * The in-app side of reminders: one banner for whatever is due (reorder, photos, the note,
 * a missed check-in), and, when notifications are on, the same thing as a notification plus
 * the day's next application while the app stays open. Lives in the app layout.
 */
export function Reminders() {
  const status = useApp((s) => s.status);
  const mode = useApp((s) => s.mode);
  const data = useApp((s) => s.data);
  const { now, day } = useJourney();
  const path = normalisePath(usePathname());
  const [taken, setTaken] = useState<Record<number, boolean>>({});
  // Nothing renders until the store has loaded, so reading storage here can't mismatch the server.
  const [dismissed, setDismissed] = useState<Record<string, string>>(() => (typeof window === "undefined" ? {} : readDismissed()));

  // Whether this photo week's pictures exist (real photos live in IndexedDB).
  const due = day !== null && day >= 1 ? photoWeekDue(day) : null;
  useEffect(() => {
    if (!due || mode !== "real" || status !== "ready") return;
    let live = true;
    photosOfWeek(mode, due)
      .then((r) => live && setTaken((t) => ({ ...t, [due]: Object.keys(r).length > 0 })))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [due, mode, status, data]);

  const item = useMemo(() => {
    if (status !== "ready" || !data.profile || day === null) return null;
    return dueItem(data, now, day, (w) => (mode === "demo" ? null : (taken[w] ?? null)));
  }, [status, data, now, day, mode, taken]);

  const today = toISODate(new Date());
  const actionPath = item && "href" in item.action ? normalisePath(item.action.href.split("?")[0]!.split("#")[0]!) : null;
  const visible = Boolean(item) && !QUIET_ON.some((p) => path.startsWith(p)) && actionPath !== path && dismissed[item!.id] !== today;

  // Notifications: the due item once, then the next application of the day while the app is open.
  const notifyOn = mode === "real" && data.settings.notifications && status === "ready";
  useEffect(() => {
    if (!notifyOn || !item) return;
    void notifyOnce(item.id, "Week Five", item.text, "href" in item.action ? item.action.href : "/home");
  }, [notifyOn, item]);

  useEffect(() => {
    const p = data.profile;
    if (!notifyOn || !p) return;
    const real = new Date();
    const date = toISODate(real);
    const items = slotItems(p.products);
    const next = activeSlots(p.products)
      .map((slot) => {
        const [h, m] = (slot === "am" ? data.routine.morning : data.routine.evening).split(":").map(Number) as [number, number];
        return { slot, at: new Date(real.getFullYear(), real.getMonth(), real.getDate(), h, m) };
      })
      .find((s) => s.at > real && !isDone(data.doses, date, s.slot, real));
    if (!next) return;
    const wait = next.at.getTime() - real.getTime();
    if (wait > 6 * 3_600_000) return;
    const label = next.slot === "am" ? "Morning" : "Evening";
    const id = window.setTimeout(() => {
      void notifyOnce(`slot-${date}-${next.slot}`, `${label}, ${next.at.toTimeString().slice(0, 5)}`, `${items[next.slot].map((i) => PRODUCT_WORDS[i]).join(", ")}. Mark it done on Today.`, "/home");
    }, wait);
    return () => window.clearTimeout(id);
  }, [notifyOn, data.profile, data.routine, data.doses]);

  if (!visible || !item) return null;

  const dismiss = () => {
    const next = { ...readDismissed(), [item.id]: today };
    // Keep the list short: only today's dismissals matter.
    for (const k of Object.keys(next)) if (next[k] !== today) delete next[k];
    safeLocal.set(DISMISS_KEY, JSON.stringify(next));
    setDismissed(next);
  };

  return (
    <div className="rm" data-tone={item.tone} role="status">
      <span className="rm-dot" aria-hidden="true" />
      <p className="rm-text">{item.text}</p>
      {"href" in item.action ? (
        <Link href={item.action.href} className="rm-go">
          <span className="rm-go-label">{item.action.label}</span>
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          className="rm-go"
          onClick={() => ("open" in item.action && item.action.open === "letter" ? letterSheet.open() : checkinSheet.open())}
        >
          <span className="rm-go-label">{item.action.label}</span>
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </button>
      )}
      <button type="button" className="rm-x" onClick={dismiss} aria-label="Hide this until tomorrow">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
