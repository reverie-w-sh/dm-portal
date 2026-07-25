import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Планшет охотника — «Древний Мир» (DM)',
  description: 'Планшет охотника с автоматическим подсчётом очков для игроков «Древнего Мира» (DM).',
  path: "/hunter-board",
  image: "/og/hunter-board.webp",
  imageAlt: 'Планшет охотника игры «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
