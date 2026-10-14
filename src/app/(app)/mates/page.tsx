import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Mates" };

export default function Page() {
  return (
    <Placeholder
      title="People who started when you did."
      lead="A small, simulated community. No rankings, no photos, no comparing results."
      phase={9}
      note="The demo community feed, nudges and invites arrive here."
    />
  );
}
