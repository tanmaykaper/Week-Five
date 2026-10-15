"use client";

import { ArrowUp, Drop } from "@phosphor-icons/react/ssr";
import { usePathname } from "next/navigation";
import { CheckinDialog } from "@/components/checkin/CheckinDialog";
import { checkinSheet } from "@/components/checkin/sheet";
import { normalisePath } from "@/lib/paths";
import { useApp } from "@/lib/storage/store";

const HIDDEN_ON = ["/checkin", "/pause", "/mirror/projection"];

/**
 * The main way in: a calm message-style bar that floats at the bottom of every screen and
 * opens the check-in as a sheet. With no check-ins yet, it pulses once to say it's there.
 */
export function CheckinBar() {
  const path = normalisePath(usePathname());
  const fresh = useApp((s) => s.status === "ready" && s.data.profile !== null && s.data.checkins.length === 0);
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => checkinSheet.open()}
        aria-label="Check in: how is your scalp today?"
        aria-haspopup="dialog"
        data-fresh={fresh || undefined}
        className="checkin-bar group fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-20 flex h-14 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 items-center gap-3 rounded-full bg-surface pr-2 pl-5 text-left shadow-float transition-transform duration-200 ease-settle hover:-translate-y-0.5 max-md:bottom-[calc(var(--tabs-h)+12px+env(safe-area-inset-bottom))]"
      >
        <Drop size={20} className="text-accent" aria-hidden="true" />
        <span className="flex-1 text-[0.9375rem] text-text-2">How is your scalp today?</span>
        <span className="grid size-10 place-items-center rounded-full bg-action text-on-action transition-colors duration-150 group-hover:bg-action-hover" aria-hidden="true">
          <ArrowUp size={18} weight="bold" />
        </span>
      </button>
      <CheckinDialog />
    </>
  );
}
