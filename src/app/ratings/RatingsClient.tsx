"use client";

import { useEffect, useMemo, useState } from "react";
import { getExperienceProgress } from "@/lib/experience";
import styles from "./RatingsClient.module.css";

type RatingItem = {
  rank?: number;
  name: string;
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
  icon: string;
  subtitle?: string;
  tone?: "red" | "blue" | "green";
};

type PlayerSort = "experience" | "monsterWins" | "playerWins";
type CommunitySort = "victories" | "ratio" | "date";
const professions: Card[] = [
  { key: "fishing", label: "Рыболов", icon: "fishing.png" },
  { key: "collector", label: "Собиратель", icon: "collector.png" },
  { key: "hunting", label: "Охотник", icon: "hunting.png" },
  { key: "blacksmith", label: "Кузнец", icon: "blacksmith.png" },
  { key: "leatherworker", label: "Кожевник", icon: "leatherworker.png" },
  { key: "doctor", label: "Лекарь", icon: "doctor.png" },
  { key: "alchemy", label: "Алхимик", icon: "alchemy.png" },
  { key: "enchanter", label: "Заклинатель", icon: "enchanter.png" },
  { key: "seer", label: "Ведун", icon: "seer.png" },
  { key: "shooter", label: "Стрелок", icon: "shooter.png" },
];
const general: Card[] = [
  {
    key: "players",
    label: "Рейтинг игроков",
    subtitle: "Опыт, победы над монстрами и игроками",
    icon: "players.png",
    tone: "red",
  },
  {
    key: "communities",
    label: "Рейтинг сообществ",
    subtitle: "Кланы Древнего Мира",
    icon: "communities.png",
    tone: "blue",
  },
  {
    key: "achievements",
    label: "Рейтинг достижений",
    subtitle: "Лучшие игроки по очкам достижений",
    icon: "achievements.png",
    tone: "green",
  },
];
const playerSortLabels: Record<PlayerSort, string> = {
  experience: "По опыту",
  monsterWins: "По победам над монстрами",
  playerWins: "По победам над игроками",
};

const playerColumnLabels: Record<PlayerSort, string> = {
  experience: "Опыт",
  monsterWins: "Победы над монстрами",
  playerWins: "Победы над игроками",
};

