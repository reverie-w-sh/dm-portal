"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "../collection-pages.module.css";

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
  const [sort, setSort] = useState<"date" | "names">("date");

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
      .sort((left, right) =>
        sort === "names"
          ? left.a.nick.localeCompare(right.a.nick, "ru")
          : parseDate(left.since) - parseDate(right.since) ||
            left.a.nick.localeCompare(right.a.nick, "ru"),
      );
  }, [players, query, sort]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={`${styles.heroIcon} ${styles.ringsIcon}`}>
            <Image
              src="/ui/couple-rings.svg"
              width={76}
              height={76}
              alt="Два золотых обручальных кольца"
              priority
            />
          </div>
          <div>
            <p className={styles.eyebrow}>Страничка про любовь :) ♥</p>
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
              className={sort === "date" ? styles.active : ""}
              onClick={() => setSort("date")}
            >
              Дольше вместе
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
                <span className={styles.plus}>♥</span>
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
              <p className={styles.since}>
                {couple.since
                  ? `Вместе с ${couple.since}`
                  : "Дата свадьбы пока не найдена"}
              </p>
            </article>
          ))}
        </div>

        {!couples.length && (
          <div className={styles.empty}>Семейные пары пока не найдены.</div>
        )}
      </section>
    </main>
  );
}

function parseDate(value: string) {
  const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return match
    ? new Date(+match[3], +match[2] - 1, +match[1]).getTime()
    : Number.MAX_SAFE_INTEGER;
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
          {player.profileUrl ? (
            <a href={player.profileUrl} target="_blank" rel="noreferrer">
              {player.nick}
            </a>
          ) : (
            player.nick
          )}{" "}
          {player.level ? <small>[{player.level}]</small> : null}
        </h2>
        <p>{player.clanName || "Без клана"}</p>
        <div className={styles.badges}>
          <span>😊 {smiles}</span>
          <Link href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>
            ⚔️ {items}
          </Link>
        </div>
      </div>
    </div>
  );
}
