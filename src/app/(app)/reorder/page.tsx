import type { Metadata } from "next";
import { ReorderScreen } from "@/components/reorder/ReorderScreen";

export const metadata: Metadata = { title: "Supply", description: "How much of your pack is left, when to reorder, and the reminders to come." };

export default function Page() {
  return <ReorderScreen />;
}
