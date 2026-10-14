"use client";

import type { Icon } from "@phosphor-icons/react/lib";
import { ImagesSquare, MapTrifold, SunHorizon, UserCircle, UsersThree } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { normalisePath } from "@/lib/paths";
import { NAV, activeNav, type NavHref } from "./nav";

const ICONS: Record<NavHref, Icon> = {
  "/home": SunHorizon,
  "/map": MapTrifold,
  "/mirror": ImagesSquare,
  "/mates": UsersThree,
  "/profile": UserCircle,
};

/** Phones only. Thumb-reach navigation; the header carries the same links from 768 px. */
export function TabBar() {
  const current = activeNav(normalisePath(usePathname()));
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(var(--tabs-h)+env(safe-area-inset-bottom))] grid-cols-5 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--line)] md:hidden"
    >
      {NAV.map((item) => {
        const on = current === item.href;
        const Glyph = ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`grid content-center justify-items-center gap-0.5 text-[0.6875rem] font-medium ${on ? "text-ink" : "text-text-3"}`}
          >
            <Glyph size={22} weight={on ? "fill" : "regular"} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
