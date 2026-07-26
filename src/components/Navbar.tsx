"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/members", label: 'Состав клана "Волчата"' },
  { href: "/clans", label: "Другие кланы ДМ" },
  { href: "/gallery", label: "Галерея" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Тут тоже что-то есть :)" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-50 overflow-hidden border-b border-[#745022] shadow-[0_12px_35px_rgba(0,0,0,.42)]"
      style={{
        background:
          "linear-gradient(180deg,#3b3c3d 0%,#323330 22%,#292b29 58%,#222421 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.105), rgba(255,255,255,.025) 30%, transparent 64%), radial-gradient(circle at center, rgba(156,105,39,.035), rgba(0,0,0,.22) 100%)",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(222,190,137,.42), transparent)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(180,119,34,.78), transparent)",
        }}
      />

      <div className="relative mx-auto flex h-16 max-w-[1180px] items-center px-6">
        <Link
          href="/"
          className="group mr-10 shrink-0"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#9d917f] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#d8a551]"
            style={{
              background: "linear-gradient(145deg,#d6d1c9,#beb6aa)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.7), 0 4px 14px rgba(0,0,0,.38)",
            }}
          >
            <Image
              src="/icons/clan-paw.gif"
              alt="Главная"
              width={19}
              height={19}
              unoptimized
              className="h-[19px] w-[19px] object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "group relative py-2 text-[15px] font-semibold tracking-wide transition-all duration-300",
                  active
                    ? "text-[#f0d49a] drop-shadow-[0_0_8px_rgba(240,212,154,.2)]"
                    : "text-[#e0ba70] hover:text-[#f0d49a]",
                ].join(" ")}
              >
                {label}

                <span
                  className={[
                    "absolute left-0 -bottom-[11px] h-[2px] rounded-full transition-all duration-300",
                    active
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                  ].join(" ")}
                  style={{
                    background:
                      "linear-gradient(90deg,#75501f,#d39a45,#75501f)",
                    boxShadow: "0 0 10px rgba(211,154,69,.35)",
                  }}
                />
              </Link>
            );
          })}
        </nav>

        <button
          className="ml-auto rounded-lg border border-[#625e55] bg-black/10 px-3 py-2 text-[#e0ba70] transition hover:border-[#d8a551] hover:text-[#f0d49a] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden border-t border-[#504a40]"
          style={{
            background: "linear-gradient(180deg,#30312e,#232522)",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block border-b border-[#47453f] px-6 py-4 font-semibold transition-colors",
                isActive(href)
                  ? "text-[#f0d49a]"
                  : "text-[#e0ba70] hover:text-[#f0d49a]",
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
