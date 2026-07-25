import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Карты подземелий «Древнего Мира» (DM)',
  description: 'Интерактивные карты подземелий игры «Древний Мир» (DM): Сад Кошмаров, Малахитовые Рудники и Лес Теней.',
  path: "/dungeons",
  image: "/og/dungeons.webp",
  imageAlt: 'Три карты подземелий игры «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
