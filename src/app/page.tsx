import Image from "next/image";
import Link from "next/link";

const desktopHotspots = [
  {
    href: "/members",
    label: "Открыть состав клана «Волчата»",
    className: "left-[7.1%] top-[58.2%] h-[31.2%] w-[15.3%]",
  },
  {
    href: "/gifts",
    label: "Открыть раздел «Подарочки»",
    className: "left-[24.2%] top-[58.2%] h-[31.2%] w-[15.3%]",
  },
  {
    href: "/dungeons",
    label: "Открыть карты подземелий",
    className: "left-[41.0%] top-[58.2%] h-[31.2%] w-[15.6%]",
  },
  {
    href: "/personal-smiles",
    label: "Открыть личные смайлики",
    className: "left-[58.3%] top-[58.2%] h-[31.2%] w-[15.4%]",
  },
  {
    href: "/ratings",
    label: "Открыть рейтинги",
    className: "left-[75.2%] top-[58.2%] h-[31.2%] w-[15.5%]",
  },
];

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

function Hotspot({
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
      title={label}
      className={`group absolute z-10 rounded-[7%] outline-none ${className}`}
    >
      <span className="absolute inset-0 rounded-[7%] border-2 border-transparent transition duration-200 group-hover:-translate-y-[1.5%] group-hover:border-amber-200/70 group-hover:bg-amber-100/10 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.32)] group-focus-visible:border-amber-200 group-focus-visible:bg-amber-100/15 group-focus-visible:shadow-[0_0_24px_rgba(251,191,36,0.4)]" />
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-2 py-3 sm:px-4 sm:py-5">
      <section className="mx-auto w-full max-w-[1672px]">
        <div className="hidden md:block">
          <div className="relative aspect-[1672/941] overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl">
            <Image
              src="/images/home-desktop.webp"
              alt="Главная страница клана die Wölfchen"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            {desktopHotspots.map((hotspot) => (
              <Hotspot key={hotspot.href} {...hotspot} />
            ))}
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
              <Hotspot key={hotspot.href} {...hotspot} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
