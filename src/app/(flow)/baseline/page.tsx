import type { Metadata } from "next";
import { Placeholder } from "@/components/shell/Placeholder";

export const metadata: Metadata = { title: "Day-one photos" };

export default function Page() {
  return (
    <Placeholder
      title="Three photos, two minutes."
      lead="Same spot, same time of day, every month. A window in daylight is perfect."
      phase={4}
      note="Guided camera capture, the light meter and the area painter arrive here."
      needsPlan={false}
    />
  );
}
