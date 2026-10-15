"use client";

import { useRouter } from "next/navigation";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { Gate } from "@/components/shell/Gate";

/** The same check-in as the sheet, as a page of its own (for links and for people who prefer it). */
export function CheckinPage() {
  const router = useRouter();
  return (
    <Gate>
      <section className="mx-auto max-w-[560px] pt-[clamp(32px,5vw,72px)]">
        <CheckinForm titleId="checkin-title" onDone={() => router.push("/home")} />
      </section>
    </Gate>
  );
}
