export const NAV_LINKS = [
  { href: "/members", label: "ВОЛЧАТА" },
  { href: "/clans", label: "ВСЕ КЛАНЫ" },
  { href: "/chronicle", label: "ЛЕТОПИСЬ" },
  { href: "/gallery", label: "ГАЛЕРЕЯ" },
  { href: "/gifts", label: "ПОДАРОЧКИ" },
  { href: "/links", label: "БИБЛИОТЕКА" },
] as const;

export type NavHref = (typeof NAV_LINKS)[number]["href"];

export const NAV_NEW_UPDATED_EVENT = "wolfchen:navigation-new-updated";

const NAV_HREFS = new Set<string>(NAV_LINKS.map((item) => item.href));

export function isNavHref(value: string): value is NavHref {
  return NAV_HREFS.has(value);
}
