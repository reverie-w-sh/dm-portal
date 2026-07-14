import Link from "next/link";
import { MapIcon } from "@/components/SiteIcons";

const dungeons = [
  {
    href: "/sad-koshmarov",
    title: "Сад Кошмаров",
    description: "Интерактивная карта, сохранённый маршрут, боссы и свои метки.",
  },
  {
    href: "/malahitovye-rudniki",
    title: "Малахитовый Рудник",
    description: "Интерактивная карта рудника с поиском координат и своими маршрутами.",
  },
  {
    href: "/les-teney",
    title: "Лес Теней",
    description: "Интерактивная карта леса с поиском координат, маршрутами и метками.",
  },
];

export default function DungeonsPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-muted mb-3">
          Карты и маршруты
        </p>
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Карты подземелий
        </h1>
        <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
          Выбирай нужное подземелье — внутри карта, координаты и маршруты.
        </p>
        <div className="divider-accent mt-7" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {dungeons.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative glass rounded-[26px] p-7 md:p-8 overflow-hidden border border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,.12)]"
          >
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="relative">
              <MapIcon className="w-16 h-16 text-ink transition-transform duration-300 group-hover:scale-[1.04]" />
              <div className="mt-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-3">
                  Подземелье
                </p>
                <h2 className="text-[24px] leading-tight font-black text-ink tracking-tight">
                  {item.title}
                </h2>
                <p className="text-ink-muted text-sm leading-relaxed mt-3 max-w-md">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
