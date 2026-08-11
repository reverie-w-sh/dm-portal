"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import eventsJson from "../../../data/events.json";
import gameNewsJson from "../../../data/game-news.json";
import clansJson from "../../../data/clans.json";
import playersJson from "../../../data/players.json";
import lastSyncJson from "../../../data/last-sync.json";
import collectionStyles from "../collection-pages.module.css";
import styles from "./page.module.css";

type ChronicleEvent = {
  id: string;
  syncId: string;
  createdAt: string;
  scope: "clans" | "personal-smiles";
  type: string;
  characterId?: string;
  characterName?: string;
  profileUrl?: string;
  clanId?: string;
  clanName?: string;
  oldClanId?: string;
  oldClanName?: string;
  newClanId?: string;
  newClanName?: string;
  oldPosition?: string;
  newPosition?: string;
  partnerName?: string;
  marriageSince?: string;
  amount?: number;
  oldCount?: number;
  newCount?: number;
  oldLevel?: number | null;
  newLevel?: number;
  addedSmiles?: string[];
};

type Clan = {
  clanId: string;
  name: string;
  crestSmall?: string;
};

type Player = {
  cuid: string;
  clanId?: string;
  clanName?: string;
};

type GameNewsComment = {
  author: string;
  date: string;
  body: string;
  profileUrl?: string;
  isSystemResult: boolean;
};

type FestivalType =
  | "all"
  | "fisher"
  | "gatherer"
  | "hunter"
  | "andvari"
  | "blacksmith"
  | "fighters"
  | "labyrinth"
  | "familiar"
  | "bouquets"
  | "blood"
  | "easter"
  | "pumpkin"
  | "other";

type BossType =
  | "all"
  | "cupid"
  | "gorgon"
  | "clown"
  | "zaya"
  | "neuch"
  | "rudi"
  | "pumpkin"
  | "snowman"
  | "other";

type GameNewsItem = {
  id: string;
  tid: string;
  title: string;
  publishedAt: string;
  createdAt: string;
  body: string;
  sourceUrl: string;
  category: "festival" | "boss" | "other";
  festivalType?: Exclude<FestivalType, "all">;
  bossType?: Exclude<BossType, "all">;
  commentCount: number;
  comments: GameNewsComment[];
  synthetic?: boolean;
  periodLabel?: string;
  resultText?: string;
};

type Category =
  | "all"
  | "levels"
  | "clans"
  | "love"
  | "smiles"
  | "festivals"
  | "bosses"
  | "game-news";
type Period = "7" | "30" | "90" | "all";
type TimelineItem = ChronicleEvent | GameNewsItem;

const events = eventsJson as ChronicleEvent[];
const gameNews = gameNewsJson.items as GameNewsItem[];
const clans = clansJson as Clan[];
const players = playersJson as Player[];
const dataNow = new Date(lastSyncJson.updatedAt);
const dataNowTime = dataNow.getTime();

const CATEGORY_LABELS: Array<{ key: Category; label: string }> = [
  { key: "all", label: "Все" },
  { key: "levels", label: "Уровни" },
  { key: "clans", label: "Кланы" },
  { key: "love", label: "Любовь" },
  { key: "smiles", label: "Смайлики" },
  { key: "festivals", label: "Фестивали" },
  { key: "bosses", label: "Бои с боссами" },
  { key: "game-news", label: "Другие новости" },
];

const FESTIVAL_LABELS: Array<{ key: FestivalType; label: string }> = [
  { key: "all", label: "Все фестивали" },
  { key: "fisher", label: "Рыбака" },
  { key: "gatherer", label: "Собирателя" },
  { key: "hunter", label: "Охотника" },
  { key: "andvari", label: "Андвари" },
  { key: "blacksmith", label: "Кузнеца" },
  { key: "fighters", label: "Бойцов" },
  { key: "labyrinth", label: "Лабиринта" },
  { key: "familiar", label: "Фамильяра" },
  { key: "bouquets", label: "Букетов" },
  { key: "blood", label: "Крови" },
  { key: "easter", label: "Пасхальный" },
  { key: "pumpkin", label: "Безумная тыква" },
];

