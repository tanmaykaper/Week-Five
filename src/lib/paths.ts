/** The GitHub Pages sub-path, or "" locally. next/link adds it for us; raw URLs need it. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBase = (path: string) => `${BASE_PATH}${path}`;

/** usePathname() without a trailing slash, so "/home/" and "/home" compare equal. */
export const normalisePath = (path: string | null) => (path && path !== "/" ? path.replace(/\/$/, "") : "/");

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tanmaykaper.github.io/week-five";
