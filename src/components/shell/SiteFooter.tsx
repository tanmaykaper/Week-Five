import { LockSimple } from "@phosphor-icons/react/ssr";
import Link from "next/link";

/** The close of every app page: the three promises, then the name at full width. */
export function SiteFooter() {
  return (
    <footer className="relative mt-[var(--section)] overflow-hidden bg-sunk pb-40 md:pb-32">
      <div className="wrap grid gap-2 pt-14 text-sm text-text-2">
        <p className="flex items-center gap-2 text-ink">
          <LockSimple size={16} aria-hidden="true" />
          Your details and photos stay on this device.
        </p>
        <p>Not medical advice. Follow your pack leaflet and your doctor.</p>
        <p>
          An independent concept for the Mosaic Fellowship Builder Challenge. Not made or endorsed by Man Matters.{" "}
          <Link href="/about" className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
            About this app
          </Link>
        </p>
      </div>
      <p
        aria-hidden="true"
        className="wrap mt-16 text-[clamp(4.5rem,17vw,16rem)] leading-[0.8] font-medium tracking-[-0.06em] text-ink/[0.08] select-none"
      >
        Week Five
      </p>
    </footer>
  );
}
