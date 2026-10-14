import type { Metadata } from "next";
import { TodayPreview } from "./TodayPreview";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return <TodayPreview />;
}
