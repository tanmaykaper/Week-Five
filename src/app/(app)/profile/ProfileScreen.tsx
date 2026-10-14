"use client";

import { CaretRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Gate, Upcoming } from "@/components/shell/Gate";
import { PageHead } from "@/components/ui/primitives";
import { useApp, type ThemeSetting } from "@/lib/storage/store";

const THEMES: { value: ThemeSetting; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ProfileScreen() {
  return (
    <Gate needsPlan={false}>
      <section className="pt-[clamp(40px,6vw,88px)]">
        <PageHead title="You." lead="Your plan, how the app looks, and your data. All of it lives on this device." />
        <div className="mt-12 grid max-w-[760px] gap-12">
          <Look />
          <Demo />
          <Group title="Your data">
            <RowLink href="/profile/data" label="Export or delete" hint="Everything stays on this device" />
            <RowLink href="/about" label="About this app" hint="Why it exists, sources, disclaimer" />
          </Group>
        </div>
        <Upcoming phase={10}>Editing your plan, routine times, reminders and language arrive here.</Upcoming>
      </section>
    </Gate>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reveal" style={{ "--i": 3 } as React.CSSProperties}>
      <h2 className="text-title font-semibold">{title}</h2>
      <div className="mt-4 border-t border-line">{children}</div>
    </section>
  );
}

function RowLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="group flex min-h-[60px] items-center justify-between gap-4 border-b border-line py-2">
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-sm text-text-2">{hint}</span>
      </span>
      <CaretRight size={18} className="text-text-3 transition-transform duration-150 ease-settle group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function Look() {
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  return (
    <Group title="Look">
      <div className="flex min-h-[60px] flex-wrap items-center justify-between gap-4 border-b border-line py-3">
        <span id="theme-label" className="font-medium">
          Theme
        </span>
        <div role="radiogroup" aria-labelledby="theme-label" className="inline-flex rounded-md border border-line-strong p-0.5">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={theme === t.value}
              onClick={() => setTheme(t.value)}
              className="h-9 rounded-sm px-3.5 text-sm font-medium text-text-2 transition-colors duration-150 ease-settle aria-checked:bg-ink aria-checked:text-bg"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </Group>
  );
}

function Demo() {
  const mode = useApp((s) => s.mode);
  const enterDemo = useApp((s) => s.enterDemo);
  const leaveDemo = useApp((s) => s.leaveDemo);
  const router = useRouter();
  const on = mode === "demo";
  return (
    <Group title="Sample data">
      <div className="flex min-h-[60px] items-center justify-between gap-4 border-b border-line py-3">
        <span>
          <span id="demo-label" className="font-medium">
            Try it with sample data
          </span>
          <span className="block text-sm text-text-2">
            A fictional person on day 35. Jump to any day from the chip at the top. Your own plan is kept separately.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="demo-label"
          onClick={() => {
            if (on) {
              leaveDemo();
              router.push("/");
            } else {
              enterDemo("steady");
              router.push("/home");
            }
          }}
          className="relative h-7 w-12 shrink-0 rounded-full bg-track transition-colors duration-200 ease-settle aria-checked:bg-action"
        >
          <span
            className={`absolute top-1 left-1 size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-settle ${on ? "translate-x-5" : ""}`}
          />
        </button>
      </div>
    </Group>
  );
}
