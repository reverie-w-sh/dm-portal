import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Панель администратора',
  description: 'Служебная панель управления сайтом клана die Wölfchen.',
  alternates: { canonical: '/admin' },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
