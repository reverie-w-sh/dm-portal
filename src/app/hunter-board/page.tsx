import HunterBoard from "@/components/HunterBoard";

export const metadata = {
  title: "Планшет охотника | Wölfchen",
  description:
    "Удобный (я проверяла!) планшет для охоты: карта 4×4, выбираем зверя, записываем результаты поиска в трех направлениях, автоматом происходит подсчёт очков.",
};

export default function HunterBoardPage() {
  return (
    <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-10">
      <HunterBoard />
    </main>
  );
}
