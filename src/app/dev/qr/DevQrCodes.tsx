"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/ui/primitives";
import { SKUS } from "@/content/skus";
import { withBase } from "@/lib/paths";
import { toISODate } from "@/lib/time/journey";

/**
 * QR codes for every fictional pack, pointing at this machine. Open this page through
 * the computer's network address (not localhost) and a phone on the same Wi-Fi can scan
 * them. The camera needs HTTPS: run `pnpm dev:https` for that part.
 */
export function DevQrCodes() {
  const [origin, setOrigin] = useState("");
  const [reg, setReg] = useState(() => toISODate(new Date()));
  const [batch, setBatch] = useState("B2291");
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Read after mount: the page is prerendered without a window.
    const id = window.setTimeout(() => setOrigin(window.location.origin), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!origin) return;
    let cancelled = false;
    (async () => {
      const QR = await import("qrcode");
      const entries = await Promise.all(
        SKUS.map(async (s) => {
          const url = `${origin}${withBase("/start/")}?sku=${s.code}&reg=${reg}${batch ? `&batch=${encodeURIComponent(batch)}` : ""}`;
          const svg = await QR.toString(url, { type: "svg", margin: 1, color: { dark: "#0f1e33", light: "#ffffff" } });
          return [s.code, svg] as const;
        }),
      );
      if (!cancelled) setCodes(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [origin, reg, batch]);

  const local = origin.includes("localhost") || origin.includes("127.0.0.1");

  return (
    <>
      <PageHead
        title="Dev QR codes."
        lead="Fictional pack codes. Scan from a phone on the same network to test the welcome screen."
      />
      <p className="mt-6 text-sm text-text-2">
        Origin: <span className="font-medium text-ink">{origin || "reading"}</span>
        {local ? ". A phone can't reach localhost; open this page through your computer's network address instead." : null}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Bought on
          <input type="date" value={reg} onChange={(e) => setReg(e.target.value)} className="h-11 rounded-xl bg-surface px-3" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Batch
          <input value={batch} maxLength={32} onChange={(e) => setBatch(e.target.value.replace(/[^A-Za-z0-9-]/g, ""))} className="h-11 rounded-xl bg-surface px-3" />
        </label>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKUS.map((s) => (
          <li key={s.code} className="grid gap-3 rounded-2xl bg-surface p-5">
            <div
              className="aspect-square w-full max-w-[220px] [&_svg]:h-full [&_svg]:w-full"
              aria-label={`QR code for ${s.name}`}
              role="img"
              dangerouslySetInnerHTML={{ __html: codes[s.code] ?? "" }}
            />
            <span className="font-medium">{s.name}</span>
            <code className="text-xs break-all text-text-2">{`/start?sku=${s.code}&reg=${reg}`}</code>
          </li>
        ))}
      </ul>
    </>
  );
}
