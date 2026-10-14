"use client";

import { useSyncExternalStore } from "react";

/**
 * "Add to home screen". Browsers that support it fire beforeinstallprompt once per page
 * load, often before the screen that wants it has loaded, so AppRuntime starts listening
 * at boot and the screen asks here later. Installing matters for photos: Safari clears
 * storage for sites that aren't opened for a week, unless they're on the home screen.
 */

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function listenForInstall() {
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    emit();
  };
  const onInstalled = () => {
    deferred = null;
    installed = true;
    emit();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

type InstallState = "installed" | "prompt" | "ios" | "manual";

function read(): InstallState {
  if (installed || window.matchMedia("(display-mode: standalone)").matches) return "installed";
  if (deferred) return "prompt";
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return "ios";
  return "manual";
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

export function useInstall(): { state: InstallState; install: () => Promise<void> } {
  const state = useSyncExternalStore(subscribe, read, () => "manual" as const);
  return {
    state,
    install: async () => {
      const e = deferred;
      if (!e) return;
      await e.prompt();
      const choice = await e.userChoice.catch(() => null);
      deferred = null;
      if (choice?.outcome === "accepted") installed = true;
      emit();
    },
  };
}
