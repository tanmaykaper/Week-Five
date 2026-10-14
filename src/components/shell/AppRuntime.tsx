"use client";

import { useEffect } from "react";
import { MODE_KEY, STATE_KEY, THEME_KEY } from "@/lib/storage/keys";
import { resolveTheme, useApp } from "@/lib/storage/store";
import { listenForInstall } from "@/lib/install";
import { withBase } from "@/lib/paths";

/**
 * Invisible. Loads saved data once, keeps other tabs in sync, follows the system
 * theme when the user hasn't picked one, catches the install prompt, and registers the offline service worker
 * in production builds.
 */
export function AppRuntime() {
  useEffect(() => {
    useApp.getState().hydrate();
    const stopInstall = listenForInstall();

    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === MODE_KEY || e.key === STATE_KEY.real || e.key === STATE_KEY.demo || e.key === THEME_KEY) {
        useApp.getState().hydrate();
        document.documentElement.dataset.theme = resolveTheme(useApp.getState().theme);
      }
    };
    window.addEventListener("storage", onStorage);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (useApp.getState().theme === "system") document.documentElement.dataset.theme = resolveTheme("system");
    };
    media.addEventListener("change", onScheme);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register(withBase("/sw.js"), { scope: withBase("/") }).catch(() => {
        /* Offline support is a bonus; the app works without it. */
      });
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      media.removeEventListener("change", onScheme);
      stopInstall();
    };
  }, []);

  return null;
}
