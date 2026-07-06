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

            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden border border-[#b9b9b9] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-[#ffd58d]"
              style={{
                background:
                  "linear-gradient(180deg,#efefef 0%,#d9d9d9 55%,#cfcfcf 100%)",
                boxShadow:
                  "0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.9)",
              }}
            >

              {/* Светлая часть гравировки */}

              <svg
                width="38"
                height="38"
                viewBox="0 0 100 100"
                className="absolute"
                style={{
                  transform: "translate(-0.8px,-0.8px)",
                  opacity: .55,
                }}
              >
                <path
                  d="M50 88 L17 55 C4 42 6 20 24 18 C36 17 45 24 50 31 C55 24 64 17 76 18 C94 20 96 42 83 55 Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="5"
                />
              </svg>

              {/* Темная часть гравировки */}

              <svg
                width="38"
                height="38"
                viewBox="0 0 100 100"
                className="absolute"
                style={{
                  transform: "translate(.8px,.8px)",
                  opacity: .28,
                }}
              >
                <path
                  d="M50 88 L17 55 C4 42 6 20 24 18 C36 17 45 24 50 31 C55 24 64 17 76 18 C94 20 96 42 83 55 Z"
                  fill="none"
                  stroke="#4b4f54"
                  strokeWidth="5"
                />
              </svg>

              {/* Наша лапка */}

              <img
                src="https://dm-game.com/pics/clanpic/clan_278.gif"
                alt="Главная"
                className="relative z-10 w-[19px] h-[19px]"
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
