import { SiteHeader } from "@/components/shell/SiteHeader";

/** Intro, QR welcome, onboarding and baseline: no navigation, nothing to wander off to. */
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader minimal />
      <main id="main" tabIndex={-1} className="wrap pb-24 outline-none">
        {children}
      </main>
    </>
  );
}
