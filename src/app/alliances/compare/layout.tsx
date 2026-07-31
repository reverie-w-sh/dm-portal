import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Сравнение альянсов «Древнего Мира» (DM)",
  description: "Сравнение альянсов игры «Древний Мир» (DM): количество участников, средний и максимальный уровень игроков.",
  path: "/alliances/compare",
  image: "/og/alliance.webp",
  imageAlt: "Сравнение альянсов игры «Древний Мир»",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
