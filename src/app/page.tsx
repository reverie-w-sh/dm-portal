import Image from "next/image";
import Link from "next/link";

const desktopCards = [
  {
    href: "/members",
    label: "Открыть состав клана «Волчата»",
    image: "/images/home-cards/members.webp",
  },
  {
    href: "/gifts",
    label: "Открыть раздел «Подарочки»",
    image: "/images/home-cards/gifts.webp",
  },
  {
    href: "/dungeons",
    label: "Открыть карты подземелий",
    image: "/images/home-cards/dungeons.webp",
  },
  {
    href: "/personal-smiles",
    label: "Открыть личные смайлики",
    image: "/images/home-cards/personal-smiles.webp",
  },
  {
    href: "/ratings",
    label: "Открыть рейтинги",
    image: "/images/home-cards/ratings.webp",
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

function DesktopCard({
  href,
  label,
  image,
}: {
  href: string;
  label: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        group relative block overflow-hidden
        transition duration-200 ease-out
        hover:-translate-y-1
        hover:drop-shadow-[0_0_22px_rgba(235,177,75,0.48)]
        focus-visible:outline-none
        focus-visible:drop-shadow-[0_0_24px_rgba(255,208,119,0.7)]
      "
    >
      <Image
        src={image}
        alt=""
        width={300}
        height={356}
        className="
          h-auto w-full
          transition duration-200 ease-out
          group-hover:brightness-[1.13]
          group-hover:saturate-[1.08]
          group-focus-visible:brightness-[1.15]
        "
      />

      <span
        className="
          pointer-events-none absolute inset-[2px]
          opacity-0 transition-opacity duration-200
          shadow-[inset_0_0_30px_rgba(255,198,94,0.18)]
          group-hover:opacity-100
          group-focus-visible:opacity-100
        "
      />
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
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden px-2 py-3 sm:px-4 sm:py-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-repeat [background-size:768px_512px] md:[background-size:1152px_768px]"
        style={{ backgroundImage: 'url("/images/home-pattern.webp")' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,5,4,0.12)_0%,rgba(6,5,4,0.30)_55%,rgba(6,5,4,0.48)_100%)]"
      />
      <section className="mx-auto w-full max-w-[1672px]">
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl">
            <div className="relative aspect-[1672/550]">
              <Image
                src="/images/home-desktop.webp"
                alt="Главная страница клана die Wölfchen"
                fill
                priority
                sizes="100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent" />
            </div>

            <div className="bg-black px-5 pb-8 pt-1 lg:px-8">
              <div className="grid grid-cols-5 gap-3 xl:gap-5">
                {desktopCards.map((card) => (
                  <DesktopCard key={card.href} {...card} />
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
