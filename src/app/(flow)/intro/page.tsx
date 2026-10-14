import type { Metadata } from "next";
import { IntroRoute } from "./IntroRoute";

export const metadata: Metadata = { title: "Before you start" };

export default function IntroPage() {
  return <IntroRoute />;
}
