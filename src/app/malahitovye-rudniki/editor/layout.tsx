import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Редактор карты — Малахитовые Рудники',
  description: 'Редактор пользовательских слоёв карты подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM).',
  alternates: { canonical: '/malahitovye-rudniki/editor' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
