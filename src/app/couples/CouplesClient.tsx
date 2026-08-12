"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../collection-pages.module.css";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type Player = {
  cuid: string;
  nick: string;
  level?: number;
  clanId?: string;
  clanName?: string;
  profileUrl?: string;
  marriagePartner?: string;
  marriageSince?: string;
};

type Couple = { a: Player; b?: Player; partnerName: string; since: string };

export default function CouplesClient({
  players,
  smileCounts,
  itemCounts,
}: {
  players: Player[];
  smileCounts: Record<string, number>;
  itemCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"date-old" | "date-new" | "names">("date-old");
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  const couples = useMemo(() => {
    const byName = new Map(
      players.map((player) => [player.nick.toLocaleLowerCase("ru"), player]),
    );
    const used = new Set<string>();
    const list: Couple[] = [];

    for (const player of players) {
      const partner = (player.marriagePartner || "").trim();
      if (!partner) continue;

      const other = byName.get(partner.toLocaleLowerCase("ru"));
      const key = [
        player.nick.toLocaleLowerCase("ru"),
        partner.toLocaleLowerCase("ru"),
      ]
        .sort()
        .join("|");

      if (used.has(key)) continue;
      used.add(key);

      list.push({
        a: player,
        b: other,
        partnerName: other?.nick || partner,
        since: player.marriageSince || other?.marriageSince || "",
      });
    }

    const normalizedQuery = query.trim().toLocaleLowerCase("ru");

    return list
      .filter(
        (couple) =>
          !normalizedQuery ||
          couple.a.nick.toLocaleLowerCase("ru").includes(normalizedQuery) ||
          couple.partnerName.toLocaleLowerCase("ru").includes(normalizedQuery),
      )
      .sort((left, right) => {
        if (sort === "names") {
          return left.a.nick.localeCompare(right.a.nick, "ru");
        }

        const leftDate = parseDate(left.since);
        const rightDate = parseDate(right.since);
        const dateDifference =
          sort === "date-old"
            ? leftDate - rightDate
            : rightDate - leftDate;

        return (
          dateDifference || left.a.nick.localeCompare(right.a.nick, "ru")
        );
      });
  }, [players, query, sort]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={`${styles.heroIcon} ${styles.ringsIcon}`}>
            <Image
              src="/images/couples-wolves.png"
              width={76}
              height={76}
              alt="Белый и чёрный волки"
              priority
            />
          </div>
          <div>
            <p className={styles.eyebrow}>♥ Страничка про любовь :) ♥</p>
            <h1>Семейные пары</h1>
            <p>
              Помните: счастье к свидетельству о браке не прилагается: всё
              зависит только от вас :)
            </p>
          </div>
        </header>

        <div className={styles.stats}>
          <span>
            Семейных пар: <b>{couples.length}</b>
          </span>
        </div>

        <div className={styles.controls}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти кого-нибудь из пары…"
          />
          <div>
            <button
              className={sort !== "names" ? styles.active : ""}
              onClick={() =>
                setSort((current) =>
                  current === "date-old" ? "date-new" : "date-old",
                )
              }
            >
              {sort === "date-new" ? "Новые пары ▲" : "Дольше вместе ▼"}
            </button>
            <button
              className={sort === "names" ? styles.active : ""}
              onClick={() => setSort("names")}
            >
              По именам
            </button>
          </div>
        </div>

        <div className={styles.coupleGrid}>
          {couples.map((couple) => (
            <article
              className={styles.couple}
              key={`${couple.a.nick}-${couple.partnerName}`}
            >
              <div className={styles.heart}>♥</div>
              <div className={styles.people}>
                <Person
                  player={couple.a}
                  smiles={
                    smileCounts[couple.a.nick.toLocaleLowerCase("ru")] || 0
                  }
                  items={itemCounts[couple.a.nick.toLocaleLowerCase("ru")] || 0}
                />
                <span className={styles.plus}>+</span>
                <Person
                  player={couple.b || { cuid: "", nick: couple.partnerName }}
                  smiles={
                    smileCounts[couple.partnerName.toLocaleLowerCase("ru")] || 0
                  }
                  items={
                    itemCounts[couple.partnerName.toLocaleLowerCase("ru")] || 0
                  }
                />
              </div>
              <CoupleSince since={couple.since} today={today} />
            </article>
          ))}
        </div>

        {!couples.length && (
          <div className={styles.empty}>Семейные пары пока не найдены.</div>
        )}
      </section>

      <button
        type="button"
        className={styles.scrollTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        title="Наверх"
      >
        <span aria-hidden="true">↑</span>
        <span>Наверх</span>
      </button>
    </main>
  );
}

function parseDate(value: string) {
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return match
    ? new Date(+match[3], +match[2] - 1, +match[1]).getTime()
    : Number.MAX_SAFE_INTEGER;
}

function CoupleSince({
  since,
  today,
}: {
  since: string;
  today: number | null;
}) {
  const duration = today === null ? null : getCoupleDuration(since, today);

  if (!since) {
    return <p className={styles.since}>Дата свадьбы пока не найдена</p>;
  }

  if (!duration) {
    return <p className={styles.since}>Вместе с {since}</p>;
  }

  return (
    <p className={styles.since}>
      <span>
        Вместе {formatDays(duration.daysTogether)} с {since}
      </span>
      <span>
        До {duration.anniversaryNumber}-й годовщины - {formatDays(duration.daysUntil)}
      </span>
    </p>
  );
}

function getCoupleDuration(since: string, today: number) {
  const match = since.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const startedAt = Date.UTC(year, month, day);
  if (startedAt > today) return null;

  const currentYear = new Date(today).getUTCFullYear();
  let anniversaryYear = currentYear;
  let anniversaryAt = makeAnniversary(anniversaryYear, month, day);

  if (anniversaryAt < today || anniversaryYear === year) {
    anniversaryYear += 1;
    anniversaryAt = makeAnniversary(anniversaryYear, month, day);
  }

  return {
    daysTogether: Math.floor((today - startedAt) / DAY_IN_MS),
    anniversaryNumber: anniversaryYear - year,
    daysUntil: Math.ceil((anniversaryAt - today) / DAY_IN_MS),
  };
}

function makeAnniversary(year: number, month: number, day: number) {
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDayOfMonth));
}

function formatDays(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  const word =
    lastTwo >= 11 && lastTwo <= 14
      ? "дней"
      : last === 1
        ? "день"
        : last >= 2 && last <= 4
          ? "дня"
          : "дней";

  return `${value} ${word}`;
}

function Person({
  player,
  smiles,
  items,
}: {
  player: Player;
  smiles: number;
  items: number;
}) {
  return (
    <div className={styles.person}>
      <div className={styles.avatar}>{player.nick.charAt(0).toUpperCase()}</div>
      <div className={styles.personBody}>
        <h2>
          {player.cuid ? (
            <Link href={`/players/${player.cuid}`}>
              {player.nick}
            </Link>
          ) : (
            player.nick
          )}{" "}
          {player.level ? <small>[{player.level}]</small> : null}
        </h2>
        <p>{player.clanName || "Без клана"}</p>
        <div className={styles.badges}>
          {player.cuid ? (
            <Link
              href={`/personal-smiles?player=${encodeURIComponent(player.cuid)}`}
              title={`Открыть личные смайлики ${player.nick}`}
            >
              😊 {smiles}
            </Link>
          ) : (
            <span>😊 {smiles}</span>
          )}
          <Link href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>
            ⚔️ {items}
          </Link>
        </div>
      </div>
    </div>
  );
}
