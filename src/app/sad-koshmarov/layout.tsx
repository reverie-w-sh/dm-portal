import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сад Кошмаров — карта «Древнего Мира» (DM)',
  description: 'Интерактивная карта подземелья «Сад Кошмаров» в игре «Древний Мир» (DM): маршруты, боссы и опасные места.',
  alternates: { canonical: '/sad-koshmarov' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
