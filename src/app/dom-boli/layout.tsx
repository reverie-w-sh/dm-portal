import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Карта Дома Боли — «Древний Мир» (DM)',
  description: 'Интерактивная карта Дома Боли в игре «Древний Мир» (DM) с удобным поиском координат.',
  alternates: { canonical: '/dom-boli' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
