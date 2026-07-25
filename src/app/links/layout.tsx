import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Полезности для игроков «Древнего Мира» (DM)',
  description: 'Карты подземелий, планшет охотника, личные смайлики и другие полезные инструменты для игроков «Древнего Мира» (DM).',
  path: "/links",
  image: "/og/links.webp",
  imageAlt: 'Карты, свитки, планшет охотника и рейтинги',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
