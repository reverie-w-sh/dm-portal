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

        <div className="flex items-center gap-5 mb-8">

          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

          <Link
            href="/"
            className="relative block w-10 h-10 shrink-0"
            title="Главная"
          >
            <img
              src="/icons/footer-heart-button-40.png"
              alt=""
              width={40}
              height={40}
              draggable={false}
              className="block w-10 h-10"
            />

            <img
              src="/icons/clan-paw.gif"
              alt=""
              width={19}
              height={19}
              draggable={false}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: "19px",
                height: "19px",
                transform: "translate(-50%, -50%)",
              }}
            />
          </Link>

          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

        </div>

        {/* Меню */}

        <nav className="flex flex-wrap justify-center gap-8 text-sm">

          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-6 text-center">
          <span className="text-[11px] text-[#747474]">
            ♥ 2026 © A&amp;W ♥
          </span>
        </div>

      </div>
    </footer>
  );
}
