"use client";

import { Moon, Sun } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/storage/store";

/** Flips between light and dark. "Follow the system" lives in You, settings. */
export function ThemeToggle() {
  const setTheme = useApp((s) => s.setTheme);
  const theme = useApp((s) => s.theme);
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-150 ease-settle hover:bg-sunk hover:text-ink"
    >
      {dark === null ? <span className="size-5" /> : dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
