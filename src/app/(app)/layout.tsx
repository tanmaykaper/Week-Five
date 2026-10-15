import { LetterDialog } from "@/components/letter/Letter";
import { CheckinBar } from "@/components/shell/CheckinBar";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { TabBar } from "@/components/shell/TabBar";

/** Everything after setup: header nav, floating check-in bar, phone tab bar. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-[-48px] left-3 z-50 rounded-md bg-ink px-3.5 py-2.5 font-medium text-bg focus:top-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="wrap">
        {children}
      </main>
      <SiteFooter />
      <CheckinBar />
      <LetterDialog />
      <TabBar />
    </>
  );
}
