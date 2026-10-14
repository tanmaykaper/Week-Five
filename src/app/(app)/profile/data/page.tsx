import type { Metadata } from "next";
import { DataScreen } from "./DataScreen";

export const metadata: Metadata = { title: "Your data" };

export default function DataPage() {
  return <DataScreen />;
}
