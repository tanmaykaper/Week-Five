import type { Metadata } from "next";
import { PageHead } from "@/components/ui/primitives";
import { SKUS } from "@/content/skus";

export const metadata: Metadata = { title: "Dev QR codes" };

/** Dev only (the .dev.tsx extension keeps it out of production builds). Phase 3 renders real QR codes. */
export default function DevQrPage() {
  return (
    <main className="wrap py-16">
      <PageHead title="Dev QR codes." lead="Fictional pack codes. Scan from a phone on the same network to test the welcome screen." />
      <ul className="mt-10 max-w-2xl border-t border-line">
        {SKUS.map((s) => (
          <li key={s.code} className="flex min-h-[60px] items-center justify-between gap-4 border-b border-line py-2">
            <span className="font-medium">{s.name}</span>
            <code className="text-sm text-text-2">{`/start?sku=${s.code}&reg=2026-10-01&batch=B1`}</code>
          </li>
        ))}
      </ul>
    </main>
  );
}
