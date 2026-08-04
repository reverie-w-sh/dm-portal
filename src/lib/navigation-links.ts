export const NAV_LINKS = [
  { href: "/members", label: 'Состав клана "Волчата"' },
  { href: "/clans", label: "Другие кланы ДМ" },
  { href: "/gallery", label: "Галерея" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Тут тоже что-то есть :)" },
] as const;

export type NavHref = (typeof NAV_LINKS)[number]["href"];

export const NAV_NEW_UPDATED_EVENT = "wolfchen:navigation-new-updated";

const NAV_HREFS = new Set<string>(NAV_LINKS.map((item) => item.href));

export function isNavHref(value: string): value is NavHref {
  return NAV_HREFS.has(value);
}
