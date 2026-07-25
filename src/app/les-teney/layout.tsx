import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Лес Теней — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Лес Теней» в игре «Древний Мир» (DM): боссы, монстры и полезные отметки игроков.',
  path: "/les-teney",
  image: "/og/les-teney.webp",
  imageAlt: 'Лес Теней в игре «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
