import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Карта Дома Боли — «Древний Мир» (DM)',
  description: 'Интерактивная карта Дома Боли в игре «Древний Мир» (DM) с удобным поиском координат.',
  path: "/dom-boli",
  image: "/og/dom-boli.webp",
  imageAlt: 'Карта Дома Боли в игре «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
