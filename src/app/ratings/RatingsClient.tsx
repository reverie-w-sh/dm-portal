"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./RatingsClient.module.css";

type RatingItem = {
  rank?: number;
  name: string;
  nick?: string;
  login?: string;
  level?: number;
  value?: number | string;
  experience?: number;
  exp?: number;
  monsterWins?: number;
  winsMonsters?: number;
  monsters?: number;
  playerWins?: number;
  winsPlayers?: number;
  players?: number;
  clanIcon?: string;
  clanCrest?: string;
  clanCrestSmall?: string;
  crestSmall?: string;
  icon?: string;
  clan?: { icon?: string; crestSmall?: string };
};

type Rating = {
  title: string;
  valueLabel?: string;
  items: RatingItem[];
};

type RatingsData = {
  updatedAt?: string;
  ratings: Record<string, Rating>;
};

type Card = {
  key: string;
  label: string;
  image: string;
};

type PlayerSort = "experience" | "monsterWins" | "playerWins";

const professions: Card[] = [
  { key: "fishing", label: "Рыболов", image: "fishing.webp" },
  { key: "collector", label: "Собиратель", image: "collector.webp" },
  { key: "hunting", label: "Охотник", image: "hunting.webp" },
  { key: "blacksmith", label: "Кузнец", image: "blacksmith.webp" },
  { key: "leatherworker", label: "Кожевник", image: "leatherworker.webp" },
  { key: "doctor", label: "Лекарь", image: "doctor.webp" },
  { key: "alchemy", label: "Алхимик", image: "alchemy.webp" },
  { key: "enchanter", label: "Заклинатель", image: "enchanter.webp" },
  { key: "seer", label: "Ведун", image: "seer.webp" },
  { key: "shooter", label: "Стрелок", image: "shooter.webp" },
];

const general: Card[] = [
  { key: "players", label: "Рейтинг игроков", image: "players.webp" },
  { key: "communities", label: "Рейтинг сообществ", image: "communities.webp" },
  { key: "achievements", label: "Рейтинг достижений", image: "achievements.webp" },
];

const playerSortLabels: Record<PlayerSort, string> = {
  experience: "По опыту",
  monsterWins: "По победам над монстрами",
  playerWins: "По победам над игроками",
};

