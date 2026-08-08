"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import eventsJson from "../../../data/events.json";
import clansJson from "../../../data/clans.json";
import playersJson from "../../../data/players.json";
import lastSyncJson from "../../../data/last-sync.json";
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

type Category = "all" | "levels" | "clans" | "love" | "smiles";
type Period = "7" | "30" | "90" | "all";

const events = eventsJson as ChronicleEvent[];
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
];

const PERIOD_LABELS: Array<{ key: Period; label: string }> = [
  { key: "7", label: "7 дней" },
  { key: "30", label: "30 дней" },
  { key: "90", label: "90 дней" },
  { key: "all", label: "Всё время" },
];

const POSITION_EVENT = "player_position_changed";

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

export default function ChronicleClient() {
  const [category, setCategory] = useState<Category>("all");
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

    return [...events]
      .filter((event) => event.type !== "personal_item_added")
      .filter((event) => showPositions || event.type !== POSITION_EVENT)
      .filter((event) => category === "all" || categoryFor(event) === category)
      .filter((event) => new Date(event.createdAt).getTime() >= periodStart)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [category, period, showPositions]);

  const visibleEvents = filtered.slice(0, visibleCount);
  const groups = visibleEvents.reduce<Array<{ key: string; date: string; events: ChronicleEvent[] }>>(
    (result, event) => {
      const key = dayKey(event.createdAt);
      const last = result[result.length - 1];

      if (last?.key === key) {
        last.events.push(event);
      } else {
        result.push({ key, date: event.createdAt, events: [event] });
      }

      return result;
    },
    [],
  );

  function chooseCategory(next: Category) {
    setCategory(next);
    setVisibleCount(36);
  }

  function choosePeriod(next: Period) {
    setPeriod(next);
    setVisibleCount(36);
  }

  return (
    <div className={styles.content}>
      <section className={styles.filters} aria-label="Фильтры летописи">
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
                {group.events.map((event) => {
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
                        <span className={styles.crestBox} aria-hidden="true">
                          {/* Эмблемы кланов ДМ — внешние GIF, поэтому не оптимизируем их Next/Image. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className={styles.crest} src={crest} alt="" />
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
