import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Карта мира Древнего Мира и навигатор",
  description: "Интерактивная карта игры Древний Мир. Выбери начальную и конечную локации, построй маршрут и открой гайды по нужным местам.",
  path: "/world",
  image: "/og/world-map.webp",
  imageAlt: "Карта мира Древнего Мира с навигатором по локациям",
});

export default function WorldLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
