"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import personalSmilesData from "../../../data/personal-smiles.json";
import personalItemsData from "../../../data/personal-items.json";
import lastSync from "../../../data/last-sync.json";
import EventsFeed from "@/components/EventsFeed";
import styles from "../collection-pages.module.css";

type PlayerWithSmiles = {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
  clanName: string;
  clanIcon: string;
  profileUrl: string;
  smilesPageUrl: string;
  personalSmilesCount: number;
  personalSmiles: string[];
};

type SortType = "count-desc" | "count-asc" | "nick";
type PersonalItem = { owner: string; name: string; imageUrl: string };

function formatLastSync(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PersonalSmilesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [sortType, setSortType] = useState<SortType>("count-desc");
  const [query, setQuery] = useState("");
  const [openedPlayers, setOpenedPlayers] = useState<Set<string>>(new Set());
  const playerElements = useRef<Map<string, HTMLElement>>(new Map());

  const itemCounts = useMemo(() => {
    const uniqueByOwner = new Map<string, Set<string>>();
    for (const item of personalItemsData.items as PersonalItem[]) {
      const ownerKey = item.owner.toLocaleLowerCase("ru");
      const itemKey = `${item.name.trim().toLocaleLowerCase("ru")}\u0000${item.imageUrl}`;
      const items = uniqueByOwner.get(ownerKey) ?? new Set<string>();
      items.add(itemKey);
      uniqueByOwner.set(ownerKey, items);
    }

    return new Map(
      [...uniqueByOwner.entries()].map(([owner, items]) => [owner, items.size]),
    );
  }, []);

  const players = useMemo(() => {
    const result = [...(personalSmilesData as PlayerWithSmiles[])];
    const q = query.trim().toLocaleLowerCase("uk");
    const filtered = q
      ? result.filter((player) => player.nick.toLocaleLowerCase("uk").includes(q))
      : result;

    if (sortType === "nick") {
      return filtered.sort((a, b) =>
        a.nick.localeCompare(b.nick, "uk", { sensitivity: "base" }),
      );
    }

    return filtered.sort((a, b) => {
      const difference =
        sortType === "count-desc"
          ? b.personalSmilesCount - a.personalSmilesCount
          : a.personalSmilesCount - b.personalSmilesCount;

      return (
        difference ||
        a.nick.localeCompare(b.nick, "uk", { sensitivity: "base" })
      );
    });
  }, [query, sortType]);

  function togglePlayer(cuid: string) {
    setOpenedPlayers((current) => {
      const next = new Set(current);
      if (next.has(cuid)) next.delete(cuid);
      else next.add(cuid);
      return next;
    });
  }

  useEffect(() => {
    const cuid = new URLSearchParams(window.location.search).get("player");
    if (!cuid) return;

    const selectedPlayer = (personalSmilesData as PlayerWithSmiles[]).find(
      (player) => player.cuid === cuid,
    );
    if (selectedPlayer) setQuery(selectedPlayer.nick);

    setOpenedPlayers((current) => new Set(current).add(cuid));

    window.setTimeout(() => {
      const element =
        playerElements.current.get(cuid) ?? document.getElementById(`player-${cuid}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }, []);

  function clearQuery() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  function openPlayerFromEvent(cuid: string) {
    setOpenedPlayers((current) => new Set(current).add(cuid));
    window.setTimeout(() => {
      playerElements.current
        .get(cuid)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroIcon}>🙂</div>
          <div>
            <h1>Особисті колекції смайликів</h1>
            <p className={styles.heroDescription}>
              Тут зібрані особисті смайлики гравців ДМ. Колекцію кожного гравця можна
              розгорнути та переглянути прямо на сторінці.
              <br />
              А кнопочка «Іменні речі» відкриє колекцію персональних зображень на речах. Обов'язково зазирніть - там є на що подивитися ;)
            </p>
            <p className={styles.updatedInline}>
              Оновлення даних: {formatLastSync(lastSync.updatedAt)}
            </p>
          </div>
        </header>

        <div className={styles.eventsBlock}>
          <EventsFeed
            scope="personal-smiles"
            variant="dark"
            onOpenPlayer={openPlayerFromEvent}
          />
        </div>

        <div className={styles.smileToolbar}>
          <div className={styles.stats}>
            <span>
              Знайдено колекцій: <b>{players.length}</b>
            </span>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Знайти гравця…"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Очистити пошук"
                  title="Очистити пошук"
                  className={styles.clearSearch}
                >
                  ×
                </button>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() =>
                  setSortType((current) =>
                    current === "count-desc" ? "count-asc" : "count-desc",
                  )
                }
                className={sortType !== "nick" ? styles.active : ""}
              >
                {sortType === "count-asc"
                  ? "Менше смайликів ▲"
                  : "Більше смайликів ▼"}
              </button>
              <button
                type="button"
                onClick={() => setSortType("nick")}
                className={sortType === "nick" ? styles.active : ""}
              >
                За ніком
              </button>
            </div>
          </div>
        </div>

        {players.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🙂</div>
            <p>Особисті смайлики поки не знайдені</p>
          </div>
        ) : (
          <div className={styles.groups}>
            {players.map((player) => {
              const isOpened = openedPlayers.has(player.cuid);
              const clanCrestUrl = player.clanId
                ? `https://dm-game.com/pics/clanpic/clan_${player.clanId}.gif`
                : "";

              return (
                <article
                  key={player.cuid}
                  id={`player-${player.cuid}`}
                  ref={(element) => {
                    if (element) playerElements.current.set(player.cuid, element);
                    else playerElements.current.delete(player.cuid);
                  }}
                  className={`${styles.group} ${styles.smileGroup}`}
                >
                  <div className={styles.groupHead}>
                    <div className={styles.smileOwner}>
                      <div className={styles.avatar}>
                        {player.nick.trim().charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2>
                          <a href={player.profileUrl} target="_blank" rel="noreferrer">
                            {player.nick} <small>↗</small>
                          </a>
                        </h2>
                        <p className={styles.ownerMeta}>
                          <span>{player.level} рівень</span>
                          {player.clanName && (
                            <span className={styles.clanMeta}>
                              {clanCrestUrl && (
                                <span className={styles.clanCrestBox}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={clanCrestUrl} alt="" width={19} height={19} />
                                </span>
                              )}
                              {player.clanName}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className={styles.groupActions}>
                      <strong>
                        {player.personalSmilesCount} смайликів
                      </strong>
                      <button
                        type="button"
                        onClick={() => togglePlayer(player.cuid)}
                        aria-expanded={isOpened}
                        className={styles.collectionLink}
                      >
                        {isOpened
                          ? "Сховати смайлики ↑"
                          : "Переглянути смайлики ↓"}
                      </button>
                      <Link
                        href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}
                        className={styles.collectionLink}
                      >
                        ⚔️ Іменні речі ({itemCounts.get(player.nick.toLocaleLowerCase("ru")) ?? 0})
                      </Link>
                    </div>
                  </div>

                  {isOpened && (
                    <div className={styles.smilePanel}>
                      <div className={styles.smileGrid}>
                        {player.personalSmiles.map((smileUrl, smileIndex) => (
                          <a
                            key={`${player.cuid}-${smileUrl}`}
                            href={smileUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={`Смайлик ${smileIndex + 1}`}
                            className={styles.smileCard}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={smileUrl}
                              alt={`Смайлик ${player.nick} ${smileIndex + 1}`}
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>

                      <div className={styles.smileExternal}>
                        <a href={player.smilesPageUrl} target="_blank" rel="noreferrer">
                          Відкрити колекцію на сайті гри ↗
                        </a>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
