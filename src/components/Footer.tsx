import Link from "next/link";

const footerLinks = [
  { href: "/members", label: "Состав" },
  { href: "/clans", label: "Кланы" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Что-то полезное" },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#6f4c22]/45 bg-[linear-gradient(180deg,rgba(10,11,10,.12),rgba(8,9,8,.34))] py-8">
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
              border-[#9d917f]
              bg-[#c9c2b8]
              shadow-[0_4px_12px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.6)]
              flex
              items-center
              justify-center
              shrink-0
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#d8a551]
            "
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
                text-[#bdb4a8]
                transition-colors
                duration-300
                hover:text-[#e2b56d]
              "
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-5 text-center">
          <span className="text-[11px] tracking-wide text-[#776c5e]">
            ♥ 2026 © A&amp;W ♥
          </span>
        </div>

      </div>
    </footer>
  );
}
