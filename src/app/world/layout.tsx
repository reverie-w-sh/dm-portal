import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Карта мира и навигатор Древнего Мира",
  description: "Интерактивная карта локаций игры Древний Мир: маршрут из Дома или текущей точки, переходы и ссылки на гайды.",
  path: "/world",
  image: "/images/world/world-map.webp",
  imageAlt: "Карта мира игры Древний Мир",
});

export default function WorldLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
