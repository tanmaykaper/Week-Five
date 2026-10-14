import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Check in" };

export default function Page() {
  return (
    <Placeholder
      title="How is your scalp today?"
      lead="Thirty seconds. Hair fall, worry, anything unusual."
      phase={5}
      note="The check-in form and its responses arrive here."
    />
  );
}
