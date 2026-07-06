"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/members", label: 'Состав клана "Волчата"' },
  { href: "/clans", label: "Другие кланы ДМ" },
  { href: "/links", label: "Разности" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#3b414a] bg-[#20242b]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={() => setOpen(false)} className="shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8d2c0] shadow-md">
            <Image
              src="https://dm-game.com/pics/clanpic/clan_278.gif"
              alt="На главную"
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 object-contain"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                isActive(href)
                  ? "bg-[#d0b16f]/15 text-[#f0d991]"
                  : "text-[#c9ced6] hover:bg-white/5 hover:text-[#f0d991]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          className="lg:hidden rounded-lg px-3 py-2 text-[#c9ced6] hover:bg-white/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#3b414a] bg-[#20242b] lg:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block border-b border-[#3b414a] px-6 py-3 text-sm font-medium",
                isActive(href)
                  ? "text-[#f0d991]"
                  : "text-[#c9ced6] hover:bg-white/5 hover:text-[#f0d991]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
