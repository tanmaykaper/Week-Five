import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "What week 24 can look like" };

export default function Page() {
  return (
    <Placeholder
      title="What week 24 can look like."
      lead="An illustration of a typical outcome, not a promise."
      phase={7}
      note="The on-device illustration and its thinking state arrive here."
    />
  );
}
