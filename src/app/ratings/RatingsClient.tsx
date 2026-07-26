"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type RatingItem = { rank: number; name: string; level?: number; value: number | string };
type PlayerItem = {
  rank: number;
  name: string;
  level?: number;
  experience: string;
  experienceValue: number;
  monsterWins: number;
  playerWins: number;
};
type Rating = { title: string; valueLabel: string; items: RatingItem[] };
type RatingsData = {
  updatedAt?: string;
  ratings: Record<string, Rating>;
  players?: { title: string; items: PlayerItem[] };
};
type DirectoryEntry = { clanId?: string; clanName?: string; clanIcon?: string };
type PlayerDirectory = Record<string, DirectoryEntry>;
type Card = { key: string; label: string; image: string; subtitle?: string; tone?: "red" | "blue" | "green" };
type PlayerSort = "experience" | "monsterWins" | "playerWins";

const professions: Card[] = [
  { key: "fishing", label: "Рыболов", image: "/images/ratings/fishing.webp" },
  { key: "collector", label: "Собиратель", image: "/images/ratings/collector.webp" },
  { key: "hunter", label: "Охотник", image: "/images/ratings/hunter.webp" },
  { key: "blacksmith", label: "Кузнец", image: "/images/ratings/blacksmith.webp" },
  { key: "leatherworker", label: "Кожевник", image: "/images/ratings/leatherworker.webp" },
  { key: "doctor", label: "Лекарь", image: "/images/ratings/doctor.webp" },
  { key: "alchemy", label: "Алхимик", image: "/images/ratings/alchemy.webp" },
  { key: "enchanter", label: "Заклинатель", image: "/images/ratings/enchanter.webp" },
  { key: "seer", label: "Ведун", image: "/images/ratings/seer.webp" },
  { key: "shooter", label: "Стрелок", image: "/images/ratings/shooter.webp" },
];

const general: Card[] = [
  {
    key: "players",
    label: "Рейтинг игроков",
    image: "/images/ratings/players.webp",
    subtitle: "Опыт, победы над монстрами и игроками",
    tone: "red",
  },
  {
    key: "communities",
    label: "Рейтинг сообществ",
    image: "/images/ratings/communities.webp",
    subtitle: "Кланы Древнего Мира",
    tone: "blue",
  },
  {
    key: "achievements",
    label: "Рейтинг достижений",
    image: "/images/ratings/achievements.webp",
    subtitle: "Лучшие игроки по очкам достижений",
    tone: "green",
  },
];

function playerLink(name: string) {
  return `https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(name)}`;
}

function formatUpdate(value?: string) {
  if (!value) return "ещё не обновлялись";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function rankText(rank: number) {
  return rank.toLocaleString("ru-RU");
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="ratings-title-row">
      <span aria-hidden="true" />
      <strong>✦ {children} ✦</strong>
      <span aria-hidden="true" />
    </h2>
  );
}

