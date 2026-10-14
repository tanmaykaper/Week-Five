import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Map" };

export default function Page() {
  return (
    <Placeholder
      title="Your 24 weeks."
      lead="What commonly happens each week, where you are, and where the shed window sits."
      phase={6}
      note="The full strip, the season band, the week list and your letter arrive here."
    />
  );
}
