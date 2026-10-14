"use client";

import { useRouter } from "next/navigation";
import { TextButton } from "@/components/ui/primitives";
import { useApp } from "@/lib/storage/store";

export function ReplayIntro() {
  const update = useApp((s) => s.update);
  const router = useRouter();
  return (
    <TextButton
      className="justify-self-start"
      onClick={() => {
        update((s) => ({ ...s, settings: { ...s.settings, introSeen: false } }));
        router.push("/intro");
      }}
    >
      Replay the intro
    </TextButton>
  );
}