export default function RatingsClient({
  data,
  playerDirectory,
}: {
  data: RatingsData;
  playerDirectory: PlayerDirectory;
}) {
  const firstAvailable =
    professions.find((item) => data.ratings[item.key]?.items?.length)?.key ?? "players";
  const [active, setActive] = useState(firstAvailable);
  const [playerSort, setPlayerSort] = useState<PlayerSort>("experience");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "players" || data.ratings[hash]) setActive(hash);
  }, [data.ratings]);

  const activeRating = data.ratings[active];
  const sortedPlayers = useMemo(() => {
    const list = [...(data.players?.items ?? [])];
    const field = playerSort === "experience" ? "experienceValue" : playerSort;
    return list.sort(
      (a, b) =>
        b[field] - a[field] ||
        b.experienceValue - a.experienceValue ||
        a.name.localeCompare(b.name, "ru"),
    );
  }, [data.players?.items, playerSort]);

  function selectRating(key: string) {
    setActive(key);
    window.history.replaceState(null, "", `#${key}`);
    requestAnimationFrame(() => {
      document.getElementById("ratings-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="ratings-shell">
      <section className="ratings-hero" aria-label="Зал Славы. Рейтинги.">
        <Image
          src="/images/ratings-hero.webp"
          alt="Зал Славы. Рейтинги."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </section>

      <div className="ratings-inner">
        <p className="ratings-subtitle">Таааак.. что тут у нас интересненького...</p>

        <section>
          <SectionTitle>Мастера своего дела</SectionTitle>
          <div className="ratings-profession-grid">
            {professions.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => selectRating(card.key)}
                className={`ratings-profession-card ${active === card.key ? "is-active" : ""}`}
                aria-pressed={active === card.key}
              >
                <Image src={card.image} alt="" width={150} height={150} className="ratings-profession-icon" />
                <span>{card.label}</span>
                <b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>

        <section className="ratings-general-block">
          <SectionTitle>Общие рейтинги</SectionTitle>
          <div className="ratings-general-grid">
            {general.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => selectRating(card.key)}
                className={`ratings-general-card ratings-general-${card.tone} ${active === card.key ? "is-active" : ""}`}
                aria-pressed={active === card.key}
              >
                <Image src={card.image} alt="" width={230} height={230} className="ratings-general-icon" />
                <strong>{card.label}</strong>
                <small>{card.subtitle}</small>
                <b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>

        <p className="ratings-updated">
          <span aria-hidden="true">◷</span>
          Данные обновляются каждые 6 часов. Последнее обновление: {formatUpdate(data.updatedAt)}
        </p>

        <section id="ratings-table" className="ratings-board">
          <nav className="ratings-tabs" aria-label="Общие рейтинги">
            {general.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => selectRating(card.key)}
                className={active === card.key ? "is-active" : ""}
              >
                {card.label}
              </button>
            ))}
          </nav>

          {active === "players" ? (
            <>
              <div className="ratings-player-sort" aria-label="Сортировка рейтинга игроков">
                <button className={playerSort === "experience" ? "is-active" : ""} onClick={() => setPlayerSort("experience")}>По опыту</button>
                <button className={playerSort === "monsterWins" ? "is-active" : ""} onClick={() => setPlayerSort("monsterWins")}>По победам над монстрами</button>
                <button className={playerSort === "playerWins" ? "is-active" : ""} onClick={() => setPlayerSort("playerWins")}>По победам над игроками</button>
              </div>
              <div className="ratings-table-wrap">
                <table className="ratings-table ratings-player-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Игрок</th>
                      <th>Уровень</th>
                      <th>Опыт</th>
                      <th>Победы над монстрами</th>
                      <th>Победы над игроками</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((player, index) => {
                      const directory = playerDirectory[player.name.toLocaleLowerCase("ru")];
                      const clanImage = directory?.clanId
                        ? `https://dm-game.com/pics/clanpic/clan_${directory.clanId}.gif`
                        : directory?.clanIcon
                          ? `https://dm-game.com/pics/clanpic/${directory.clanIcon}`
                          : null;
                      return (
                        <tr key={`${player.name}-${index}`}>
                          <td>{rankText(index + 1)}</td>
                          <td>
                            <a href={playerLink(player.name)} target="_blank" rel="noreferrer" className="ratings-player-name">
                              {clanImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={clanImage} alt={directory?.clanName ? `Клан ${directory.clanName}` : "Эмблема клана"} title={directory?.clanName} />
                              ) : (
                                <span className="ratings-no-clan" aria-hidden="true" />
                              )}
                              <span>{player.name}</span>
                            </a>
                          </td>
                          <td>{player.level ?? "—"}</td>
                          <td>{player.experience}</td>
                          <td>{player.monsterWins.toLocaleString("ru-RU")}</td>
                          <td>{player.playerWins.toLocaleString("ru-RU")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeRating?.items?.length ? (
            <div className="ratings-table-wrap">
              <table className="ratings-table">
                <thead>
                  <tr><th>#</th><th>Игрок</th><th>{activeRating.valueLabel}</th></tr>
                </thead>
                <tbody>
                  {activeRating.items.map((item) => (
                    <tr key={`${item.rank}-${item.name}`}>
                      <td>{rankText(item.rank)}</td>
                      <td><a href={playerLink(item.name)} target="_blank" rel="noreferrer">{item.name}{item.level ? ` [${item.level}]` : ""}</a></td>
                      <td>{typeof item.value === "number" ? item.value.toLocaleString("ru-RU") : item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ratings-empty">Данные этого рейтинга подтянутся при ближайшем обновлении.</p>
          )}
        </section>
      </div>
    </main>
  );
}
