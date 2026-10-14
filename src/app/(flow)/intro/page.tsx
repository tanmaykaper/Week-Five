import type { Metadata } from "next";
import { IntroPlaceholder } from "./IntroPlaceholder";

export const metadata: Metadata = { title: "Before you start" };

export default function IntroPage() {
  return <IntroPlaceholder />;
}
