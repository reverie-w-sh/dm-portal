import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Малахитовые Рудники — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM): расположение боссов, монстров и маршрутов.',
  path: "/malahitovye-rudniki",
  image: "/og/malahitovye-rudniki.webp",
  imageAlt: 'Малахитовые Рудники в игре «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
