"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/ui/primitives";
import { normalisePath } from "@/lib/paths";
import { useApp } from "@/lib/storage/store";
import { DemoChip } from "./DemoChip";
import { NAV, activeNav } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const path = normalisePath(usePathname());
  const current = activeNav(path);
  const mode = useApp((s) => s.mode);
  const ready = useApp((s) => s.status === "ready");

  return (
    <header className="sticky top-0 z-30 h-[var(--header-h)] border-b border-line bg-bg/85 backdrop-blur-md backdrop-saturate-150">
      <div className="wrap flex h-full items-center gap-8">
        <Link href={minimal ? "/" : "/home"} className="inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.01em]">
          <Mark />
          Week Five
        </Link>

        {!minimal && (
          <nav aria-label="Main" className="ml-2 hidden gap-1 md:flex">
            {NAV.map((item) => {
              const on = current === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={
                    "relative rounded-md px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-150 ease-settle hover:bg-sunk hover:text-ink " +
                    (on
                      ? "text-ink after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-ink"
                      : "text-text-2")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {ready && mode === "demo" ? <DemoChip /> : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
