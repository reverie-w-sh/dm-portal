import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Охота в «Древнем Мире» (DM) — подробная инструкция для новичка',
  description:
    'Как устроена обычная охота в игре «Древний Мир» (DM): карта 4×4, осмотр местности, поиск зверей, направления поиска, очки за шкуры и удобная тактика прохождения.',
  path: "/hunter-guide",
  image: "/og/hunter-board.webp",
  imageAlt: 'Инструкция по охоте в игре «Древний Мир» (DM)',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
