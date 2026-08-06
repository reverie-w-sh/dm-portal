import GiftBoard from "@/components/GiftBoard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Планшет подарков",
  description:
    "Собери рисунок из подарков для инфы в Древнем Мире и посчитай, сколько каких подарков понадобится.",
  path: "/gift-board",
  image: "/og/gift-board.webp",
  imageAlt: "Планшет подарков die Wölfchen",
});

export default function GiftBoardPage() {
  return <GiftBoard />;
}
