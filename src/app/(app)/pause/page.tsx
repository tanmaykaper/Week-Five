import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Before you stop" };

export default function Page() {
  return (
    <Placeholder
      title="Thinking of stopping?"
      lead="Look at three things first: your day-one photo, where you are on the map, and the note you wrote."
      phase={6}
      note="The four-step stop flow arrives here."
    />
  );
}
