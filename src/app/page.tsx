import Image from "next/image";
import Link from "next/link";

const desktopHotspots = [
  {
    href: "/members",
    label: "Открыть состав клана «Волчата»",
    className: "left-[7.24%] top-[58.24%] h-[31.14%] w-[15.67%]",
  },
  {
    href: "/gifts",
    label: "Открыть раздел «Подарочки»",
    className: "left-[24.22%] top-[58.24%] h-[31.14%] w-[15.55%]",
  },
  {
    href: "/dungeons",
    label: "Открыть карты подземелий",
    className: "left-[41.03%] top-[58.24%] h-[31.14%] w-[15.55%]",
  },
  {
    href: "/personal-smiles",
    label: "Открыть личные смайлики",
    className: "left-[58.61%] top-[58.24%] h-[31.14%] w-[15.55%]",
  },
  {
    href: "/ratings",
    label: "Открыть рейтинги",
    className: "left-[75.60%] top-[58.24%] h-[31.14%] w-[15.61%]",
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

function DesktopHotspot({
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
      className={`group absolute z-10 outline-none ${className}`}
    >
      <span
        className="
          absolute inset-0
          [clip-path:polygon(8%_0,92%_0,100%_8%,100%_92%,92%_100%,8%_100%,0_92%,0_8%)]
          bg-amber-100/0
          transition-[background-color,filter] duration-200 ease-out
          group-hover:bg-amber-100/[0.055]
          group-hover:[filter:drop-shadow(0_0_10px_rgba(245,190,92,0.58))]
          group-focus-visible:bg-amber-100/[0.075]
          group-focus-visible:[filter:drop-shadow(0_0_12px_rgba(245,190,92,0.72))]
        "
      >
        <span
          className="
            absolute inset-0
            [clip-path:polygon(8%_0,92%_0,100%_8%,100%_92%,92%_100%,8%_100%,0_92%,0_8%)]
            shadow-[inset_0_0_0_0_rgba(247,201,119,0)]
            transition-shadow duration-200 ease-out
            group-hover:shadow-[inset_0_0_0_2px_rgba(247,201,119,0.9),inset_0_0_24px_rgba(247,201,119,0.08)]
            group-focus-visible:shadow-[inset_0_0_0_2px_rgba(255,220,150,1),inset_0_0_28px_rgba(247,201,119,0.12)]
          "
        />
      </span>
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
      title={label}
      className={`absolute z-10 ${className}`}
    />
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
              <DesktopHotspot key={hotspot.href} {...hotspot} />
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
              <MobileHotspot key={hotspot.href} {...hotspot} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
