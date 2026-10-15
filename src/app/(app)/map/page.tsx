import type { Metadata } from "next";
import { MapScreen } from "@/components/map/MapScreen";

export const metadata: Metadata = { title: "Map" };

export default function Page() {
  return <MapScreen />;
}
