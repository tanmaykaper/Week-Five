"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the letter sheet is open. It lives in the app layout, not inside the button
 * that opens it, because reading the note changes the screen that held the button.
 */
let open = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const letterSheet = {
  open() {
    open = true;
    emit();
  },
  close() {
    open = false;
    emit();
  },
};

export function useLetterSheet(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    () => open,
    () => false,
  );
}
