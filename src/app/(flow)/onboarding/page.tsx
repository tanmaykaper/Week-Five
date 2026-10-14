import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Set up your plan" };

export default function Page() {
  return (
    <Placeholder
      title="Let's set up your plan."
      lead="One question at a time. About two minutes."
      phase={3}
      note="The nine-step setup story and the briefing arrive here."
      needsPlan={false}
    />
  );
}
