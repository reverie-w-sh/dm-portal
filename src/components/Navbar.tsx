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
  { href: "/links", label: "Что-то полезное" },
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
