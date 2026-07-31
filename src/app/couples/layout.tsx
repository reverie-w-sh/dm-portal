import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Семейные пары «Древнего Мира» (DM)",
  description:
    "Семейные пары игроков Древнего Мира: супруги, даты свадеб и коллекции каждого персонажа.",
  path: "/couples",
  image: "/og/couples.webp",
  imageAlt: "Семейные пары игроков Древнего Мира",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
