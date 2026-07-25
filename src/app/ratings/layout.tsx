import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Рейтинги игроков «Древнего Мира» (DM)',
  description: 'Рейтинги игроков игры «Древний Мир» (DM): уровни, активность и статистика.',
  alternates: { canonical: '/ratings' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
