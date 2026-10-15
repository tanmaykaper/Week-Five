import type { Metadata } from "next";
import { TodayScreen } from "./TodayScreen";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return <TodayScreen />;
}
