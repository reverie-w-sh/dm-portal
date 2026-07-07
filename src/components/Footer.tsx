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
            className="group relative"
            title="На главную"
          >
            <img
              src="/icons/footer-heart-button-40.png"
              alt=""
              className="w-10 h-10 select-none"
              draggable={false}
            />

            <img
              src="/icons/clan-paw.gif"
              alt="Главная"
              draggable={false}
              className="
                absolute
                left-1/2
                top-1/2
                w-[19px]
                h-[19px]
                -translate-x-1/2
                -translate-y-1/2
                transition-transform
                duration-300
                group-hover:scale-110
              "
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
                hover:text-[#ffd58d]
                transition-colors
                duration-300
              "
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-6 text-center">

          <Link
            href="/"
            className="
              text-[11px]
              tracking-wide
              text-[#727272]
              hover:text-[#9b9b9b]
              transition-colors
            "
          >
            ♥ 2026 © A&amp;W ♥
          </Link>

        </div>

      </div>
    </footer>
  );
}
