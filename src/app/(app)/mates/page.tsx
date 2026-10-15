import type { Metadata } from "next";
import { MatesScreen } from "@/components/mates/MatesScreen";

export const metadata: Metadata = { title: "Mates", description: "People who started when you did. A simulated demo community: no rankings, no photos, no results." };

export default function Page() {
  return <MatesScreen />;
}
