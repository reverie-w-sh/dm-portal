import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Альянсы игры «Древний Мир» (DM)',
  description: 'Список альянсов игры «Древний Мир» (DM) и их статистика.',
  path: "/alliances",
  image: "/og/alliance.webp",
  imageAlt: 'Союз кланов и гербы альянсов',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
