"use client";

import { X } from "@phosphor-icons/react/ssr";
import { useEffect, useRef } from "react";
import { CHECKIN } from "@/content/checkin";
import { CheckinForm } from "./CheckinForm";
import { checkinSheet, useCheckinSheet } from "./sheet";

/**
 * The check-in as a modal sheet: native <dialog>, so focus is trapped, Escape closes it and
 * focus goes back to whatever opened it. Tapping outside the sheet closes it too.
 */
export function CheckinDialog() {
  const [open, count] = useCheckinSheet();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="ck-dialog"
      aria-labelledby="ck-title"
      onClose={() => checkinSheet.close()}
      onClick={(e) => {
        if (e.target === ref.current) checkinSheet.close();
      }}
    >
      <div className="ck-sheet">
        <span className="ck-grip" aria-hidden="true" />
        <button type="button" className="ck-close" onClick={() => checkinSheet.close()} aria-label={CHECKIN.close}>
          <X size={18} aria-hidden="true" />
        </button>
        {open ? <CheckinForm key={count} onDone={() => checkinSheet.close()} /> : null}
      </div>
    </dialog>
  );
}
