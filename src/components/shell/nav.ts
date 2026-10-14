export const NAV = [
  { href: "/home", label: "Today" },
  { href: "/map", label: "Map" },
  { href: "/mirror", label: "Mirror" },
  { href: "/mates", label: "Mates" },
  { href: "/profile", label: "You" },
] as const;

export type NavHref = (typeof NAV)[number]["href"];

/** Which nav item a path belongs to: "/map/week/5" is Map, "/profile/data" is You. */
export function activeNav(path: string): NavHref | null {
  const hit = NAV.find((item) => path === item.href || path.startsWith(`${item.href}/`));
  return hit ? hit.href : null;
}
