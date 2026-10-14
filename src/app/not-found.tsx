import { SiteHeader } from "@/components/shell/SiteHeader";
import { ButtonLink, PageHead } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <>
      <SiteHeader minimal />
      <main id="main" className="wrap pt-[clamp(40px,6vw,88px)] pb-24">
        <PageHead title="This page isn't on the map." lead="The link may be old, or mistyped. Your plan is fine." />
        <div className="mt-8">
          <ButtonLink href="/">Back to today</ButtonLink>
        </div>
      </main>
    </>
  );
}
