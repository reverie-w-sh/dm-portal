import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Альянсы игры «Древний Мир» (DM)',
  description: 'Список альянсов игры «Древний Мир» (DM) и их статистика.',
  alternates: { canonical: '/alliances' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
