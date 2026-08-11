import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Игроки Древнего Мира — поиск по нику и ID",
  description:
    "Каталог игроков Древнего Мира: поиск по нику и ID, уровни, реинкарнации, кланы и личные карточки персонажей.",
  path: "/players",
  image: "/og/players.webp",
  imageAlt: "Игроки Древнего Мира — книга имён и галерея героев",
});

export default function PlayersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
