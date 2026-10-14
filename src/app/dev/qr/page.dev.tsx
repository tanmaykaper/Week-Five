import type { Metadata } from "next";
import { DevQrCodes } from "./DevQrCodes";

export const metadata: Metadata = { title: "Dev QR codes" };

/** Dev only (the .dev.tsx extension keeps it out of production builds). */
export default function DevQrPage() {
  return (
    <main className="wrap py-16">
      <DevQrCodes />
    </main>
  );
}
