import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const desktopCards = [
  {
    href: "/members",
    title: "Волчата",
    subtitle: "Состав клана",
    icon: "paw",
  },
  {
    href: "/gifts",
    title: "Подарочки",
    subtitle: "Дарим и получаем",
    icon: "gift",
  },
  {
    href: "/dungeons",
    title: "Карты подземелий",
    subtitle: "Сад кошмаров и другие",
    icon: "map",
  },
  {
    href: "/personal-smiles",
    title: "Личные смайлики",
    subtitle: "Наше любимое :)",
    icon: "smile",
  },
  {
    href: "/ratings",
    title: "Рейтинги",
    subtitle: "Игроки и кланы",
    icon: "star",
  },
] as const;

const mobileHotspots = [
  {
    href: "/members",
    label: "Открыть состав клана «Волчата»",
    className: "left-[10.3%] top-[37.9%] h-[9.9%] w-[77.9%]",
  },
  {
    href: "/gifts",
    label: "Открыть раздел «Подарочки»",
    className: "left-[10.3%] top-[49.4%] h-[9.8%] w-[77.9%]",
  },
  {
    href: "/dungeons",
    label: "Открыть карты подземелий",
    className: "left-[10.3%] top-[60.7%] h-[9.8%] w-[77.9%]",
  },
  {
    href: "/personal-smiles",
    label: "Открыть личные смайлики",
    className: "left-[10.3%] top-[71.8%] h-[10.0%] w-[77.9%]",
  },
  {
    href: "/ratings",
    label: "Открыть рейтинги",
    className: "left-[10.3%] top-[83.0%] h-[10.0%] w-[77.9%]",
  },
];

