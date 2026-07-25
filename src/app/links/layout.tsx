import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Полезности для игроков «Древнего Мира» (DM)',
  description: 'Карты подземелий, планшет охотника, личные смайлики и другие полезные инструменты для игроков «Древнего Мира» (DM).',
  alternates: { canonical: '/links' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
