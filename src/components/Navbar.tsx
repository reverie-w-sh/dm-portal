"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/members", label: 'Состав клана "Волчата"', exact: false },
  { href: "/clans", label: "Другие кланы ДМ", exact: false },
  { href: "/links", label: "Разности", exact: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(6, 8, 12, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          onClick={() => setOpen(false)}
        >
          <div className="w-7 h-7 rounded overflow-hidden shrink-0">
            <Image
              src="https://dm-game.com/pics/clanpic/clan_278.gif"
              alt="die Wölfchen icon"
              width={28}
              height={28}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>

        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={[
                "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-accent/10 text-accent"
                  : "text-ink-dim hover:text-ink hover:bg-white/5",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-ink-dim hover:text-ink transition-colors p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/[0.06]" style={{ background: "rgba(6,8,12,0.97)" }}>
          {navLinks.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block px-6 py-3.5 text-sm font-medium border-b border-white/[0.04] transition-colors",
                isActive(href, exact)
                  ? "text-accent bg-accent/5"
                  : "text-ink-dim hover:text-ink hover:bg-white/5",
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