function CardIcon({ type }: { type: (typeof desktopCards)[number]["icon"] }) {
  const common = "h-20 w-20 drop-shadow-[0_5px_10px_rgba(0,0,0,0.75)]";

  if (type === "gift") {
    return (
      <svg viewBox="0 0 96 96" className={common} aria-hidden="true">
        <defs>
          <linearGradient id="giftGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe0a0" />
            <stop offset=".45" stopColor="#c98a32" />
            <stop offset="1" stopColor="#714015" />
          </linearGradient>
        </defs>
        <path d="M15 39h66v43H15z" fill="url(#giftGold)" stroke="#f6c66d" strokeWidth="2" />
        <path d="M10 31h76v15H10z" fill="url(#giftGold)" stroke="#f6c66d" strokeWidth="2" />
        <path d="M43 31h10v51H43z" fill="#8f541e" opacity=".72" />
        <path d="M48 30C37 17 22 14 20 23c-2 9 14 11 28 7Zm0 0c11-13 26-16 28-7 2 9-14 11-28 7Z" fill="none" stroke="#f6c66d" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg viewBox="0 0 110 90" className={common} aria-hidden="true">
        <defs>
          <linearGradient id="mapGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd58a" />
            <stop offset=".55" stopColor="#b9772d" />
            <stop offset="1" stopColor="#644019" />
          </linearGradient>
        </defs>
        <path d="M12 15 39 8l32 8 27-8v66l-27 8-32-8-27 8Z" fill="url(#mapGold)" stroke="#f3c36a" strokeWidth="2" />
        <path d="M39 8v66M71 16v66" stroke="#6f431c" strokeWidth="2" opacity=".8" />
        <path d="m22 31 8 8m0-8-8 8m7 12 8 8m0-8-8 8" stroke="#2d1b0d" strokeWidth="3" strokeLinecap="round" />
        <path d="M53 57c8-11 14-17 22-22 5 7 8 15 11 26-12-3-22-3-33-4Z" fill="#5c4526" opacity=".75" />
      </svg>
    );
  }

  if (type === "smile") {
    return (
      <svg viewBox="0 0 96 96" className={common} aria-hidden="true">
        <defs>
          <radialGradient id="smileGold">
            <stop offset="0" stopColor="#ffd87b" />
            <stop offset=".72" stopColor="#bf7628" />
            <stop offset="1" stopColor="#5b3211" />
          </radialGradient>
        </defs>
        <circle cx="48" cy="48" r="39" fill="#161616" stroke="#f3c36a" strokeWidth="4" />
        <circle cx="48" cy="48" r="31" fill="url(#smileGold)" />
        <circle cx="37" cy="41" r="4" fill="#16120c" />
        <circle cx="59" cy="41" r="4" fill="#16120c" />
        <path d="M31 56c5 12 29 12 34 0" fill="none" stroke="#16120c" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg viewBox="0 0 96 96" className={common} aria-hidden="true">
        <defs>
          <linearGradient id="starGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0b3" />
            <stop offset=".42" stopColor="#d99533" />
            <stop offset="1" stopColor="#6a3b13" />
          </linearGradient>
        </defs>
        <path d="m48 8 11 25 27 3-20 18 6 27-24-14-24 14 6-27-20-18 27-3Z" fill="url(#starGold)" stroke="#f6ca76" strokeWidth="2" />
        <path d="m48 8 1 42 17 4-18 13V50L30 54l18-13Z" fill="#fff0bd" opacity=".25" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className={common} aria-hidden="true">
      <defs>
        <linearGradient id="pawGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe1a0" />
          <stop offset=".5" stopColor="#c7832e" />
          <stop offset="1" stopColor="#633916" />
        </linearGradient>
      </defs>
      <path d="M48 7 81 18v27c0 22-14 36-33 44C29 81 15 67 15 45V18Z" fill="#111" stroke="#f2c36c" strokeWidth="3" />
      <ellipse cx="31" cy="39" rx="7" ry="10" fill="url(#pawGold)" />
      <ellipse cx="44" cy="30" rx="7" ry="10" fill="url(#pawGold)" />
      <ellipse cx="58" cy="30" rx="7" ry="10" fill="url(#pawGold)" />
      <ellipse cx="70" cy="39" rx="7" ry="10" fill="url(#pawGold)" />
      <path d="M31 61c0-12 8-20 17-20s17 8 17 20c0 10-8 14-17 14S31 71 31 61Z" fill="url(#pawGold)" />
    </svg>
  );
}

function GameCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: (typeof desktopCards)[number]["icon"];
}) {
  const shape =
    "[clip-path:polygon(7%_0,93%_0,100%_7%,100%_93%,93%_100%,7%_100%,0_93%,0_7%)]";

  return (
    <Link
      href={href}
      aria-label={`Открыть раздел «${title}»`}
      className={`group relative block min-h-[290px] ${shape} bg-[linear-gradient(145deg,#7a5127,#efc372_38%,#6d421c_72%,#d9a85b)] p-px transition duration-200 hover:-translate-y-1 hover:drop-shadow-[0_0_18px_rgba(232,174,83,0.38)] focus-visible:outline-none focus-visible:drop-shadow-[0_0_20px_rgba(245,195,107,0.55)]`}
    >
      <div
        className={`relative flex h-full min-h-[288px] flex-col items-center justify-center px-4 py-6 text-center ${shape} overflow-hidden bg-[radial-gradient(circle_at_50%_15%,rgba(110,78,37,0.24),transparent_34%),linear-gradient(180deg,#171714_0%,#0b0b0a_100%)]`}
      >
        <div className="pointer-events-none absolute inset-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className={`h-full w-full ${shape} bg-[radial-gradient(circle_at_50%_40%,rgba(238,188,102,0.16),rgba(238,188,102,0.04)_55%,transparent_76%)]`} />
        </div>

        <div className="relative transition duration-200 group-hover:scale-[1.04] group-hover:brightness-110">
          <CardIcon type={icon} />
        </div>

        <h2 className="relative mt-4 font-serif text-[1.8rem] leading-tight text-[#f3d39a] drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]">
          {title}
        </h2>

        <p className="relative mt-2 min-h-[48px] text-base leading-6 text-[#e6c792]/90">
          {subtitle}
        </p>

        <span className="relative mt-3 text-3xl leading-none text-[#e5a850] transition duration-200 group-hover:translate-x-1 group-hover:text-[#ffd27d]">
          ›
        </span>
      </div>
    </Link>
  );
}

function MobileHotspot({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`absolute z-10 ${className}`}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-2 py-3 sm:px-4 sm:py-5">
      <section className="mx-auto w-full max-w-[1672px]">
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-t-3xl border border-b-0 border-black/10 bg-black shadow-2xl">
            <div className="relative aspect-[1672/550]">
              <Image
                src="/images/home-desktop.webp"
                alt="Главная страница клана die Wölfchen"
                fill
                priority
                sizes="100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070706] to-transparent" />
            </div>

            <div className="relative bg-[radial-gradient(circle_at_50%_0%,rgba(112,68,27,0.16),transparent_32%),linear-gradient(180deg,#070706_0%,#0b0b09_100%)] px-4 pb-8 pt-2 lg:px-8">
              <div className="grid grid-cols-5 gap-3 xl:gap-5">
                {desktopCards.map((card) => (
                  <GameCard key={card.href} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="relative mx-auto aspect-[941/1672] w-full max-w-[520px] overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl">
            <Image
              src="/images/home-mobile.webp"
              alt="Главная страница клана die Wölfchen"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            {mobileHotspots.map((hotspot) => (
              <MobileHotspot key={hotspot.href} {...hotspot} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
