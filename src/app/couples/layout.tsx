import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({
  title: "Семейные пары «Древнего Мира» (DM)",
  description: "Семейные пары игроков Древнего Мира, даты свадеб, кланы и коллекции.",
  path: "/couples",
  image: "/og/ratings.webp",
});
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
