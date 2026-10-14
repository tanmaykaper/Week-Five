"use client";

import { useRouter } from "next/navigation";
import { TextButton } from "@/components/ui/primitives";

export function ReplayIntro() {
  const router = useRouter();
  return (
    <TextButton
      className="justify-self-start"
      onClick={() => router.push("/intro")}
    >
      Replay the intro
    </TextButton>
  );
}
