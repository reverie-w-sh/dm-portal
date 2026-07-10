import HunterBoard from "@/components/HunterBoard";

export default function HunterBoardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          🐺 Планшет охотника
        </h1>

        <p className="text-white/60 mb-6">
          Отмечай найденное. Данные сохраняются только на этом устройстве.
        </p>

        <HunterBoard />
      </div>
    </main>
  );
}
