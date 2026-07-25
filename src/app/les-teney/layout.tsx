import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Лес Теней — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Лес Теней» в игре «Древний Мир» (DM): боссы, монстры и полезные отметки игроков.',
  alternates: { canonical: '/les-teney' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
