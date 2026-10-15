import type { Metadata } from "next";
import { CheckinPage } from "./CheckinPage";

export const metadata: Metadata = { title: "Check in" };

export default function Page() {
  return <CheckinPage />;
}
