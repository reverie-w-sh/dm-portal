"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/members", label: 'Состав клана "Волчата"' },
  { href: "/clans", label: "Другие кланы ДМ" },
  { href: "/gifts", label: "Подарки" },
  { href: "/links", label: "Что-то полезное" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[#7b4a18]/60 bg-[#252a31] shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />

      <div className="relative max-w-[1180px] mx-auto h-16 px-6 flex items-center">
        <Link href="/" onClick={() => setOpen(false)} className="mr-10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#d3d3d3] border border-[#a9a9a9] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_14px_rgba(0,0,0,0.28)] hover:border-[#b86a16] transition">
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

        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative py-2 text-[15px] font-semibold tracking-wide transition-colors",
                  active
                    ? "text-[#f0c27a]"
                    : "text-[#d8d8d8] hover:text-[#f0c27a]",
                ].join(" ")}
              >
                {label}
                <span
                  className={[
                    "absolute left-0 -bottom-1 h-[2px] rounded-full bg-[#b86a16] transition-all duration-300",
                    active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        <button
          className="ml-auto lg:hidden rounded-lg border border-[#454b55] px-3 py-2 text-[#d8d8d8] hover:text-[#f0c27a]"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#454b55] bg-[#252a31]">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block border-b border-[#454b55] px-6 py-4 text-sm font-semibold",
                isActive(href) ? "text-[#f0c27a]" : "text-[#d8d8d8]",
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