const communitySortLabels: Record<CommunitySort, string> = {
  victories: "По количеству побед",
  ratio: "По соотношению побед и поражений",
  date: "По дате создания",
};
const communityRatingKeys: Record<CommunitySort, string> = {
  victories: "communitiesVictories",
  ratio: "communitiesRatio",
  date: "communitiesDate",
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
function optionalNumberFrom(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/[^\d-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function buildDirectoryLevelMap(directory: unknown) {
  const levels = new Map<string, number>();
  const visited = new WeakSet<object>();

  function walk(value: unknown, fallbackName?: string) {
    if (Array.isArray(value)) {
      if (visited.has(value)) return;
      visited.add(value);
      value.forEach((entry) => walk(entry));
      return;
    }
    if (!isRecord(value) || visited.has(value)) return;
    visited.add(value);
    const name = String(
      value.name ??
        value.nick ??
        value.nickname ??
        value.login ??
        fallbackName ??
        "",
    )
      .trim()
      .toLocaleLowerCase("ru-RU");
    const level = optionalNumberFrom(value.level, value.lvl, value.userLevel);
    if (name && level != null) levels.set(name, level);

    for (const [key, nested] of Object.entries(value)) {
      walk(nested, key);
    }
  }

  walk(directory);
  return levels;
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

function playerExperience(item: RatingItem) {
  return optionalNumberFrom(item.experience, item.exp);
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
  const [communitySort, setCommunitySort] =
    useState<CommunitySort>("victories");
  const directoryLevels = useMemo(
    () => buildDirectoryLevelMap(playerDirectory),
    [playerDirectory],
  );

  useEffect(() => {
    const key = window.location.hash.replace("#", "");
    if (key && data.ratings[key]) setActive(key);
  }, [data.ratings]);
  const ratingKey =
    active === "communities" ? communityRatingKeys[communitySort] : active;
  const rating =
    data.ratings[ratingKey] ??
    (active === "communities" ? data.ratings.communities : undefined);
  const displayedItems = useMemo(() => {
    if (!rating?.items) return [];
    if (active !== "players") return rating.items;
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

  function itemValue(item: RatingItem) {
    return active === "players" ? playerValue(item, playerSort) : item.value;
  }
  const boardTitle =
    active === "shooter"
      ? "Лучшие производители болтов"
      : (rating?.title ?? "Рейтинг");
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
          <h2 className={styles.sectionTitle}>
            <span className={styles.desktopHeading}>Мастера своего дела</span>
            <span className={styles.mobileHeading}>Лучшие в профессиях</span>
          </h2>
          <div className={styles.professionGrid}>
            {professions.map((card) => (
              <button
                key={card.key}
                type="button"
                aria-label={`Открыть рейтинг: ${card.label}`}
                aria-pressed={active === card.key}
                className={`${styles.cardButton} ${
                  active === card.key ? styles.active : ""
                }`}
                onClick={() => choose(card.key)}
              >
                <span className={styles.professionInner}>
                  <img
                    src={`/images/ratings/icons/${card.icon}`}
                    alt=""
                    loading="lazy"
                  />
                  <span className={styles.professionLabel}>{card.label}</span>
                  <span className={styles.arrow} aria-hidden>
                    →
                  </span>
                </span>
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
                className={`${styles.cardButton} ${styles.generalButton} ${
                  styles[`tone${card.tone}`]
                } ${active === card.key ? styles.active : ""}`}
                onClick={() => choose(card.key)}
              >
                <span className={styles.generalInner}>
                  <img
                    src={`/images/ratings/icons/${card.icon}`}
                    alt=""
                    loading="lazy"
                  />
                  <span className={styles.generalCopy}>
                    <strong>{card.label}</strong>
                    <small>{card.subtitle}</small>
                  </span>
                  <span className={styles.arrow} aria-hidden>
                    →
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section id="rating-table" className={styles.board}>
          <div className={styles.boardHead}>
            <div>
              <span>Зал Славы</span>
              <h2>{boardTitle}</h2>
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
            ) : active === "communities" ? (
              <div className={styles.sorts}>
                {(Object.keys(communitySortLabels) as CommunitySort[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      className={communitySort === key ? styles.sortActive : ""}
                      onClick={() => setCommunitySort(key)}
                    >
                      {communitySortLabels[key]}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
          {displayedItems.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Ник</th>
                    <th>
                      <span className={styles.desktopValueLabel}>
                        {active === "players"
                          ? playerColumnLabels[playerSort]
                          : (rating?.valueLabel ?? "Очки")}
                      </span>
                      <span className={styles.mobileValueLabel}>
                        {active === "communities"
                          ? (rating?.valueLabel ?? "Значение")
                          : "Очки"}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((item, index) => {
                    const experience =
                      active === "players" ? playerExperience(item) : undefined;
                    const calculated =
                      experience != null
                        ? getExperienceProgress(experience)
                        : undefined;
                    const level =
                      calculated?.level ??
                      item.level ??
                      directoryLevels.get(
                        item.name.trim().toLocaleLowerCase("ru-RU"),
                      );
                    const name = (
                      <>
                        {item.name}
                        {level != null ? (
                          <span className={styles.level}>
                            [
                            {active === "players" && calculated
                              ? `${calculated.level}, ${calculated.up} ап`
                              : level}
                            ]
                          </span>
                        ) : null}
                      </>
                    );
                    return (
                      <tr key={`${item.name}-${index}`}>
                        <td>
                          {active === "players"
                            ? index + 1
                            : (item.rank ?? index + 1)}
                        </td>
                        <td>
                          {active === "communities" ? (
                            <span className={styles.player}>{name}</span>
                          ) : (
                            <a
                              className={styles.player}
                              href={`https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {name}
                            </a>
                          )}
                        </td>
                        <td>{formatValue(itemValue(item))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
