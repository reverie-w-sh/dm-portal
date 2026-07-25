import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Сад Кошмаров — карта «Древнего Мира» (DM)',
  description: 'Интерактивная карта подземелья «Сад Кошмаров» в игре «Древний Мир» (DM): маршруты, боссы и опасные места.',
  path: "/sad-koshmarov",
  image: "/og/sad-koshmarov.webp",
  imageAlt: 'Сад Кошмаров в игре «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
