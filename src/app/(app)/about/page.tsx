import type { Metadata } from "next";
import { PageHead } from "@/components/ui/primitives";
import { REFERENCES } from "@/content/references";
import { ReplayIntro } from "./ReplayIntro";

export const metadata: Metadata = {
  title: "About",
  description: "Why Week Five exists, what Mosaic could test with its own data, and the research behind it.",
};

function Block({ title, children, i }: { title: string; children: React.ReactNode; i: number }) {
  return (
    <section className="reveal border-t border-line pt-8" style={{ "--i": i } as React.CSSProperties}>
      <h2 className="text-title font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 text-text-2 [&_strong]:font-medium [&_strong]:text-ink">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <article className="pt-[clamp(40px,6vw,88px)]">
      <PageHead
        title="Why this exists."
        lead="Most people who start minoxidil and stop do it between weeks three and seven, exactly when shedding is expected. Nobody prepares them for it, and they can't see their own progress. This app gives them a map of what's normal and a mirror that shows how far they've come."
      />

      <div className="mt-14 grid max-w-[720px] gap-12">
        <Block title="Where the idea came from" i={3}>
          <p>
            Eleven conversations with real customers. Nine of them stopped or came close, all between weeks three and seven.
            Most saw a shed nobody warned them about, and most kept no photo to compare against. The one person who never
            wavered had been told to expect the shed and to photograph his scalp every month under the same light.{" "}
            <strong>Same product, same shed, different first conversation.</strong>
          </p>
          <p>
            Rainy-season starters had it worse, because seasonal hair fall lands on top of the treatment shed. People who
            bought on a ten-minute delivery app had it worst of all: they skip the assessment and the doctor, the only two
            places where expectations get set.
          </p>
        </Block>

        <Block title="Two things Mosaic could test with its own data" i={4}>
          <ol className="grid list-decimal gap-3 pl-5">
            <li>
              Customers whose first minoxidil order falls between June and September reorder at month two less often than
              those who start between November and February.
            </li>
            <li>
              First-time minoxidil buyers on quick commerce reorder less often than those who came through the hair
              assessment.
            </li>
          </ol>
          <p>If both hold, the cliff is real, it is seasonal, and it is sharpest where nobody briefs the customer.</p>
        </Block>

        <Block title="Your data" i={5}>
          <p>
            There is no account and no server. Your details and photos are stored in this browser on this device and are
            never uploaded. There is no analytics. You can export a copy or delete everything from You, Your data.
          </p>
        </Block>

        <Block title="Not medical advice" i={6}>
          <p>
            Week Five is not a medical device and does not diagnose anything. It never suggests a dose. Follow your pack
            leaflet and your doctor. If something feels wrong, such as pain, a rash, dizziness or swelling, see a doctor.
          </p>
        </Block>

        <Block title="An independent concept" i={7}>
          <p>
            Built for the Mosaic Fellowship Builder Challenge. Not made, reviewed or endorsed by Man Matters or Mosaic
            Wellness. No brand logos or product photography are used. Everyone in the demo is fictional.
          </p>
          <ReplayIntro />
        </Block>

        <Block title="Sources" i={8}>
          <ol className="grid list-decimal gap-2.5 pl-5 text-sm">
            {REFERENCES.map((r) => (
              <li key={r.key}>{r.citation}</li>
            ))}
          </ol>
        </Block>
      </div>
    </article>
  );
}
