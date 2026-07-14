import Link from "next/link";
import {
  MapIcon,
  SmilesCollectionIcon,
  HunterBoardIcon,
} from "@/components/SiteIcons";

const usefulLinks = [
  {
    href: "/dom-boli",
    icon: MapIcon,
    category: "Карты и маршруты",
    title: "Карты Дома Боли (КП)",
    description:
      "Все 6 карт Кровавого Подземелья. Поиск карты по координатам.",
  },
  {
    href: "/personal-smiles",
    icon: SmilesCollectionIcon,
    category: "Наше любимое :)",
    title: "Личные смайлики!",
    description:
      "Посмотреть личные смайликовые коллекции: у кого сколько и какие :)",
  },
  {
    href: "/hunter-board",
    icon: HunterBoardIcon,
    category: "Ни у кого такого не было! :)",
    title: "Планшет охотника",
    description:
      "Удобный (я проверяла! :)) планшет для охоты: карта 4×4, выбираем зверя, записываем результаты поиска в трёх направлениях, очки считаются автоматически. Больше не нужно искать блокнотик и карандаш!",
  },
 //     {
 //   href: "/dungeons",
 //       icon: MapIcon,
 //      category: "Карты и маршруты",
 //      title: "Карты подземелий",
 //      description:
 //       "Сад Кошмаров, Малахитовый Рудник и Лес Теней — три карты в одном разделе.",
 //     }, 
];

export default function LinksPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-muted mb-3">
          Полезное и не очень
        </p>

        <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
          Карты, коллекции и другие материалы, которые могут пригодиться в игре.
        </p>

        <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
          А могут и не пригодиться :)
        </p>

        <div className="divider-accent mt-7" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {usefulLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative glass rounded-[26px] p-7 md:p-8 overflow-hidden border border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(0,0,0,.12)]"
            >
              <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-start">
                  <Icon className="w-16 h-16 text-ink transition-transform duration-300 group-hover:scale-[1.04]" />
                </div>

                <div className="mt-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-3">
                    {item.category}
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
          );
        })}
      </div>
    </div>
  );
}
