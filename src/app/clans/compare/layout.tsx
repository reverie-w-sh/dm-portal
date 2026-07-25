import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сравнение кланов «Древнего Мира» (DM)',
  description: 'Сравнивай кланы игры «Древний Мир» (DM): уровни игроков, количество участников, смайлики и место в мире игры.',
  alternates: { canonical: '/clans/compare' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
