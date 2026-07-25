import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Подарочки для игры «Древний Мир» (DM)',
  description: 'Каталог наших клановых подарков для игры «Древний Мир» (DM): скачивай, загружай через услуги коммерческого отдела и дари их! :)',
  path: "/gifts",
  image: "/og/gifts.webp",
  imageAlt: 'Красивые игровые подарки клана die Wölfchen',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
