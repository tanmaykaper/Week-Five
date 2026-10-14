"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/ui/primitives";
import { normalisePath } from "@/lib/paths";
import { useApp } from "@/lib/storage/store";
import { DemoChip } from "./DemoChip";
import { NAV, activeNav } from "./nav";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ minimal = false, id }: { minimal?: boolean; id?: string }) {
  const path = normalisePath(usePathname());
  const current = activeNav(path);
  const mode = useApp((s) => s.mode);
  const ready = useApp((s) => s.status === "ready");

  return (
    <header
      id={id}
      className={
        minimal
          ? "relative z-30 h-[var(--header-h)]"
          : "sticky top-0 z-30 h-[var(--header-h)] bg-bg"
      }
    >
      <div className={`flex h-full items-center gap-8 ${minimal ? "px-[var(--gutter)]" : "wrap"}`}>
        <Link href={minimal ? "/" : "/home"} className="inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em]">
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
                    "relative rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-200 ease-settle hover:text-ink " +
                    (on ? "bg-ink/[0.07] text-ink" : "text-text-2")
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
          {minimal ? null : <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
