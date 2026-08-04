"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NAV_LINKS,
  NAV_NEW_UPDATED_EVENT,
  isNavHref,
  type NavHref,
} from "@/lib/navigation-links";

const STORAGE_KEY = "wolfchen-navigation-new-seen-v1";

type VersionMap = Partial<Record<NavHref, string>>;

function normalizeVersions(value: unknown): VersionMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const versions: VersionMap = {};

  for (const [href, version] of Object.entries(value)) {
    if (isNavHref(href) && typeof version === "string" && version) {
      versions[href] = version;
    }
  }

  return versions;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeItems, setActiveItems] = useState<VersionMap>({});
  const [seenItems, setSeenItems] = useState<VersionMap>(() => {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeVersions(JSON.parse(stored)) : {};
    } catch {
      return {};
    }
  });

  const isActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/navigation-new", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить New");
        return response.json();
      })
      .then((data: { items?: unknown }) => {
        if (!cancelled) {
          setActiveItems(normalizeVersions(data.items));
        }
      })
      .catch(() => {
        if (!cancelled) setActiveItems({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleUpdate(event: Event) {
      const updatedEvent = event as CustomEvent<unknown>;
      setActiveItems(normalizeVersions(updatedEvent.detail));
    }

    window.addEventListener(NAV_NEW_UPDATED_EVENT, handleUpdate);

    return () => {
      window.removeEventListener(NAV_NEW_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  useEffect(() => {
    const currentHref = NAV_LINKS.find(({ href }) =>
      pathname === href || pathname.startsWith(`${href}/`),
    )?.href;

    if (!currentHref) return;

    const activeVersion = activeItems[currentHref];

    if (!activeVersion) return;

    const timer = window.setTimeout(() => {
      setSeenItems((current) => {
        if (current[currentHref] === activeVersion) return current;

        const nextSeenItems = {
          ...current,
          [currentHref]: activeVersion,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSeenItems));
        } catch {
          // В приватном режиме браузер может запретить сохранение.
        }

        return nextSeenItems;
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeItems, pathname]);

  function isNew(href: NavHref): boolean {
    const activeVersion = activeItems[href];

    return Boolean(
      activeVersion && seenItems[href] !== activeVersion && !isActive(href),
    );
  }

  return (
    <header
      className="sticky top-0 z-50 overflow-hidden border-b border-[#684318] shadow-[0_12px_35px_rgba(0,0,0,.58)]"
      style={{
        background:
          "linear-gradient(180deg,#242522 0%,#1b1c1a 32%,#111210 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.06), rgba(255,255,255,.012) 32%, transparent 64%), radial-gradient(circle at center, rgba(156,105,39,.025), rgba(0,0,0,.34) 100%)",
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#a8a8a2] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#d2a45b]"
            style={{
              backgroundImage:
                'linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(40,42,42,.08) 42%,rgba(8,9,9,.40) 100%),url("/images/silver-letter-texture.webp")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "multiply, normal",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.88), inset 0 0 0 1px rgba(35,36,36,.28), inset 0 -6px 9px rgba(13,14,14,.34), 0 4px 14px rgba(0,0,0,.52)",
            }}
          >
            <Image
              src="/icons/clan-paw.gif"
              alt="Главная"
              width={25}
              height={25}
              unoptimized
              className="h-[25px] w-[25px] object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            const showNew = isNew(href);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "group relative py-2 text-[15px] font-semibold tracking-wide transition-all duration-300",
                  active
                    ? "text-[#efc678] drop-shadow-[0_0_8px_rgba(239,198,120,.2)]"
                    : "text-[#ecd4a6] hover:text-[#efc678]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute left-1/2 -top-1 -translate-x-1/2 text-[9px] font-black leading-none tracking-[0.08em] text-[#e7a64a] drop-shadow-[0_0_5px_rgba(231,166,74,.55)] transition-opacity",
                    showNew ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  New
                </span>

                {showNew && <span className="sr-only">Новое: </span>}
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
          className="ml-auto rounded-lg border border-[#625e55] bg-black/10 px-3 py-2 text-[#ecd4a6] transition hover:border-[#d8a551] hover:text-[#efc678] lg:hidden"
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
            background: "linear-gradient(180deg,#191a18,#0f100f)",
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const showNew = isNew(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  "block border-b border-[#47453f] px-6 py-3 font-semibold transition-colors",
                  isActive(href)
                    ? "text-[#efc678]"
                    : "text-[#ecd4a6] hover:text-[#efc678]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "block h-3 text-[9px] font-black leading-3 tracking-[0.08em] text-[#e7a64a] transition-opacity",
                    showNew ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  New
                </span>

                {showNew && <span className="sr-only">Новое: </span>}
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
