import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Именные вещи игроков «Древнего Мира» (DM)",
  description:
    "Все персональные изображения на оружие и амуницию в игре Древний Мир, собранные по владельцам.",
  path: "/personal-items",
  image: "/og/personal-items.webp",
  imageAlt: "Именные вещи игроков Древнего Мира",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
