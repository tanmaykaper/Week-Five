import type { Metadata } from "next";
import { ProjectionScreen } from "@/components/mirror/ProjectionScreen";

export const metadata: Metadata = { title: "What week 24 can look like" };

export default function Page() {
  return <ProjectionScreen />;
}
