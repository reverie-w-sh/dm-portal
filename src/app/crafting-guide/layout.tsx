import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({
  title: "Кожевничество и заклинательство в Древнем Мире: заплатки, ЗЧ и ресурсы",
  description: "Что дают заплатки, какие руны, шкуры и другие ресурсы нужны для кожевничества и зачарования вещей в игре Древний Мир (DM). Рецепты по уровню и типу вещи.",
  path: "/crafting-guide",
  image: "/og/crafting-guide-v2.webp",
  imageAlt: "Кожевничество и заклинательство: руны, заплатки и зачарованные вещи в Древнем Мире",
});
export default function Layout({children}: Readonly<{children: React.ReactNode}>){return children;}
