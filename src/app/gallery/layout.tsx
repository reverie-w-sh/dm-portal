import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Галерея die Wölfchen — «Древний Мир» (DM)',
  description: 'Арты, волки, эльфы и памятные моменты клана die Wölfchen из игры «Древний Мир» (DM).',
  path: "/gallery",
  image: "/og/gallery.webp",
  imageAlt: 'Галерея эльфов клана die Wölfchen',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
