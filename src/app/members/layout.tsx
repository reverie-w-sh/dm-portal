import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Волчата — состав клана die Wölfchen в «Древнем Мире» (DM)',
  description: 'Все участники клана die Wölfchen в игре «Древний Мир» (DM): уровни, реинкарнации и состав нашей стаи.',
  alternates: { canonical: '/members' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
