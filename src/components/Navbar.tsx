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
      className="sticky top-0 z-50 overflow-hidden border-b border-[#6b4622] shadow-[0_12px_35px_rgba(0,0,0,.45)]"
      style={{
        background:
          "linear-gradient(180deg,#444b54 0%,#383e46 20%,#2e333b 55%,#262a31 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.13), rgba(255,255,255,.04) 28%, transparent 62%), radial-gradient(circle at center, transparent 35%, rgba(0,0,0,.2) 100%)",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,210,130,.65), transparent)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(184,106,22,.7), transparent)",
        }}
      />

      <div className="relative mx-auto flex h-16 max-w-[1180px] items-center px-6">
        <Link
          href="/"
          className="group mr-10 shrink-0"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#b5b5b5] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#ffd58d]"
            style={{
              background: "#d3d3d3",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.85), 0 4px 14px rgba(0,0,0,.35)",
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
                    ? "text-[#ffd58d] drop-shadow-[0_0_8px_rgba(255,213,141,.25)]"
                    : "text-[#dddddd] hover:text-[#ffd58d]",
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
                      "linear-gradient(90deg,#8b4d14,#e7bb70,#8b4d14)",
                    boxShadow: "0 0 10px rgba(231,187,112,.45)",
                  }}
                />
              </Link>
            );
          })}
        </nav>

        <button
          className="ml-auto rounded-lg border border-[#555] px-3 py-2 text-[#ddd] transition hover:border-[#ffd58d] hover:text-[#ffd58d] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden border-t border-[#4c5159]"
          style={{
            background: "linear-gradient(180deg,#383e46,#2b3037)",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={[
                "block border-b border-[#454b55] px-6 py-4 font-semibold transition-colors",
                isActive(href)
                  ? "text-[#ffd58d]"
                  : "text-[#dddddd] hover:text-[#ffd58d]",
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
