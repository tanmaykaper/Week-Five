import { safeLocal } from "@/lib/storage/keys";
import { withBase } from "@/lib/paths";

/**
 * Notifications (BUILD_DOC F17). Permission is asked only after someone switches them on.
 * They fire while the app or the installed app is open; true scheduled push needs a server,
 * which this app doesn't have on purpose. Each reminder notifies once per device.
 */

export type NotifyState = "unsupported" | "default" | "granted" | "denied";

export function notifyState(): NotifyState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function askToNotify(): Promise<NotifyState> {
  if (notifyState() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return notifyState();
  }
}

const NOTIFIED_KEY = "weekfive:notified";

function notified(): string[] {
  try {
    const v = JSON.parse(safeLocal.get(NOTIFIED_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Shows a notification once for this id. Through the service worker when there is one, so a tap can open the page. */
export async function notifyOnce(id: string, title: string, body: string, href: string): Promise<boolean> {
  if (notifyState() !== "granted") return false;
  const seen = notified();
  if (seen.includes(id)) return false;
  safeLocal.set(NOTIFIED_KEY, JSON.stringify([...seen, id].slice(-80)));
  const options: NotificationOptions = { body, tag: id, icon: withBase("/icons/icon-192.png"), data: { href: withBase(href) } };
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      window.location.assign(withBase(href));
    };
    return true;
  } catch {
    return false;
  }
}
