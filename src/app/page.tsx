import Image from "next/image";
import Link from "next/link";

const hotspots = [
  {
    href: "/members",
    label: "Открыть состав клана «Волчата»",
    className: "left-[10.7%] top-[65.9%] h-[26.4%] w-[16.7%]",
  },
  {
    href: "/gifts",
    label: "Открыть раздел «Подарочки»",
    className: "left-[29.6%] top-[65.9%] h-[26.4%] w-[17.4%]",
  },
  {
    href: "/dungeons",
    label: "Открыть карты подземелий",
    className: "left-[49%] top-[65.9%] h-[26.4%] w-[18%]",
  },
  {
    href: "/personal-smiles",
    label: "Открыть личные смайлики",
    className: "left-[69.1%] top-[65.9%] h-[26.4%] w-[17.8%]",
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-2 py-3 sm:px-4 sm:py-5">
      <section className="mx-auto w-full max-w-[1536px]">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl sm:rounded-3xl">
          <Image
            src="/images/home-interactive.png"
            alt="Главная страница клана die Wölfchen"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {hotspots.map((hotspot) => (
            <Link
              key={hotspot.href}
              href={hotspot.href}
              aria-label={hotspot.label}
              title={hotspot.label}
              className={`group absolute z-10 rounded-[8%] outline-none ${hotspot.className}`}
            >
              <span className="absolute inset-0 rounded-[8%] border-2 border-transparent bg-white/0 transition duration-200 group-hover:-translate-y-[2%] group-hover:border-amber-200/70 group-hover:bg-amber-100/10 group-hover:shadow-[0_0_28px_rgba(251,191,36,0.35)] group-focus-visible:border-amber-200 group-focus-visible:bg-amber-100/15 group-focus-visible:shadow-[0_0_28px_rgba(251,191,36,0.45)]" />
            </Link>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-ink/55 sm:text-sm">
          Нажимай на карточки прямо на картинке 🙂
        </p>
      </section>
    </main>
  );
}
