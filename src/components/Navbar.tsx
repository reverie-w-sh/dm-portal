"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/members", label: 'Состав клана "Волчата"' },
  { href: "/clans", label: "Другие кланы ДМ" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Что-то полезное" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[#454b55] bg-[#2a2f37] shadow-lg">
      <div className="max-w-[1180px] mx-auto h-16 px-6 flex items-center">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="mr-10 shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#d3d3d3] border border-[#b8b8b8] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">

            <Image
              src="https://dm-game.com/pics/clanpic/clan_278.gif"
              alt="Главная"
              width={19}
              height={19}
              unoptimized
              className="object-contain"
            />

          </div>
        </Link>

        {/* Desktop */}
        <nav className="hidden lg:flex items-center gap-8">

          {navLinks.map(({ href, label }) => (

            <Link
              key={href}
              href={href}
              className={[
                "text-[15px] font-medium transition-colors",
                isActive(href)
                  ? "text-[#b86a16]"
                  : "text-[#d8d8d8] hover:text-[#d18b31]",
              ].join(" ")}
            >
              {label}
            </Link>

          ))}

        </nav>

        {/* Mobile */}

        <button
          className="ml-auto lg:hidden text-[#d8d8d8]"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

      </div>

      {open && (

        <div className="lg:hidden bg-[#2a2f37] border-t border-[#454b55]">

          {navLinks.map(({ href, label }) => (

            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block px-6 py-4 border-b border-[#454b55]",
                isActive(href)
                  ? "text-[#b86a16]"
                  : "text-[#d8d8d8]",
              ].join(" ")}
            >
              {label}
            </Link>

          ))}

        </div>

      )}

    </header>
  );
}
