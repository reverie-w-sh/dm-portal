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
    >
      <div className="mx-auto max-w-[1090px] rounded-2xl border border-[#79501f] bg-[rgba(4,5,4,.96)] p-4 shadow-[0_20px_55px_rgba(0,0,0,.5),inset_0_0_35px_rgba(0,0,0,.25)] sm:p-7">
        <HunterBoard />
      </div>
    </main>
  );
}