function numberFrom(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function playerValue(item: RatingItem, sort: PlayerSort) {
  if (sort === "experience") {
    return numberFrom(item.experience, item.exp, item.value);
  }
  if (sort === "monsterWins") {
    return numberFrom(item.monsterWins, item.winsMonsters, item.monsters);
  }
  return numberFrom(item.playerWins, item.winsPlayers, item.players);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function directoryPlayer(
  directory: unknown,
  playerName: string,
): Partial<RatingItem> | undefined {
  const normalizedName = playerName.trim().toLocaleLowerCase("ru-RU");

  function isSamePlayer(value: unknown) {
    if (!isRecord(value)) return false;
    const candidate = value.name ?? value.nick ?? value.login;
    return (
      typeof candidate === "string" &&
      candidate.trim().toLocaleLowerCase("ru-RU") === normalizedName
    );
  }

  if (Array.isArray(directory)) {
    return directory.find(isSamePlayer) as Partial<RatingItem> | undefined;
  }

  if (!isRecord(directory)) return undefined;

  const direct =
    directory[playerName] ??
    directory[normalizedName] ??
    Object.entries(directory).find(
      ([key]) => key.trim().toLocaleLowerCase("ru-RU") === normalizedName,
    )?.[1];

  if (isRecord(direct)) return direct as Partial<RatingItem>;

  return Object.values(directory).find(isSamePlayer) as
    | Partial<RatingItem>
    | undefined;
}

function clanIcon(
  item: RatingItem,
  directoryItem?: Partial<RatingItem>,
) {
  for (const source of [item, directoryItem]) {
    if (!source) continue;
    const icon =
      source.clanIcon ??
      source.clanCrest ??
      source.clanCrestSmall ??
      source.crestSmall ??
      source.clan?.crestSmall ??
      source.clan?.icon ??
      source.icon;
    if (icon) return icon;
  }
  return undefined;
}

function formatValue(value: number | string | undefined) {
  if (typeof value === "number") return value.toLocaleString("ru-RU");
  return value ?? "—";
}

export default function RatingsClient({
  data,
  playerDirectory,
}: {
  data: RatingsData;
  playerDirectory?: unknown;
}) {
  const firstProfession =
    professions.find((item) => data.ratings[item.key]?.items?.length)?.key ??
    "fishing";
  const firstAvailable = data.ratings.players?.items?.length
    ? "players"
    : firstProfession;

  const [active, setActive] = useState(firstAvailable);
  const [playerSort, setPlayerSort] = useState<PlayerSort>("experience");

  useEffect(() => {
    const key = window.location.hash.replace("#", "");
    if (key && data.ratings[key]) setActive(key);
  }, [data.ratings]);

  const rating = data.ratings[active];
  const playerItems = useMemo(() => {
    if (active !== "players" || !rating?.items) return [];
    return [...rating.items].sort(
      (a, b) => playerValue(b, playerSort) - playerValue(a, playerSort),
    );
  }, [active, playerSort, rating]);

  function choose(key: string) {
    setActive(key);
    window.history.replaceState(null, "", `#${key}`);
    requestAnimationFrame(() => {
      document
        .getElementById("rating-table")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <picture>
          <source
            media="(max-width: 700px)"
            srcSet="/images/ratings/hero-mobile.webp"
          />
          <img
            src="/images/ratings/hero-desktop.webp"
            alt=""
            width={1089}
            height={287}
          />
        </picture>
        <h1 className={styles.mobileTitle}>Зал Славы. Рейтинги.</h1>
      </section>

      <div className={styles.content}>
        <p className={styles.curiosity}>
          Таааак.. что тут у нас интересненького...
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Мастера своего дела</h2>
          <div className={styles.professionGrid}>
            {professions.map((card) => (
              <button
                key={card.key}
                type="button"
                aria-label={`Открыть рейтинг: ${card.label}`}
                aria-pressed={active === card.key}
                className={`${styles.imageButton} ${
                  active === card.key ? styles.active : ""
                }`}
                onClick={() => choose(card.key)}
              >
                <img
                  src={`/images/ratings/cards/${card.image}`}
                  alt=""
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Общие рейтинги</h2>
          <div className={styles.generalGrid}>
            {general.map((card) => (
              <button
                key={card.key}
                type="button"
                aria-label={`Открыть: ${card.label}`}
                aria-pressed={active === card.key}
                className={`${styles.imageButton} ${styles.generalButton} ${
                  active === card.key ? styles.active : ""
                }`}
                onClick={() => choose(card.key)}
              >
                <img
                  src={`/images/ratings/cards/${card.image}`}
                  alt=""
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </section>

        <section id="rating-table" className={styles.board}>
          <div className={styles.boardHead}>
            <div>
              <span>Зал Славы</span>
              <h2>{rating?.title ?? "Рейтинг"}</h2>
            </div>
            {active === "players" ? (
              <div className={styles.sorts}>
                {(Object.keys(playerSortLabels) as PlayerSort[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={playerSort === key ? styles.sortActive : ""}
                    onClick={() => setPlayerSort(key)}
                  >
                    {playerSortLabels[key]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {rating?.items?.length ? (
            <div className={styles.tableWrap}>
              {active === "players" ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Игрок</th>
                      <th>Уровень</th>
                      <th>Опыт</th>
                      <th>Победы над монстрами</th>
                      <th>Победы над игроками</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerItems.map((item, index) => {
                      const crest = clanIcon(
                        item,
                        directoryPlayer(playerDirectory, item.name),
                      );
                      return (
                        <tr key={`${item.name}-${index}`}>
                          <td>{index + 1}</td>
                          <td>
                            <a
                              className={styles.player}
                              href={`https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {crest ? (
                                <img src={crest} alt="" width={19} height={19} />
                              ) : (
                                <span className={styles.emptyCrest} />
                              )}
                              {item.name}
                            </a>
                          </td>
                          <td>{item.level ?? "—"}</td>
                          <td>
                            {playerValue(item, "experience").toLocaleString(
                              "ru-RU",
                            )}
                          </td>
                          <td>
                            {playerValue(item, "monsterWins").toLocaleString(
                              "ru-RU",
                            )}
                          </td>
                          <td>
                            {playerValue(item, "playerWins").toLocaleString(
                              "ru-RU",
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Игрок</th>
                      <th>Уровень</th>
                      <th>{rating.valueLabel ?? "Очки"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rating.items.map((item, index) => {
                      const crest = clanIcon(
                        item,
                        directoryPlayer(playerDirectory, item.name),
                      );
                      return (
                        <tr key={`${item.name}-${index}`}>
                          <td>{item.rank ?? index + 1}</td>
                          <td>
                            <a
                              className={styles.player}
                              href={`https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {crest ? (
                                <img src={crest} alt="" width={19} height={19} />
                              ) : null}
                              {item.name}
                            </a>
                          </td>
                          <td>{item.level ?? "—"}</td>
                          <td>{formatValue(item.value)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <p className={styles.empty}>
              Данные этого рейтинга подтянутся при ближайшем обновлении.
            </p>
          )}
        </section>

        {data.updatedAt ? (
          <p className={styles.updated}>
            Данные обновляются каждые 6 часов. Последнее обновление:{" "}
            {new Date(data.updatedAt).toLocaleString("ru-RU")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
