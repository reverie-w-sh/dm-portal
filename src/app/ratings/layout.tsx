import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Рейтинги игроков «Древнего Мира» (DM)',
  description: 'Рейтинги игроков игры «Древний Мир» (DM): уровни, активность и статистика.',
  path: "/ratings",
  image: "/og/ratings.webp",
  imageAlt: 'Золотой кубок рейтингов игры «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
