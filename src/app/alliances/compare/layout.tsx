import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сравнение альянсов «Древнего Мира» (DM)',
  description: 'Сравнение альянсов игры «Древний Мир» (DM): количество участников, средний и максимальный уровень игроков.',
  alternates: { canonical: '/alliances/compare' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
