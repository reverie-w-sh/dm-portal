import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Галерея die Wölfchen — «Древний Мир» (DM)',
  description: 'Арты, волки, эльфы и памятные моменты клана die Wölfchen из игры «Древний Мир» (DM).',
  alternates: { canonical: '/gallery' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
