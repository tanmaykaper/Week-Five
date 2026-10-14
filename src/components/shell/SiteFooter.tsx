import { LockSimple } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="wrap mt-[var(--section)] pb-48 md:pb-40">
      <div className="grid gap-2 border-t border-line pt-10 text-sm text-text-3">
        <p className="flex items-center gap-2 text-text-2">
          <LockSimple size={16} aria-hidden="true" />
          Your details and photos stay on this device.
        </p>
        <p>Not medical advice. Follow your pack leaflet and your doctor.</p>
        <p>
          An independent concept for the Mosaic Fellowship Builder Challenge. Not made or endorsed by Man Matters.{" "}
          <Link href="/about" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
            About this app
          </Link>
        </p>
      </div>
    </footer>
  );
}
