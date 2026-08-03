import Image from "next/image";
import Link from "next/link";

const dungeons = [
  {
    href: "/sad-koshmarov",
    image: "/images/dungeons/sad-koshmarov.webp",
    alt: "Сад Кошмаров",
    width: 1730,
    height: 909,
  },
  {
    href: "/malahitovye-rudniki",
    image: "/images/dungeons/malahitovye-rudniki.webp",
    alt: "Малахитовые Рудники",
    width: 1729,
    height: 910,
  },
  {
    href: "/les-teney",
    image: "/images/dungeons/les-teney.webp",
    alt: "Лес Теней",
    width: 1688,
    height: 932,
  },
];

export default function DungeonsPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/home-pattern.webp')",
        backgroundRepeat: "repeat",
        backgroundPosition: "top center",
      }}
    >
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <header className="mb-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-ink-muted">
          Карты и маршруты
        </p>

        <h1 className="mb-3 text-3xl font-black tracking-tight text-[#e7ca91] opacity-60 drop-shadow-[0_2px_10px_rgba(0,0,0,.9)] sm:text-4xl">
          Карты подземелий
        </h1>

        <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
          Выбирай нужное подземелье — внутри карта, координаты и маршруты... а
          может и нет никаких координат, значит когда-то будут! :) Но ты всегда
          можешь проложить собственный маршрут ;)
        </p>

        <div className="divider-accent mt-7" />
        </header>

        <nav className="grid gap-5" aria-label="Карты подземелий">
          {dungeons.map((dungeon, index) => (
            <Link
              key={dungeon.href}
              href={dungeon.href}
              aria-label={dungeon.alt}
              className="group block overflow-hidden bg-[#030404] shadow-[0_14px_30px_rgba(0,0,0,.45)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,.58),0_0_22px_rgba(194,128,31,.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9a44a]"
            >
              <Image
                src={dungeon.image}
                alt={dungeon.alt}
                width={dungeon.width}
                height={dungeon.height}
                priority={index === 0}
                sizes="(max-width: 1180px) 100vw, 1180px"
                className="block h-auto w-full transition duration-200 group-hover:brightness-105 group-hover:saturate-105"
              />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
