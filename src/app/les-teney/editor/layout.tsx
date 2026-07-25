import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Редактор карты — Лес Теней',
  description: 'Редактор пользовательских слоёв карты подземелья «Лес Теней» в игре «Древний Мир» (DM).',
  alternates: { canonical: '/les-teney/editor' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
