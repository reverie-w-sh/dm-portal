import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Малахитовые Рудники — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM): расположение боссов, монстров и маршрутов.',
  alternates: { canonical: '/malahitovye-rudniki' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
