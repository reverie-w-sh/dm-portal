import Link from "next/link";

const footerLinks = [
  { href: "/members", label: "Состав" },
  { href: "/clans", label: "Кланы" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Что-то полезное" },
];

export default function Footer() {
  return (
    <footer className="mt-24 mb-8">
      <div className="max-w-[1180px] mx-auto px-6">

        {/* Разделитель */}

        <div className="mb-8 flex items-center gap-5">

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

          <Link
            href="/"
            title="Главная"
            className="
              group
              w-10
              h-10
              rounded-xl
              border
              border-[#b9b9b9]
              bg-[#d3d3d3]
              shadow-[0_4px_12px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.75)]
              flex
              items-center
              justify-center
              shrink-0
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#ffd58d]
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

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

        </div>

        {/* Меню */}

        <nav className="flex flex-wrap justify-center gap-8 text-sm">

          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                text-[#b9bec6]
                transition-colors
                duration-300
                hover:text-[#ffd58d]
              "
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-6 text-center">
          <span className="text-[11px] tracking-wide text-[#747474]">
            ♥ 2026 © A&amp;W ♥
          </span>
        </div>

      </div>
    </footer>
  );
}
