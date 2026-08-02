import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "О клане die Wölfchen" },  
  { href: "/members", label: "Состав" },
  { href: "/clans", label: "Кланы" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Что-то полезное" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-[#684318]/70 py-8 shadow-[0_-14px_34px_rgba(0,0,0,.22)]"
      style={{
        background:
          "linear-gradient(180deg,#121311 0%,#0b0c0b 52%,#080908 100%)",
      }}
    >
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Разделитель */}

        <div className="mb-6 flex items-center gap-5">

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#81643f]/60 to-transparent" />

          <Link
            href="/"
            title="Главная"
            className="
              group
              w-10
              h-10
              rounded-xl
              border
              border-[#a8a8a2]
              shadow-[0_4px_14px_rgba(0,0,0,.52),inset_0_1px_0_rgba(255,255,255,.88),inset_0_0_0_1px_rgba(35,36,36,.28),inset_0_-6px_9px_rgba(13,14,14,.34)]
              flex
              items-center
              justify-center
              shrink-0
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#d8a551]
            "
            style={{
              backgroundImage:
                'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(40,42,42,.08) 42%,rgba(8,9,9,.40) 100%),url("/images/silver-letter-texture.webp")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "multiply, normal",
            }}
          >
            <img
              src="/icons/clan-paw.gif"
              alt="Главная"
              width={25}
              height={25}
              draggable={false}
              className="w-[25px] h-[25px] select-none"
            />
          </Link>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#81643f]/60 to-transparent" />

        </div>

        {/* Меню */}

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">

          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                text-[#ecd4a6]
                transition-colors
                duration-300
                hover:text-[#efc678]
              "
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-5 text-center">
          <span className="text-[11px] tracking-wide text-[#8c7658]">
            ♥ 2026 © A&amp;W ♥
          </span>
        </div>

      </div>
    </footer>
  );
}
