import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Mirror" };

export default function Page() {
  return (
    <Placeholder
      title="Day one and now."
      lead="Your photos side by side, same spot, same light."
      phase={7}
      note="The photo timeline, the compare slider and monthly retakes arrive here."
    />
  );
}
