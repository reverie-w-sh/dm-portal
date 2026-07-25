import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Кланы игры «Древний Мир» (DM)',
  description: 'Список кланов игры «Древний Мир» (DM): участники, альянсы, клановые смайлики и сравнение кланов. Продолжение и аналог легендарной игры BloodyWorld (КМ).',
  alternates: { canonical: '/clans' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
