import HunterBoard from "@/components/HunterBoard";

export const metadata = {
  title: "Планшет охотника | Wölfchen",
  description:
    "Удобный (я проверяла!) планшет для охоты: карта 4×4, выбираем зверя, записываем результаты поиска в трех направлениях, автоматом происходит подсчёт очков.",
};

export default function HunterBoardPage() {
  return (
    <main
      className="min-h-screen px-3 py-5 text-[#e9dfcf] sm:px-6 sm:py-8"
      style={{
        background:
          "radial-gradient(circle at 50% 0, rgba(116, 67, 22, .17), transparent 42rem), linear-gradient(180deg, #050707, #090b0b 50%, #050707)",
      }}
    >
      <div className="mx-auto max-w-[1090px] rounded-2xl border border-[#ad712261] bg-[rgba(5,7,7,.97)] p-4 sm:p-7">
        <HunterBoard />
      </div>
    </main>
  );
}
