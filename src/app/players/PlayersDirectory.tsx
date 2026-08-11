"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActivityDot } from "@/components/ActivityStatus";
import styles from "./page.module.css";

export type DirectoryPlayer = {
  cuid: string;
  nick: string;
  level: number;
  levelUp?: number;
  reincarnationLevel?: number | null;
  reincarnationUp?: number;
  clanId?: string;
  clanName?: string;
  inactiveMinutes?: number | null;
  characterImage?: string;
};

const RUSSIAN_ALPHABET = Array.from("АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ");
const LATIN_ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const PAGE_SIZE = 48;
const HERO_IMAGE_ROOT = "https://dm-game.com/layout/all/Hero_obraz/";
const LOCAL_PORTRAITS: Record<string, string> = {
  "2171": "/images/players/characters/2171.gif",
  "3358": "/images/players/characters/3358v6-0.gif",
  "4394": "/images/players/characters/a0b2cf22b87d60839420.gif",
};

function normalizedImage(player: DirectoryPlayer): string {
  const local = LOCAL_PORTRAITS[player.cuid];
  if (local) return local;

  const source = player.characterImage;
  if (!source) return "/images/players/no-character.png";
  if (source.startsWith("/")) return source;

  try {
    const url = new URL(source);
    if (url.hostname !== "dm-game.com") return source;
    if (url.pathname.startsWith("/layout/all/Hero_obraz/")) return source;
    return new URL(url.pathname.replace(/^\/+/, ""), HERO_IMAGE_ROOT).toString();
  } catch {
    return "/images/players/no-character.png";
  }
}

function initialLetter(nick: string): string {
  return nick.toLocaleUpperCase("ru-RU").match(/[A-ZА-ЯЁ]/u)?.[0] ?? "#";
}

function levelLabel(level: number, up?: number): string {
  return `Уровень ${level}${up ? `, ${up} ап` : ""}`;
}

function reincarnationLabel(level?: number | null, up?: number): string | null {
  if (level == null) return null;
  return `Реинкарнация ${level}${up ? `, ${up} ап` : ""}`;
}

function PlayerPortrait({ player }: { player: DirectoryPlayer }) {
  const image = normalizedImage(player);
  const [source, setSource] = useState(image);

  useEffect(() => setSource(image), [image]);

  return (
    <Image
      src={source}
      alt={`Образ персонажа ${player.nick}`}
      fill
      unoptimized
      sizes="74px"
      className={styles.portraitImage}
      onError={() => setSource("/images/players/no-character.png")}
    />
  );
}

export function PlayersDirectory({
  players,
  initialQuery = "",
}: {
  players: DirectoryPlayer[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [letter, setLetter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");

    return [...players]
      .filter((player) => {
        if (normalizedQuery) {
          return (
            player.nick.toLocaleLowerCase("ru-RU").includes(normalizedQuery) ||
            player.cuid.includes(normalizedQuery)
          );
        }

        return letter ? initialLetter(player.nick) === letter : true;
      })
      .sort((a, b) =>
        a.nick.localeCompare(b.nick, ["ru", "en"], {
          sensitivity: "base",
          numeric: true,
        }),
      );
  }, [letter, players, query]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [letter, query]);

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);

  function selectLetter(nextLetter: string | null) {
    setLetter(nextLetter);
    setQuery("");
  }

  function updateQuery(value: string) {
    setQuery(value);
    setLetter(null);
  }

  return (
    <div className={styles.shell}>
      <section
        className={styles.directory}
        aria-labelledby="players-title"
      >
        <header className={styles.directoryHeader}>
          <span aria-hidden="true" />
          <div>
            <h1 id="players-title">Игроки Древнего Мира</h1>
            <p>Найди игрока по нику или ID.</p>
          </div>
          <span aria-hidden="true" />
        </header>

        <div className={styles.searchRow}>
          <label className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">⌕</span>
            <span className={styles.srOnly}>Поиск игрока</span>
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Ник или ID игрока..."
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                aria-label="Очистить поиск"
              >
                ×
              </button>
            )}
          </label>

          <div className={styles.resultCount} aria-live="polite">
            Найдено: <strong>{filteredPlayers.length}</strong>
          </div>
        </div>

        <div className={styles.alphabets} aria-label="Поиск по первой букве ника">
          <div className={styles.alphabetRow}>
            <button
              type="button"
              className={letter === null && !query ? styles.activeLetter : undefined}
              onClick={() => selectLetter(null)}
            >
              Все
            </button>
            {RUSSIAN_ALPHABET.map((item) => (
              <button
                type="button"
                key={item}
                className={letter === item ? styles.activeLetter : undefined}
                onClick={() => selectLetter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.alphabetRow}>
            <button
              type="button"
              className={letter === "#" ? styles.activeLetter : undefined}
              onClick={() => selectLetter("#")}
            >
              #
            </button>
            {LATIN_ALPHABET.map((item) => (
              <button
                type="button"
                key={item}
                className={letter === item ? styles.activeLetter : undefined}
                onClick={() => selectLetter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {visiblePlayers.length > 0 ? (
          <>
            <div className={styles.playersGrid}>
              {visiblePlayers.map((player) => {
                const reincarnation = reincarnationLabel(
                  player.reincarnationLevel,
                  player.reincarnationUp,
                );

                return (
                  <Link
                    key={player.cuid}
                    href={`/players/${player.cuid}`}
                    className={styles.playerCard}
                  >
                    <span className={styles.portrait}>
                      <PlayerPortrait player={player} />
                    </span>

                    <span className={styles.cardContent}>
                      <span className={styles.nickRow}>
                        <ActivityDot
                          inactiveMinutes={player.inactiveMinutes}
                          className="w-4 h-4"
                        />
                        <strong>{player.nick}</strong>
                      </span>

                      <span className={styles.playerId}>ID {player.cuid}</span>
                      <span className={styles.levelLine}>
                        {levelLabel(player.level, player.levelUp)}
                      </span>
                      {reincarnation && (
                        <span className={styles.reincarnationLine}>{reincarnation}</span>
                      )}
                      <span className={styles.clanLine}>
                        {player.clanName || "Без клана"}
                      </span>
                    </span>

                    <span className={styles.cardArrow} aria-hidden="true">→</span>
                  </Link>
                );
              })}
            </div>

            {visibleCount < filteredPlayers.length && (
              <button
                type="button"
                className={styles.showMore}
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              >
                Показать ещё
              </button>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            Никого не нашли. Попробуй другой ник или ID.
          </div>
        )}
      </section>
    </div>
  );
}
