import HunterBoard from "@/components/HunterBoard";

export const metadata = {
  title: "Планшет охотника | Wölfchen",
  description:
    "Удобный планшет для ручной охоты: карта 4×4, отметки зверей, направления поиска и подсчёт очков.",
};

export default function HunterBoardPage() {
  return (
    <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-10">
      <HunterBoard />
    </main>
  );
}
