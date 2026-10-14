import { PoolStage } from "@/components/pool/PoolStage";
import { SiteHeader } from "@/components/shell/SiteHeader";

/**
 * Intro, QR welcome, setup and baseline: no navigation, nothing to wander off to. They all
 * sit on the same pool, which stays mounted between them so the camera can travel.
 * Always light: the pool is water in daylight.
 */
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-light relative min-h-dvh bg-bg text-ink">
      <PoolStage />
      <SiteHeader minimal id="flow-header" />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        {children}
      </main>
    </div>
  );
}
