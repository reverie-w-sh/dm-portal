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
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

          <div className="relative flex h-11 w-14 items-center justify-center">
            <div className="absolute bottom-1 h-7 w-9 rounded-[50%_50%_45%_45%] bg-[#d3d3d3] shadow-[0_4px_14px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.8)]" />
            <div className="absolute left-1 top-3 h-4 w-4 rounded-full bg-[#d3d3d3] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />
            <div className="absolute left-4 top-0 h-5 w-4 rounded-full bg-[#d3d3d3] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />
            <div className="absolute right-4 top-0 h-5 w-4 rounded-full bg-[#d3d3d3] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />
            <div className="absolute right-1 top-3 h-4 w-4 rounded-full bg-[#d3d3d3] shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" />

            <img
              src="https://dm-game.com/pics/clanpic/clan_278.gif"
              alt=""
              className="relative z-10 h-[19px] w-[19px]"
            />
          </div>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <nav className="flex flex-wrap justify-center gap-7 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#b9bec6] transition-colors hover:text-[#ffd58d]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="text-[11px] text-[#757575] transition-colors hover:text-[#a8a8a8]"
          >
            ♥ 2026 © A&amp;W ♥
          </Link>
        </div>
      </div>
    </footer>
  );
}
