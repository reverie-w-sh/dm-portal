import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({
  title: "Именные вещи игроков «Древнего Мира» (DM)",
  description: "Уникальные именные вещи игроков Древнего Мира, собранные по владельцам.",
  path: "/personal-items",
  image: "/og/ratings.webp",
});
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
