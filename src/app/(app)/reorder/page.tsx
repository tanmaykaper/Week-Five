import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Supply" };

export default function Page() {
  return (
    <Placeholder
      title="Supply."
      lead="How many days of product you have left, and a reminder before you run out."
      phase={8}
      note="The runway, reminders and the calendar file arrive here."
    />
  );
}
