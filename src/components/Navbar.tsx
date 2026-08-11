"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  NAV_LINKS,
  NAV_NEW_UPDATED_EVENT,
  isNavHref,
  type NavHref,
} from "@/lib/navigation-links";
import styles from "./Navbar.module.css";

const STORAGE_KEY = "wolfchen-navigation-new-seen-v1";

type VersionMap = Partial<Record<NavHref, string>>;

function normalizeVersions(value: unknown): VersionMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [suggestionMessage, setSuggestionMessage] = useState("");
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/navigation-new", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить New");
        return response.json();
      })
      .then((data: { items?: unknown }) => {
        if (!cancelled) setActiveItems(normalizeVersions(data.items));
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
    return () => window.removeEventListener(NAV_NEW_UPDATED_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    const currentHref = NAV_LINKS.find(({ href }) => isActive(href))?.href;
    if (!currentHref) return;

    const activeVersion = activeItems[currentHref];
    if (!activeVersion) return;

    const timer = window.setTimeout(() => {
      setSeenItems((current) => {
        if (current[currentHref] === activeVersion) return current;

        const nextSeenItems = { ...current, [currentHref]: activeVersion };

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

  async function sendSuggestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = suggestion.trim();
    if (text.length < 3 || suggestionStatus === "sending") return;

    setSuggestionStatus("sending");
    setSuggestionMessage("");

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          page: pathname,
          website: form.get("website"),
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Не удалось отправить предложение");
      }

      setSuggestion("");
      setSuggestionStatus("success");
      setSuggestionMessage("Спасибо! Предложение отправлено.");
    } catch (error) {
      setSuggestionStatus("error");
      setSuggestionMessage(
        error instanceof Error ? error.message : "Не удалось отправить предложение",
      );
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.texture} aria-hidden="true" />

      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => {
            setOpen(false);
            setSearchOpen(false);
            setSuggestionOpen(false);
          }}
          aria-label="Wölfchen Clan — главная"
        >
          <Image
            src="/icons/wolf-paw-gold.png"
            alt=""
            width={58}
            height={58}
            priority
            className={styles.brandPaw}
          />
          <span className={styles.brandName}>Wölfchen Clan</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Основная навигация">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            const showNew = isNew(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${styles.navLink} ${active ? styles.active : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`${styles.newBadge} ${showNew ? styles.newBadgeVisible : ""}`}
                >
                  New
                </span>
                {showNew && <span className="sr-only">Новое: </span>}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={`${styles.searchButton} ${searchOpen ? styles.searchButtonOpen : ""}`}
          onClick={() => {
            setSearchOpen((current) => !current);
            setOpen(false);
            setSuggestionOpen(false);
          }}
          aria-label={searchOpen ? "Закрыть поиск" : "Найти игрока"}
          aria-expanded={searchOpen}
          aria-controls="navbar-player-search"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.7 4.7" />
          </svg>
        </button>

        <button
          type="button"
          className={`${styles.suggestionButton} ${suggestionOpen ? styles.suggestionButtonOpen : ""}`}
          onClick={() => {
            setSuggestionOpen((current) => !current);
            setSearchOpen(false);
            setOpen(false);
            setSuggestionStatus("idle");
            setSuggestionMessage("");
          }}
          aria-label="Оставить сообщение"
          aria-expanded={suggestionOpen}
          aria-controls="navbar-suggestion"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 5.5h17v13h-17z" />
            <path d="m4 6 8 7 8-7" />
          </svg>
          <span className="sr-only">Оставить сообщение</span>
        </button>

        <button
          type="button"
          className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
          onClick={() => {
            setOpen((current) => !current);
            setSearchOpen(false);
            setSuggestionOpen(false);
          }}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="navbar-suggestion"
        className={`${styles.suggestionPanel} ${suggestionOpen ? styles.suggestionPanelOpen : ""}`}
      >
        <form onSubmit={sendSuggestion} className={styles.suggestionForm}>
          <label htmlFor="navbar-suggestion-text">Оставить сообщение</label>
          <p>Напиши, что хотелось бы добавить или изменить на сайте.</p>
          <textarea
            id="navbar-suggestion-text"
            value={suggestion}
            onChange={(event) => {
              setSuggestion(event.target.value);
              if (suggestionStatus !== "idle") {
                setSuggestionStatus("idle");
                setSuggestionMessage("");
              }
            }}
            placeholder="Твоё предложение..."
            minLength={3}
            maxLength={1000}
            required
          />
          <input
            type="text"
            name="website"
            className={styles.honeypot}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <div className={styles.suggestionFooter}>
            <span className={styles.suggestionCount}>{suggestion.length}/1000</span>
            <button
              type="submit"
              disabled={suggestion.trim().length < 3 || suggestionStatus === "sending"}
            >
              {suggestionStatus === "sending" ? "Отправляю…" : "Отправить"}
            </button>
          </div>
          {suggestionMessage && (
            <div
              className={`${styles.suggestionMessage} ${
                suggestionStatus === "error" ? styles.suggestionError : ""
              }`}
              role="status"
            >
              {suggestionMessage}
            </div>
          )}
        </form>
      </div>

      <div
        id="navbar-player-search"
        className={`${styles.searchPanel} ${searchOpen ? styles.searchPanelOpen : ""}`}
      >
        <form action="/players" method="get" className={styles.searchForm}>
          <label htmlFor="navbar-search-input">Найти игрока</label>
          <div className={styles.searchField}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.7 4.7" />
            </svg>
            <input
              id="navbar-search-input"
              type="search"
              name="q"
              placeholder="Ник или ID игрока..."
              autoComplete="off"
              required
            />
            <button type="submit">Найти</button>
          </div>
        </form>
      </div>

      <div
        id="mobile-navigation"
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ""}`}
      >
        <nav aria-label="Мобильная навигация">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            const showNew = isNew(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
              >
                <span>{label}</span>
                {showNew && <span className={styles.mobileNew}>New</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
