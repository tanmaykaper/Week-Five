import type { Metadata } from "next";
import { BaselineFlow } from "./BaselineFlow";

export const metadata: Metadata = { title: "Day-one photos" };

export default function Page() {
  return <BaselineFlow />;
}
