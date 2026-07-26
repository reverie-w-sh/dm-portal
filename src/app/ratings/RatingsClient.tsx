"use client";

import { useEffect, useMemo, useState } from "react";

type RatingItem = { rank: number; name: string; level?: number; value: number | string };
type PlayerItem = { rank: number; name: string; level?: number; experience: string; experienceValue: number; monsterWins: number; playerWins: number };
type Rating = { title: string; valueLabel: string; items: RatingItem[] };
type RatingsData = { updatedAt?: string; ratings: Record<string, Rating>; players?: { title: string; items: PlayerItem[] } };
type Card = { key: string; label: string; image: string; tone?: string; subtitle?: string };
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
  { key: "players", label: "Рейтинг игроков", image: "/images/ratings/players.webp", tone: "burgundy", subtitle: "Опыт, победы над монстрами и игроками" },
  { key: "communities", label: "Рейтинг сообществ", image: "/images/ratings/communities.webp", tone: "blue", subtitle: "Кланы Древнего Мира" },
  { key: "achievements", label: "Рейтинг достижений", image: "/images/ratings/achievements.webp", tone: "green", subtitle: "Лучшие игроки по очкам достижений" },
];

function rankMark(rank: number) { return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank; }
function playerLink(name: string) { return `https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(name)}`; }

export default function RatingsClient({ data }: { data: RatingsData }) {
  const firstAvailable = professions.find((item) => data.ratings[item.key]?.items?.length)?.key ?? "fishing";
  const [active, setActive] = useState(firstAvailable);
  const [playerSort, setPlayerSort] = useState<PlayerSort>("experience");

  useEffect(() => {
    const key = window.location.hash.replace("#", "");
    if (key === "players" || data.ratings[key]) setActive(key);
  }, [data.ratings]);

  const rating = useMemo(() => data.ratings[active], [active, data.ratings]);
  const selectedCard = [...professions, ...general].find((item) => item.key === active);
  const players = useMemo(() => {
    const source = [...(data.players?.items ?? [])];
    const field = playerSort === "experience" ? "experienceValue" : playerSort;
    return source.sort((a, b) => b[field] - a[field] || b.experienceValue - a.experienceValue || a.name.localeCompare(b.name, "ru"));
  }, [data.players?.items, playerSort]);

  function choose(key: string) {
    setActive(key);
    window.history.replaceState(null, "", `#${key}`);
    requestAnimationFrame(() => document.getElementById("rating-table")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return <div className="ratings-page">
    <section className="ratings-hero" aria-label="Зал Славы. Рейтинги.">
      <div className="ratings-hero-image" />
    </section>

    <div className="ratings-content">
      <p className="ratings-curious">Таааак.. что тут у нас интересненького...</p>

      <section className="ratings-section">
        <h2 className="ratings-section-title"><span>Мастера своего дела</span></h2>
        <div className="profession-grid">
          {professions.map((card) => <button key={card.key} type="button" className={`profession-card ${active === card.key ? "is-active" : ""}`} onClick={() => choose(card.key)}>
            <span className="profession-art"><img src={card.image} alt="" /></span>
            <span className="profession-label">{card.label}</span>
            <span className="rating-arrow" aria-hidden>→</span>
          </button>)}
        </div>
      </section>


      <section className="ratings-section ratings-general-section">
        <h2 className="ratings-section-title"><span>Общие рейтинги</span></h2>
        <div className="general-grid">
          {general.map((card) => <button key={card.key} type="button" className={`general-card general-${card.tone} ${active === card.key ? "is-active" : ""}`} onClick={() => choose(card.key)}>
            <span className="general-emblem"><img src={card.image} alt="" /></span>
            <span className="general-copy"><strong>{card.label}</strong><small>{card.subtitle}</small></span>
            <span className="rating-arrow" aria-hidden>→</span>
          </button>)}
        </div>
      </section>

      <section id="rating-table" className="rating-board">
        <div className="rating-board-head">
          <div><p className="rating-board-kicker">Зал Славы</p><h2>{active === "players" ? "Рейтинг игроков" : rating?.title ?? "Рейтинг"}</h2></div>
          {selectedCard ? <span className="rating-board-symbol"><img src={selectedCard.image} alt="" /></span> : null}
        </div>

        {active === "players" ? <>
          <div className="player-sort" aria-label="Сортировка рейтинга игроков">
            <button type="button" className={playerSort === "experience" ? "is-active" : ""} onClick={() => setPlayerSort("experience")}>По опыту</button>
            <button type="button" className={playerSort === "monsterWins" ? "is-active" : ""} onClick={() => setPlayerSort("monsterWins")}>Победы над монстрами</button>
            <button type="button" className={playerSort === "playerWins" ? "is-active" : ""} onClick={() => setPlayerSort("playerWins")}>Победы над игроками</button>
          </div>
          {players.length ? <div className="rating-table-wrap"><table className="rating-table player-rating-table"><thead><tr><th>№</th><th>Ник</th><th>Опыт / след. ур.</th><th>Монстры</th><th>Игроки</th></tr></thead><tbody>{players.map((item, index) => <tr key={`${item.name}-${index}`}><td className="rank-cell">{rankMark(index + 1)}</td><td><a href={playerLink(item.name)} target="_blank" rel="noreferrer">{item.name}{item.level ? <span className="level">[{item.level}]</span> : null}</a></td><td className="value-cell">{item.experience}</td><td className="value-cell">{item.monsterWins.toLocaleString("ru-RU")}</td><td className="value-cell">{item.playerWins.toLocaleString("ru-RU")}</td></tr>)}</tbody></table></div> : <div className="rating-empty">Данные рейтинга игроков подтянутся при ближайшем обновлении.</div>}
        </> : rating?.items?.length ? <div className="rating-table-wrap"><table className="rating-table"><thead><tr><th>№</th><th>Ник</th><th>{rating.valueLabel}</th></tr></thead><tbody>{rating.items.map((item, index) => <tr key={`${item.rank}-${item.name}-${index}`}><td className="rank-cell">{rankMark(item.rank)}</td><td><a href={playerLink(item.name)} target="_blank" rel="noreferrer">{item.name}{item.level ? <span className="level">[{item.level}]</span> : null}</a></td><td className="value-cell">{typeof item.value === "number" ? item.value.toLocaleString("ru-RU") : item.value}</td></tr>)}</tbody></table></div> : <div className="rating-empty">Данные этого рейтинга подтянутся при ближайшем обновлении.</div>}
      </section>
    </div>
  </div>;
}
