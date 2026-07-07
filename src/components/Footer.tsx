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

          <Link href="/" className="group" title="На главную">

            <div className="relative w-10 h-10">

  <img
    src="/icons/footer-heart-button-40.png"
    alt=""
    className="absolute inset-0 w-10 h-10"
  />

  <img
    src="https://dm-game.com/pics/clanpic/clan_278.gif"
    alt="Главная"
    className="absolute left-1/2 top-1/2 w-[19px] h-[19px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"
  />

</div>
          </Link>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

        </div>

        {/* Меню */}

        <nav className="flex flex-wrap justify-center gap-8 text-sm">

          {footerLinks.map((item) => (

            <Link
              key={item.href}
              href={item.href}
              className="text-[#b9bec6] transition-all duration-300 hover:text-[#ffd58d]"
            >
              {item.label}
            </Link>

          ))}

        </nav>

        {/* Подпись */}

        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-[11px] tracking-wide text-[#747474] transition-colors hover:text-[#9b9b9b]"
          >
            ♥ 2026 © A&amp;W ♥
          </Link>

        </div>

      </div>
    </footer>
  );
}
