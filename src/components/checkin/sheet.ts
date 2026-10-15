"use client";

import { useSyncExternalStore } from "react";

/** Whether the check-in sheet is open. The bar opens it; Today's note can too. */
let open = false;
let opened = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const checkinSheet = {
  open() {
    if (open) return;
    open = true;
    opened++;
    emit();
  },
  close() {
    if (!open) return;
    open = false;
    emit();
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

/** [is it open, how many times it has opened] (the count gives each opening a fresh form). */
export function useCheckinSheet(): [boolean, number] {
  const isOpen = useSyncExternalStore(subscribe, () => open, () => false);
  const count = useSyncExternalStore(subscribe, () => opened, () => 0);
  return [isOpen, count];
}
