import { ArrowLeft, CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeekPose } from "@/components/map/WeekPose";
import { ButtonLink, curl, Pair } from "@/components/ui/primitives";
import { WEEK } from "@/content/journey";
import { citationFor } from "@/content/references";
import { weekText } from "@/content/weeks";
import { TOTAL_WEEKS } from "@/lib/time/journey";
import "@/components/map/map.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => ({ n: String(i + 1) }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const t = weekText(Number(n));
  return { title: `Week ${n}`, description: t ? `${t.turn} ${t.line}` : undefined };
}

/**
 * What to expect in week n (BUILD_DOC F7). The words are static; the camera on the pool
 * and the "this is your week" tags come from the device.
 */
export default async function WeekPage({ params }: Props) {
  const week = Number((await params).n);
  if (!Number.isInteger(week) || week < 1 || week > TOTAL_WEEKS) notFound();
  const t = weekText(week);
  const sources = t.refs.map(citationFor).filter((c): c is string => Boolean(c));

  return (
    <div className="wk">
      <section className="wk-hero" aria-labelledby="wk-title">
        <div className="wk-words">
          <Link href="/map" className="wk-back reveal" style={{ "--i": 0 } as React.CSSProperties}>
            <ArrowLeft size={16} aria-hidden="true" />
            {WEEK.back}
          </Link>
          <Pair id="wk-title" title={`Week ${week}.`} turn={t.turn} className="wk-pair reveal" style={{ "--i": 1 } as React.CSSProperties} />
          <WeekPose week={week} />
        </div>
      </section>

      <div className="wk-sheet">
        <div className="wrap">
          <div className="wk-col">
            <section className="wk-sec">
              <h2>{WEEK.happens}</h2>
              <p>{curl(t.happens)}</p>
            </section>
            <section className="wk-sec">
              <h2>{WEEK.todo}</h2>
              <p>{curl(t.todo)}</p>
            </section>
            <section className="wk-sec">
              <h2>{WEEK.notWorry}</h2>
              <p>{curl(t.notWorry)}</p>
            </section>
            <section className="wk-sec" data-tone="doctor">
              <h2>{WEEK.doctor}</h2>
              <p>{curl(t.doctor)}</p>
            </section>
            {sources.length ? (
              <section className="wk-sec">
                <h2>{WEEK.sources}</h2>
                <ol className="wk-sources">
                  {sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </section>
            ) : null}
            <nav className="wk-nav" aria-label="Weeks">
              {week > 1 ? (
                <ButtonLink variant="quiet" href={`/map/week/${week - 1}`}>
                  <CaretLeft size={16} aria-hidden="true" />
                  Week {week - 1}
                </ButtonLink>
              ) : (
                <span />
              )}
              {week < TOTAL_WEEKS ? (
                <ButtonLink variant="quiet" href={`/map/week/${week + 1}`}>
                  Week {week + 1}
                  <CaretRight size={16} aria-hidden="true" />
                </ButtonLink>
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
