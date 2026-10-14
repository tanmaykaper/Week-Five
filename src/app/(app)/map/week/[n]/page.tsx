import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Upcoming } from "@/components/shell/Gate";
import { PageHead, TextLink } from "@/components/ui/primitives";
import { phasePhrase, TOTAL_WEEKS } from "@/lib/time/journey";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => ({ n: String(i + 1) }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return { title: `Week ${n}` };
}

export default async function WeekPage({ params }: Props) {
  const week = Number((await params).n);
  if (!Number.isInteger(week) || week < 1 || week > TOTAL_WEEKS) notFound();
  // The middle day of the week decides its phrase.
  const phrase = phasePhrase(week * 7 - 3);

  return (
    <section className="pt-[clamp(40px,6vw,88px)]">
      <PageHead kicker="Your 24 weeks" title={`Week ${week}`} lead={`${phrase[0]!.toUpperCase()}${phrase.slice(1)}.`} />
      <nav aria-label="Weeks" className="reveal mt-8 flex gap-6" style={{ "--i": 3 } as React.CSSProperties}>
        {week > 1 ? <TextLink href={`/map/week/${week - 1}`}>Week {week - 1}</TextLink> : null}
        {week < TOTAL_WEEKS ? <TextLink href={`/map/week/${week + 1}`}>Week {week + 1}</TextLink> : null}
      </nav>
      <Upcoming phase={6}>What commonly happens, what to do, what is not a reason to worry, and when to see a doctor.</Upcoming>
    </section>
  );
}
