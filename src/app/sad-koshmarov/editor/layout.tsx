import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Редактор карты — Сад Кошмаров',
  description: 'Редактор пользовательских слоёв карты подземелья «Сад Кошмаров» в игре «Древний Мир» (DM).',
  alternates: { canonical: '/sad-koshmarov/editor' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
