"use client";

import { useEffect, useMemo, useState } from "react";

type RatingItem = { rank: number; name: string; level?: number; value: number | string };
type Rating = { title: string; valueLabel: string; items: RatingItem[] };
type RatingsData = { updatedAt?: string; ratings: Record<string, Rating> };

type Card = { key: string; label: string; icon: string; tone?: string; subtitle?: string };

const professions: Card[] = [
  { key: "fishing", label: "Рыболов", icon: "🎣" },
  { key: "collector", label: "Собиратель", icon: "🌿" },
  { key: "hunter", label: "Охотник", icon: "🏹" },
  { key: "blacksmith", label: "Кузнец", icon: "⚒" },
  { key: "leatherworker", label: "Кожевник", icon: "🛡" },
  { key: "doctor", label: "Лекарь", icon: "♥" },
  { key: "alchemy", label: "Алхимик", icon: "⚗" },
  { key: "enchanter", label: "Заклинатель", icon: "✦" },
  { key: "seer", label: "Ведун", icon: "🔮" },
  { key: "shooter", label: "Стрелок", icon: "◎" },
];

const general: Card[] = [
  { key: "players", label: "Рейтинг игроков", icon: "♛", tone: "burgundy", subtitle: "Опыт, победы над монстрами и игроками" },
  { key: "communities", label: "Рейтинг сообществ", icon: "🐾", tone: "blue", subtitle: "Кланы Древнего Мира" },
  { key: "achievements", label: "Рейтинг достижений", icon: "★", tone: "green", subtitle: "Лучшие игроки по очкам достижений" },
];

function rankMark(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

export default function RatingsClient({ data }: { data: RatingsData }) {
  const firstAvailable = professions.find((item) => data.ratings[item.key]?.items?.length)?.key ?? "fishing";
  const [active, setActive] = useState(firstAvailable);

  useEffect(() => {
    const key = window.location.hash.replace("#", "");
    if (key && data.ratings[key]) setActive(key);
  }, [data.ratings]);

  const rating = useMemo(() => data.ratings[active], [active, data.ratings]);

  function choose(key: string) {
    setActive(key);
    window.history.replaceState(null, "", `#${key}`);
    requestAnimationFrame(() => document.getElementById("rating-table")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="ratings-page">
      <section className="ratings-hero" aria-label="Зал Славы. Рейтинги.">
        <div className="ratings-hero-image" />
      </section>

      <div className="ratings-content">
        <p className="ratings-curious">Таааак.. что тут у нас интересненького...</p>

        <section className="ratings-section">
          <h2 className="ratings-section-title"><span>Лучшие в профессиях</span></h2>
          <div className="profession-grid">
            {professions.map((card) => (
              <button key={card.key} type="button" className={`profession-card ${active === card.key ? "is-active" : ""}`} onClick={() => choose(card.key)}>
                <span className="profession-icon" aria-hidden>{card.icon}</span>
                <span>{card.label}</span>
                <span className="rating-arrow" aria-hidden>→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="ratings-section">
          <h2 className="ratings-section-title"><span>Общие рейтинги</span></h2>
          <div className="general-grid">
            {general.map((card) => (
              <button key={card.key} type="button" className={`general-card general-${card.tone} ${active === card.key ? "is-active" : ""}`} onClick={() => choose(card.key)}>
                <span className="general-icon" aria-hidden>{card.icon}</span>
                <span className="general-copy"><strong>{card.label}</strong><small>{card.subtitle}</small></span>
                <span className="rating-arrow" aria-hidden>→</span>
              </button>
            ))}
          </div>
        </section>

        <section id="rating-table" className="rating-board">
          <div className="rating-board-head">
            <div>
              <p className="rating-board-kicker">Зал Славы</p>
              <h2>{rating?.title ?? "Рейтинг"}</h2>
            </div>
            <span className="rating-board-symbol" aria-hidden>{[...professions, ...general].find((item) => item.key === active)?.icon ?? "★"}</span>
          </div>

          {rating?.items?.length ? (
            <div className="rating-table-wrap">
              <table className="rating-table">
                <thead><tr><th>№</th><th>Ник</th><th>{rating.valueLabel}</th></tr></thead>
                <tbody>
                  {rating.items.map((item, index) => (
                    <tr key={`${item.rank}-${item.name}-${index}`}>
                      <td className="rank-cell">{rankMark(item.rank)}</td>
                      <td><a href={`https://dm-game.com/index.php?file=infouser&login=${encodeURIComponent(item.name)}`} target="_blank" rel="noreferrer">{item.name}{item.level ? <span className="level">[{item.level}]</span> : null}</a></td>
                      <td className="value-cell">{typeof item.value === "number" ? item.value.toLocaleString("ru-RU") : item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rating-empty">Данные этого рейтинга подтянутся при ближайшем обновлении.</div>
          )}
        </section>
      </div>
    </div>
  );
}
