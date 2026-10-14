"use client";

import { useEffect, useRef, useState } from "react";
import { sampleLuminance } from "@/lib/camera";

export type Facing = "user" | "environment";
export type CameraStatus = "starting" | "live" | "denied" | "unavailable";

const supported = () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

/**
 * The live camera for the lens. Asks for `facing` (a preference, so laptops with one
 * webcam still work), stops every track when the view changes or the screen goes away,
 * and reports denial separately from "this browser has no camera", since the copy differs.
 */
export function useCamera(facing: Facing) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<{ facing: Facing; status: CameraStatus; mirrored: boolean; canFlip: boolean } | null>(null);

  useEffect(() => {
    if (!supported()) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    const shown = videoRef.current;
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
      })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          await video.play().catch(() => {});
        }
        // A laptop webcam reports no facing mode; it faces the user, so the preview is mirrored like one.
        const settings = s.getVideoTracks()[0]?.getSettings();
        const mirrored = settings?.facingMode !== "environment";
        let canFlip = false;
        try {
          canFlip = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput").length > 1;
        } catch {
          /* leave the switch hidden */
        }
        if (!cancelled) setResult({ facing, status: "live", mirrored, canFlip });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const name = (e as { name?: string })?.name;
        setResult({ facing, status: name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable", mirrored: false, canFlip: false });
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (shown) shown.srcObject = null;
    };
  }, [facing]);

  const status: CameraStatus = !supported() ? "unavailable" : result?.facing === facing ? result.status : "starting";
  return { videoRef, status, mirrored: result?.mirrored ?? false, canFlip: result?.canFlip ?? false };
}

/** Mean luminance of the live frame, read four times a second while `on`. */
export function useLuminance(videoRef: React.RefObject<HTMLVideoElement | null>, on: boolean): number | null {
  const [lum, setLum] = useState<number | null>(null);
  useEffect(() => {
    if (!on) return;
    const scratch = document.createElement("canvas");
    const id = window.setInterval(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;
      const next = Math.round(sampleLuminance(v, scratch));
      setLum((prev) => (prev !== null && Math.abs(prev - next) < 2 ? prev : next));
    }, 250);
    return () => window.clearInterval(id);
  }, [videoRef, on]);
  return on ? lum : null;
}
