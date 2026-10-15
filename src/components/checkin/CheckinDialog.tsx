"use client";

import { Sheet } from "@/components/ui/Sheet";
import { CHECKIN } from "@/content/checkin";
import { CheckinForm } from "./CheckinForm";
import { checkinSheet, useCheckinSheet } from "./sheet";

/** The check-in as a modal sheet, opened by the bar at the bottom or by Today's note. */
export function CheckinDialog() {
  const [open, count] = useCheckinSheet();
  return (
    <Sheet open={open} onClose={() => checkinSheet.close()} labelledBy="ck-title" closeLabel={CHECKIN.close}>
      <CheckinForm key={count} onDone={() => checkinSheet.close()} />
    </Sheet>
  );
}
