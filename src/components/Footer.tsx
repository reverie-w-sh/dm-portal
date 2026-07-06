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

        {/* разделитель */}
        <div className="mb-8 flex items-center gap-5">

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

          <Link href="/" className="group">

            <div
              className="relative w-12 h-12 rounded-xl border border-[#b9b9b9] overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#ffd58d]"
              style={{
                background:
                  "linear-gradient(180deg,#eeeeee,#d3d3d3)",
                boxShadow:
                  "0 6px 16px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.85)",
              }}
            >

              {/* выгравированное сердечко */}

              <svg
                width="34"
                height="34"
                viewBox="0 0 100 100"
                className="absolute opacity-30"
              >
                <path
                  d="M50 88
                     L17 55
                     C4 42 6 20 24 18
                     C36 17 45 24 50 31
                     C55 24 64 17 76 18
                     C94 20 96 42 83 55
                     Z"
                  fill="none"
                  stroke="#5f6368"
                  strokeWidth="6"
                />
              </svg>

              <img
                src="https://dm-game.com/pics/clanpic/clan_278.gif"
                alt=""
                className="relative z-10 w-[19px] h-[19px]"
              />

            </div>

          </Link>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

        </div>

        {/* меню */}

        <nav className="flex flex-wrap justify-center gap-8 text-sm">

          {footerLinks.map((link) => (

            <Link
              key={link.href}
              href={link.href}
              className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
            >
              {link.label}
            </Link>

          ))}

        </nav>

        {/* подпись */}

        <div className="mt-6 text-center">

          <Link
            href="/"
            className="text-[11px] text-[#777] hover:text-[#aaa] transition-colors"
          >
            ♥ 2026 © A&amp;W ♥
          </Link>

        </div>

      </div>
    </footer>
  );
}
