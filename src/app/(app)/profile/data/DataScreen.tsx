"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gate } from "@/components/shell/Gate";
import { Button, PageHead } from "@/components/ui/primitives";
import { buildExport, exportFileName, saveBlob } from "@/lib/storage/export";
import { useApp } from "@/lib/storage/store";

export function DataScreen() {
  const mode = useApp((s) => s.mode);
  const data = useApp((s) => s.data);
  const deleteEverything = useApp((s) => s.deleteEverything);
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onExport() {
    try {
      saveBlob(await buildExport(mode, data), exportFileName());
      setStatus("Export saved to your downloads.");
    } catch {
      setStatus("The export didn't finish. Try again, or free up some space on this device.");
    }
  }

  async function onDelete() {
    await deleteEverything();
    setStatus("Everything is deleted.");
    router.push("/");
  }

  return (
    <Gate needsPlan={false}>
      <section className="pt-[clamp(40px,6vw,88px)]">
        <PageHead title="Your data." lead="Everything stays on this device. Nothing was ever sent anywhere, so this is the only copy." />

        <div className="reveal mt-12 grid max-w-[760px] gap-10" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="border-t border-line pt-6">
            <h2 className="text-title font-semibold">Export a copy</h2>
            <p className="mt-2 max-w-[52ch] text-text-2">
              One file with your plan, check-ins, letter and photos. Keep it somewhere safe in case this browser clears its
              storage.
            </p>
            <Button className="mt-5" onClick={onExport}>
              Export a copy
            </Button>
          </div>

          <div className="border-t border-line pt-6">
            <h2 className="text-title font-semibold">Delete everything</h2>
            <p className="mt-2 max-w-[52ch] text-text-2">
              Your plan, check-ins and photos will be gone from this device. This can&apos;t be undone.
              {mode === "demo" ? " This also removes the sample data." : ""}
            </p>
            {confirming ? (
              <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label="Confirm delete">
                <Button variant="danger" onClick={onDelete}>
                  Delete everything
                </Button>
                <Button variant="quiet" onClick={() => setConfirming(false)}>
                  Keep my data
                </Button>
              </div>
            ) : (
              <Button variant="danger-quiet" className="mt-5" onClick={() => setConfirming(true)}>
                Delete everything
              </Button>
            )}
          </div>

          <p role="status" aria-live="polite" className="min-h-6 text-sm text-text-2">
            {status}
          </p>
        </div>
      </section>
    </Gate>
  );
}
