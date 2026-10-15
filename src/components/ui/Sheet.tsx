"use client";

import { X } from "@phosphor-icons/react/ssr";
import { useEffect, useRef, type ReactNode } from "react";
import "./sheet.css";

/**
 * A modal sheet on a native <dialog>: focus is trapped, Escape closes it, focus returns to
 * whatever opened it, and tapping outside closes it too. Content mounts only while open,
 * so each opening starts fresh.
 */
export function Sheet({
  open,
  onClose,
  labelledBy,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  closeLabel?: string;
  children: ReactNode;
}) {
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
      className="sheet"
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="sheet-body">
        <span className="sheet-grip" aria-hidden="true" />
        <button type="button" className="sheet-close" onClick={onClose} aria-label={closeLabel}>
          <X size={18} aria-hidden="true" />
        </button>
        {open ? children : null}
      </div>
    </dialog>
  );
}
