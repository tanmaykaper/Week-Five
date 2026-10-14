import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "quiet" | "danger" | "danger-quiet";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md px-[18px] text-[0.9375rem] font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,transform] duration-150 ease-settle active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  quiet: "border border-line-strong text-ink hover:border-text-3",
  danger: "bg-alert text-bg hover:opacity-90",
  "danger-quiet": "border border-line-strong text-alert hover:border-alert",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

const linkClass =
  "inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-text-2 underline decoration-line-strong " +
  "underline-offset-4 transition-colors duration-150 ease-settle hover:text-ink hover:decoration-current";

export function TextLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link className={`${linkClass} ${className}`} {...props} />;
}

export function TextButton({ className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" className={`${linkClass} ${className}`} {...props} />;
}

type Tone = "neutral" | "today" | "info" | "alert" | "ok";
const tones: Record<Tone, string> = {
  neutral: "bg-sunk text-text-2",
  today: "bg-today-bg text-today",
  info: "bg-info-bg text-info",
  alert: "bg-alert-bg text-alert",
  ok: "bg-ok-bg text-ok",
};

export function Tag({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-[9px] text-xs font-medium whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** The app mark: one drop above one ripple line. */
export function Mark({ className = "size-[26px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <path d="M13 3.5c-2.6 3.9-5.2 6.6-5.2 9.6a5.2 5.2 0 0 0 10.4 0c0-3-2.6-5.7-5.2-9.6z" fill="var(--ink)" />
      <path d="M4.5 22h17" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Typographic apostrophes for display type: straight quotes look clumsy in the serif. */
export const curl = (text: string) => text.replace(/'/g, "\u2019");

/** Serif page opener used by every route: optional date-like line, title, lead. */
export function PageHead({ kicker, title, lead, as: As = "h1" }: { kicker?: ReactNode; title: ReactNode; lead?: ReactNode; as?: "h1" | "h2" }) {
  return (
    <header className="max-w-3xl">
      {kicker ? (
        <p className="reveal text-sm font-medium text-text-3" style={{ "--i": 0 } as React.CSSProperties}>
          {kicker}
        </p>
      ) : null}
      <As
        className="reveal mt-3.5 font-serif text-display font-normal"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {typeof title === "string" ? curl(title) : title}
      </As>
      {lead ? (
        <p className="reveal mt-[18px] max-w-[44ch] text-lead text-text-2" style={{ "--i": 2 } as React.CSSProperties}>
          {lead}
        </p>
      ) : null}
    </header>
  );
}

/** A plain section title row with an optional action on the right. */
export function SectionHead({ title, action, id }: { title: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-7 flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-title font-semibold">
        {title}
      </h2>
      {action}
    </div>
  );
}