const BOSS_LABELS: Array<{ key: BossType; label: string }> = [
  { key: "all", label: "Все боссы" },
  { key: "cupid", label: "Купидон" },
  { key: "gorgon", label: "Горгона" },
  { key: "clown", label: "Клоун" },
  { key: "zaya", label: "Зая" },
  { key: "neuch", label: "Неуч" },
  { key: "rudi", label: "Тень Руди" },
  { key: "pumpkin", label: "Тыква" },
  { key: "snowman", label: "Снеговик" },
  { key: "other", label: "Другие" },
];

const PERIOD_LABELS: Array<{ key: Period; label: string }> = [
  { key: "7", label: "7 дней" },
  { key: "30", label: "30 дней" },
  { key: "90", label: "90 дней" },
  { key: "all", label: "Всё время" },
];

const POSITION_EVENT = "player_position_changed";

function isGameNews(item: TimelineItem): item is GameNewsItem {
  return "sourceUrl" in item && "publishedAt" in item;
}

function matchesNickSearch(item: TimelineItem, query: string): boolean {
  if (!query) return true;

  if (!isGameNews(item)) {
    return [item.characterName, item.partnerName].some((value) =>
      value?.toLocaleLowerCase("ru-RU").includes(query),
    );
  }

  return [
    item.title,
    item.body,
    item.resultText,
    ...item.comments.flatMap((comment) => [comment.author, comment.body]),
  ].some((value) => value?.toLocaleLowerCase("ru-RU").includes(query));
}

function categoryFor(event: ChronicleEvent): Category | "positions" | "other" {
  if (
    event.type === "player_level_up" ||
    event.type === "player_reincarnation_level_up"
  ) {
    return "levels";
  }

  if (
    event.type === "player_joined_clan" ||
    event.type === "player_left_clan" ||
    event.type === "player_changed_clan"
  ) {
    return "clans";
  }

  if (event.type === POSITION_EVENT) return "positions";

  if (event.type === "player_married" || event.type === "player_divorced") {
    return "love";
  }

  if (event.type === "clan_smile_added" || event.type === "personal_smile_added") {
    return "smiles";
  }

  return "other";
}

function categoryForItem(item: TimelineItem): Category | "positions" | "other" {
  if (!isGameNews(item)) return categoryFor(item);
  if (item.category === "festival") return "festivals";
  if (item.category === "boss") return "bosses";
  return "game-news";
}

function winnerComments(news: GameNewsItem): GameNewsComment[] {
  return news.comments.filter(
    (comment) => {
      const scoreRows = comment.body.match(/\[[0-9]+\]\s+\[[0-9]+\]/g)?.length ?? 0;
      return (
        comment.isSystemResult ||
        scoreRows >= 3 ||
        /победител|получил|награ|медал|приз|рейтинг\s+топ|топ\s*\d/i.test(
          comment.body,
        )
      );
    },
  );
}

function isOurClan(name?: string): boolean {
  return name?.trim().toLocaleLowerCase("de-DE") === "die wölfchen";
}

function smileWord(amount: number): string {
  const lastTwo = amount % 100;
  const last = amount % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "смайликов";
  if (last === 1) return "смайлик";
  if (last >= 2 && last <= 4) return "смайлика";
  return "смайликов";
}

function CharacterLink({ event }: { event: ChronicleEvent }) {
  if (!event.characterName) return null;

  if (!event.profileUrl) {
    return <strong className={styles.character}>{event.characterName}</strong>;
  }

  return (
    <a
      href={event.profileUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.character}
    >
      {event.characterName}
    </a>
  );
}

