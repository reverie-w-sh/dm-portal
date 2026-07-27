import Link from "next/link";

const footerLinks = [
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
              border-[#a5a6a1]
              shadow-[0_4px_14px_rgba(0,0,0,.52),inset_0_1px_0_rgba(255,255,255,.9),inset_0_0_0_1px_rgba(245,242,234,.22),inset_0_-7px_11px_rgba(24,26,27,.24)]
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
              background:
                "radial-gradient(circle at 24% 22%,rgba(255,255,255,.72) 0 1px,transparent 1.8px),radial-gradient(circle at 76% 34%,rgba(29,31,32,.42) 0 1px,transparent 1.7px),radial-gradient(circle at 43% 78%,rgba(255,255,255,.34) 0 1px,transparent 1.8px),repeating-linear-gradient(165deg,rgba(255,255,255,.055) 0 1px,rgba(18,20,21,.035) 1px 3px),linear-gradient(145deg,#f0ece3 0%,#b8b5ad 20%,#747777 43%,#d9d5cc 65%,#7d8080 83%,#e1ddd4 100%)",
            }}
          >
            <img
              src="/icons/clan-paw.gif"
              alt="Главная"
              width={19}
              height={19}
              draggable={false}
              className="w-[19px] h-[19px] select-none"
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