function ClanLink({ id, name }: { id?: string; name?: string }) {
  if (!name) return null;

  return id ? (
    <Link href={`/clans/${id}`} className={styles.clanLink}>
      {name}
    </Link>
  ) : (
    <strong className={styles.clanLink}>{name}</strong>
  );
}

function eventClanName(event: ChronicleEvent, playersById: Map<string, Player>) {
  if (event.clanName) return event.clanName;
  if (event.newClanName) return event.newClanName;
  if (event.characterId) return playersById.get(event.characterId)?.clanName;
  return undefined;
}

function eventIcon(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
      return "★";
    case "player_reincarnation_level_up":
      return "✦";
    case "player_joined_clan":
      return "→";
    case "player_left_clan":
      return "←";
    case "player_married":
      return "♥";
    case "player_divorced":
      return "💔";
    case "personal_smile_added":
      return "☺";
    case "clan_smile_added":
      return "☻";
    case POSITION_EVENT:
      return "♜";
    default:
      return "•";
  }
}

function itemIcon(item: TimelineItem): string {
  if (!isGameNews(item)) return eventIcon(item);
  if (item.category === "festival") return "✦";
  if (item.category === "boss") return "⚔";
  return "";
}

function ScrollIcon() {
  return (
    <svg
      className={styles.scrollIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
      <path d="M10 8h5M10 12h5" />
    </svg>
  );
}

function iconClass(category: ReturnType<typeof categoryFor>): string {
  switch (category) {
    case "levels":
      return styles.icon_levels;
    case "clans":
      return styles.icon_clans;
    case "love":
      return styles.icon_love;
    case "smiles":
      return styles.icon_smiles;
    case "festivals":
      return styles.icon_festivals;
    case "bosses":
      return styles.icon_bosses;
    case "game-news":
      return styles.icon_news;
    case "positions":
      return styles.icon_positions;
    default:
      return "";
  }
}

function EventText({
  event,
  playersById,
}: {
  event: ChronicleEvent;
  playersById: Map<string, Player>;
}) {
  const clanName = eventClanName(event, playersById);
  const our = isOurClan(clanName);

  switch (event.type) {
    case "player_level_up":
      return (
        <>
          {our && <span className={styles.celebration}>🎉 </span>}
          Поздравляем <CharacterLink event={event} /> с новым уровнем.
          {event.newLevel != null && (
            <span className={styles.valueBadge}> {event.newLevel}</span>
          )}
        </>
      );

    case "player_reincarnation_level_up":
      return (
        <>
          {our && <span className={styles.celebration}>⭐ </span>}
          Поздравляем <CharacterLink event={event} /> с новым уровнем реника.
          {event.newLevel != null && (
            <span className={styles.valueBadge}> {event.newLevel}</span>
          )}
        </>
      );

    case "player_joined_clan":
      return (
        <>
          <CharacterLink event={event} /> теперь в клане{" "}
          <ClanLink id={event.clanId} name={event.clanName} />.
        </>
      );

    case "player_left_clan":
      return (
        <>
          <CharacterLink event={event} /> больше не состоит в клане{" "}
          <ClanLink id={event.clanId} name={event.clanName} />.
        </>
      );

    case "player_changed_clan":
      return (
        <>
          <CharacterLink event={event} /> перешёл из клана{" "}
          <ClanLink id={event.oldClanId} name={event.oldClanName} /> в{" "}
          <ClanLink id={event.newClanId} name={event.newClanName} />.
        </>
      );

    case "player_married":
      return (
        <>
          {our && <span className={styles.celebration}>💍 </span>}
          Поздравляем <CharacterLink event={event} /> и{" "}
          <strong className={styles.partner}>{event.partnerName}</strong> со свадьбой.
        </>
      );

    case "player_divorced":
      return (
        <>
          Развод: <CharacterLink event={event} /> и{" "}
          <strong className={styles.partner}>{event.partnerName}</strong>.
        </>
      );

    case "clan_smile_added": {
      const amount = event.amount ?? 1;
      return (
        <>
          У клана <ClanLink id={event.clanId} name={event.clanName} /> появился{" "}
          {amount === 1 ? "новый смайлик" : `${amount} новых ${smileWord(amount)}`}.
        </>
      );
    }

    case "personal_smile_added": {
      const amount = event.amount ?? 1;
      return (
        <>
          {our && <span className={styles.celebration}>😊 </span>}
          У <CharacterLink event={event} /> появился{" "}
          {amount === 1
            ? "новый личный смайлик"
            : `${amount} новых личных ${smileWord(amount)}`}.
        </>
      );
    }

    case POSITION_EVENT:
      return (
        <>
          <CharacterLink event={event} /> в клане{" "}
          <ClanLink id={event.clanId} name={event.clanName} />: должность{" "}
          <span className={styles.oldValue}>{event.oldPosition || "—"}</span>
          <span className={styles.arrow}> → </span>
          <strong>{event.newPosition || "—"}</strong>.
        </>
      );

    default:
      return <>Событие в Древнем Мире.</>;
  }
}

function NewsText({ news }: { news: GameNewsItem }) {
  const results = winnerComments(news);
  const hasResults = Boolean(news.resultText) || results.length > 0;
  const isResultOnlyNews =
    Boolean(news.resultText) && /^(?:итог|результат)/i.test(news.title);
  const body = news.body.trim();
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean);
  const firstParagraph = paragraphs[0]?.trim() ?? "";
  const isEasterBoss = /бой с пасхальн[^\n]*за/i.test(news.title);
  const easterMarker = isEasterBoss
    ? /(?:c|с)\s*\d{2}\.\d{2}\.\d{4}\s+крашенки\s*:/i.exec(body)
    : null;
  const introParagraphs = paragraphs
    .slice(0, 2)
    .map((paragraph) => paragraph.trim())
    .join("\n\n");
  const preferredPreview =
    easterMarker?.index != null
      ? body.slice(0, easterMarker.index + easterMarker[0].length).trim()
      : introParagraphs && introParagraphs.length <= 320
      ? introParagraphs
      : firstParagraph && firstParagraph.length <= 280
        ? firstParagraph
        : body;
  const preview =
    preferredPreview.length > 280
      ? `${preferredPreview.slice(0, 277).trimEnd()}…`
      : preferredPreview;
  const isLong = body.length > preview.length;

  return (
    <div className={styles.newsBlock}>
      <div className={styles.newsHeading}>
        <a
          href={news.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.newsTitle}
        >
          {news.title}
        </a>
        <span className={styles.newsTag}>
          {news.category === "festival"
            ? "Фестиваль"
            : news.category === "boss"
              ? "Бой с боссом"
              : "Новости ДМ"}
        </span>
      </div>

      {news.periodLabel && (
        <div className={styles.newsPeriod}>{news.periodLabel}</div>
      )}

      {!isResultOnlyNews && preview && (
        <p className={styles.newsPreview}>{preview}</p>
      )}

      {!isResultOnlyNews && isLong && (
        <details className={styles.newsDetails}>
          <summary>Читать полностью</summary>
          <div className={styles.newsFullText}>{body}</div>
        </details>
      )}

      {hasResults && (
        <details className={`${styles.newsDetails} ${styles.winnersDetails}`}>
          <summary>Победители и призы</summary>
          <div className={styles.winnersList}>
            {news.resultText && (
              <div className={styles.winnerResult}>{news.resultText}</div>
            )}
            {results.map((comment, index) => (
              <div
                key={`${news.id}-result-${index}`}
                className={styles.winnerResult}
              >
                {comment.date && (
                  <span className={styles.resultDate}>{comment.date}</span>
                )}
                <div>{comment.body}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function dayLabel(value: string): string {
  const date = new Date(value);
  const today = new Date(
    dataNow.getFullYear(),
    dataNow.getMonth(),
    dataNow.getDate(),
  ).getTime();
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const difference = Math.round((today - day) / 86_400_000);

  if (difference === 0) return "Сегодня";
  if (difference === 1) return "Вчера";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChronicleClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [category, setCategory] = useState<Category>("all");
  const [festivalType, setFestivalType] = useState<FestivalType>("all");
  const [bossType, setBossType] = useState<BossType>("all");
  const [query, setQuery] = useState(initialQuery);
  const [period, setPeriod] = useState<Period>("30");
  const [showPositions, setShowPositions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  const playersById = useMemo(
    () => new Map(players.map((player) => [player.cuid, player])),
    [],
  );

  const clansById = useMemo(
    () => new Map(clans.map((clan) => [clan.clanId, clan])),
    [],
  );

  const filtered = useMemo(() => {
    const periodStart =
      period === "all" ? 0 : dataNowTime - Number(period) * 86_400_000;
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");

    return ([...events, ...gameNews] as TimelineItem[])
      .filter(
        (item) => isGameNews(item) || item.type !== "personal_item_added",
      )
      .filter(
        (item) =>
          isGameNews(item) || showPositions || item.type !== POSITION_EVENT,
      )
      .filter(
        (item) => {
          if (category === "all") return true;
          if (category === "bosses" && isGameNews(item)) {
            return item.category === "boss" || Boolean(item.bossType);
          }
          return categoryForItem(item) === category;
        },
      )
      .filter(
        (item) =>
          category !== "festivals" ||
          festivalType === "all" ||
          (isGameNews(item) && item.festivalType === festivalType),
      )
      .filter(
        (item) =>
          category !== "bosses" ||
          bossType === "all" ||
          (isGameNews(item) && item.bossType === bossType),
      )
      .filter((item) => matchesNickSearch(item, normalizedQuery))
      .filter((item) => new Date(item.createdAt).getTime() >= periodStart)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [bossType, category, festivalType, period, query, showPositions]);

  const visibleEvents = filtered.slice(0, visibleCount);
  const groups = visibleEvents.reduce<Array<{ key: string; date: string; events: TimelineItem[] }>>(
    (result, item) => {
      const key = dayKey(item.createdAt);
      const last = result[result.length - 1];

      if (last?.key === key) {
        last.events.push(item);
      } else {
        result.push({ key, date: item.createdAt, events: [item] });
      }

      return result;
    },
    [],
  );

  function chooseCategory(next: Category) {
    setCategory(next);
    if (next !== "festivals") setFestivalType("all");
    if (next !== "bosses") setBossType("all");
    setVisibleCount(36);
  }

  function choosePeriod(next: Period) {
    setPeriod(next);
    setVisibleCount(36);
  }

  return (
    <div className={styles.content}>
      <section className={styles.filters} aria-label="Фильтры летописи">
        <div className={`${styles.filterRow} ${styles.searchRow}`}>
          <label className={styles.filterLabel} htmlFor="chronicle-nick-search">
            Поиск
          </label>
          <div className={styles.searchWrap}>
            <input
              id="chronicle-nick-search"
              type="search"
              value={query}
              className={styles.searchInput}
              placeholder="Поиск по нику..."
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(36);
              }}
            />
            {query && (
              <button
                type="button"
                className={styles.clearSearch}
                aria-label="Очистить поиск"
                onClick={() => {
                  setQuery("");
                  setVisibleCount(36);
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>События</span>
          <div className={styles.pills}>
            {CATEGORY_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={category === key ? styles.activePill : styles.pill}
                onClick={() => chooseCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {category === "festivals" && (
          <div className={`${styles.filterRow} ${styles.festivalRow}`}>
            <span className={styles.filterLabel}>Фестиваль</span>
            <div className={styles.pills}>
              {FESTIVAL_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={festivalType === key ? styles.activePill : styles.pill}
                  onClick={() => {
                    setFestivalType(key);
                    setVisibleCount(36);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {category === "bosses" && (
          <div className={`${styles.filterRow} ${styles.festivalRow}`}>
            <span className={styles.filterLabel}>Босс</span>
            <div className={styles.pills}>
              {BOSS_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={bossType === key ? styles.activePill : styles.pill}
                  onClick={() => {
                    setBossType(key);
                    setVisibleCount(36);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Период</span>
          <div className={styles.pills}>
            {PERIOD_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={period === key ? styles.activePill : styles.pill}
                onClick={() => choosePeriod(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.positionToggle}>
          <input
            type="checkbox"
            checked={showPositions}
            onChange={(event) => {
              setShowPositions(event.target.checked);
              setVisibleCount(36);
            }}
          />
          <span>Показывать изменения должностей</span>
        </label>

        <p className={styles.trackingNote}>
          Уровни отслеживаются с 08.08.2026
        </p>
      </section>

      <div className={styles.resultMeta}>
        Найдено событий: <strong>{filtered.length}</strong>
      </div>

      {groups.length === 0 ? (
        <div className={styles.empty}>
          <span aria-hidden="true">🐾</span>
          <p>За этот период в летописи пока тихо.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {groups.map((group) => (
            <section key={group.key} className={styles.dayGroup}>
              <div className={styles.dayHeading}>
                <span>{dayLabel(group.date)}</span>
              </div>

              <div className={styles.dayEvents}>
                {group.events.map((item) => {
                  if (isGameNews(item)) {
                    const categoryName = categoryForItem(item);

                    return (
                      <article
                        key={item.id}
                        className={`${styles.eventCard} ${styles.newsCard}`}
                      >
                        <div
                          className={`${styles.icon} ${iconClass(categoryName)}`}
                          aria-hidden="true"
                        >
                          {item.category === "other" ? (
                            <ScrollIcon />
                          ) : (
                            itemIcon(item)
                          )}
                        </div>

                        <div className={styles.eventBody}>
                          <div className={styles.eventText}>
                            <NewsText news={item} />
                          </div>
                          <span className={styles.time}>Новости dm-game.com</span>
                        </div>
                      </article>
                    );
                  }

                  const event = item;
                  const clanId = event.clanId || event.newClanId;
                  const crest = clanId ? clansById.get(clanId)?.crestSmall : undefined;
                  const categoryName = categoryFor(event);

                  return (
                    <article key={event.id} className={styles.eventCard}>
                      <div
                        className={`${styles.icon} ${iconClass(categoryName)}`}
                        aria-hidden="true"
                      >
                        {eventIcon(event)}
                      </div>

                      <div className={styles.eventBody}>
                        <div className={styles.eventText}>
                          <EventText event={event} playersById={playersById} />
                        </div>

                        {event.type === "personal_smile_added" &&
                          event.addedSmiles &&
                          event.addedSmiles.length > 0 && (
                            <div className={styles.smilePreview}>
                              {event.addedSmiles.slice(0, 5).map((smile) => (
                                // Смайлы ДМ приходят с внешнего домена и могут быть GIF.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={smile} src={smile} alt="Новый личный смайлик" />
                              ))}
                            </div>
                          )}

                        <time dateTime={event.createdAt} className={styles.time}>
                          {formatTime(event.createdAt)}
                        </time>
                      </div>

                      {crest && (
                        <span className={collectionStyles.clanCrestBox} aria-hidden="true">
                          {/* Эмблемы кланов ДМ — внешние GIF, поэтому не оптимизируем их Next/Image. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={crest} alt="" width={19} height={19} />
                        </span>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {visibleCount < filtered.length && (
        <button
          type="button"
          className={styles.moreButton}
          onClick={() => setVisibleCount((current) => current + 36)}
        >
          Показать ещё
        </button>
      )}
    </div>
  );
}
