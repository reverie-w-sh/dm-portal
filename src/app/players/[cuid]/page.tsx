import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import clansJson from "../../../../data/clans.json";
import eventsJson from "../../../../data/events.json";
import gameNewsJson from "../../../../data/game-news.json";
import personalItemsJson from "../../../../data/personal-items.json";
import personalSmilesJson from "../../../../data/personal-smiles.json";
import playersJson from "../../../../data/players.json";
import { ActivityDot } from "@/components/ActivityStatus";
import {
  formatFestivalPlace,
  getPlayerFestivalResults,
  type PlayerFestivalResult,
} from "@/lib/player-profile";
import styles from "./page.module.css";

type Player = {
  cuid: string;
  nick: string;
  level: number;
  clanId?: string;
  clanName?: string;
  profileUrl?: string;
  position?: string;
  reincarnationLevel?: number | null;
  allianceId?: string;
  allianceName?: string;
  inactiveMinutes?: number | null;
  marriagePartner?: string;
  marriageSince?: string;
};

type Clan = {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
  crestLarge?: string;
};

type PersonalSmiles = {
  cuid: string;
  nick: string;
  personalSmilesCount: number;
  personalSmiles: string[];
};

type PersonalItem = {
  id: string;
  name: string;
  owner: string;
  imageUrl: string;
  itemUrl: string;
};

type ChronicleEvent = {
  id: string;
  createdAt: string;
  type: string;
  characterId?: string;
  characterName?: string;
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
  oldLevel?: number | null;
  newLevel?: number;
};

type NewsItem = Parameters<typeof getPlayerFestivalResults>[0][number];
type TimelineEntry =
  | { kind: "event"; date: string; event: ChronicleEvent }
  | { kind: "festival"; date: string; festival: PlayerFestivalResult };

const players = playersJson as Player[];
const clans = clansJson as Clan[];
const events = eventsJson as ChronicleEvent[];
const personalSmiles = personalSmilesJson as PersonalSmiles[];
const personalItems = personalItemsJson.items as PersonalItem[];
const news = gameNewsJson.items as NewsItem[];

function findPlayer(cuid: string): Player | undefined {
  return players.find((player) => player.cuid === cuid);
}

function sameText(a?: string, b?: string): boolean {
  return Boolean(
    a &&
      b &&
      a.trim().toLocaleLowerCase("ru-RU") ===
        b.trim().toLocaleLowerCase("ru-RU"),
  );
}

function formatDate(value: string): string {
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function activityLabel(inactiveMinutes?: number | null): string {
  if (inactiveMinutes == null) return "Нет данных о последнем входе";
  if (inactiveMinutes < 2 * 24 * 60) return "Заходил(а) менее 48 часов назад";
  if (inactiveMinutes < 7 * 24 * 60) return "Заходил(а) от 2 до 7 дней назад";
  if (inactiveMinutes < 30 * 24 * 60) return "Заходил(а) от 7 до 30 дней назад";
  return "Заходил(а) больше месяца назад";
}

function eventText(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
      return `Новый уровень: ${event.newLevel ?? "?"}`;
    case "player_reincarnation_level_up":
      return `Новый уровень реинкарнации: ${event.newLevel ?? "?"}`;
    case "player_joined_clan":
      return `Вступил(а) в клан ${event.clanName ?? ""}`.trim();
    case "player_left_clan":
      return `Покинул(а) клан ${event.clanName ?? ""}`.trim();
    case "player_changed_clan":
      return `Перешёл(ла) из клана ${event.oldClanName ?? "?"} в ${event.newClanName ?? "?"}`;
    case "player_position_changed":
      return `Новая должность: ${event.newPosition || "без должности"}`;
    case "player_married":
      return `Свадьба с ${event.partnerName ?? "любимым человеком"}`;
    case "player_divorced":
      return `Расставание с ${event.partnerName ?? "партнёром"}`;
    case "personal_smile_added":
      return `Новые личные смайлики: +${event.amount ?? 1}`;
    default:
      return "Новое событие";
  }
}

function eventIcon(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
    case "player_reincarnation_level_up":
      return "★";
    case "player_married":
      return "♥";
    case "player_divorced":
      return "💔";
    case "personal_smile_added":
      return "☺";
    case "player_joined_clan":
    case "player_changed_clan":
      return "→";
    case "player_left_clan":
      return "←";
    default:
      return "✦";
  }
}

function uniqueItemsForPlayer(nick: string): PersonalItem[] {
  const unique = new Map<string, PersonalItem>();

  for (const item of personalItems) {
    if (!sameText(item.owner, nick)) continue;
    const key = `${item.name.trim().toLocaleLowerCase("ru-RU")}\u0000${item.imageUrl}`;
    if (!unique.has(key)) unique.set(key, item);
  }

  return [...unique.values()];
}

function playerTimeline(player: Player): TimelineEntry[] {
  const personalEvents = events
    .filter(
      (event) =>
        event.characterId === player.cuid ||
        (sameText(event.partnerName, player.nick) &&
          (event.type === "player_married" || event.type === "player_divorced")),
    )
    .map<TimelineEntry>((event) => ({
      kind: "event",
      date: event.createdAt,
      event,
    }));

  const festivalEvents = getPlayerFestivalResults(news, player.nick).map<TimelineEntry>(
    (festival) => ({
      kind: "festival",
      date: festival.date,
      festival,
    }),
  );

  return [...personalEvents, ...festivalEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function generateMetadata(
  props: PageProps<"/players/[cuid]">,
): Promise<Metadata> {
  const { cuid } = await props.params;
  const player = findPlayer(cuid);

  if (!player) {
    return {
      title: "Игрок не найден",
      robots: { index: false, follow: false },
    };
  }

  const title = `${player.nick} — карточка игрока`;
  const description = `${player.nick}: уровень, клан, личные смайлики, именные вещи и события в летописи Древнего Мира.`;
  const canonical = `/players/${player.cuid}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description,
      url: canonical,
      images: ["/og/chronicle.webp"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/chronicle.webp"],
    },
  };
}

export default async function PlayerPage(props: PageProps<"/players/[cuid]">) {
  const { cuid } = await props.params;
  const player = findPlayer(cuid);
  if (!player) notFound();

  const clan = clans.find((item) => item.clanId === player.clanId);
  const smiles = personalSmiles.find((item) => item.cuid === player.cuid);
  const items = uniqueItemsForPlayer(player.nick);
  const partner = player.marriagePartner
    ? players.find((item) => sameText(item.nick, player.marriagePartner))
    : undefined;
  const timeline = playerTimeline(player);
  const displayedSmiles = smiles?.personalSmiles.slice(0, 8) ?? [];
  const displayedItems = items.slice(0, 8);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/members" className={styles.backLink}>
          ← Составы кланов
        </Link>

        <section className={styles.profileCard} aria-labelledby="player-title">
          <div className={styles.profileGlow} aria-hidden="true" />

          <div className={styles.crestColumn}>
            <div className={styles.crestFrame}>
              {clan?.crestLarge?.startsWith("http") ? (
                <Image
                  src={clan.crestLarge}
                  alt={`Герб клана ${clan.name}`}
                  width={150}
                  height={150}
                  unoptimized
                  className={styles.crestImage}
                />
              ) : (
                <Image
                  src="/icons/wolf-paw-gold.png"
                  alt="Золотая волчья лапа"
                  width={116}
                  height={116}
                  className={styles.pawImage}
                />
              )}
            </div>
            <span className={styles.cuid}>ID {player.cuid}</span>
          </div>

          <div className={styles.identity}>
            <p className={styles.eyebrow}>Карточка игрока</p>
            <h1 id="player-title">{player.nick}</h1>
            <p className={styles.position}>{player.position || "Без должности"}</p>

            <div className={styles.activity}>
              <ActivityDot inactiveMinutes={player.inactiveMinutes} className="w-4 h-4" />
              <span>{activityLabel(player.inactiveMinutes)}</span>
            </div>

            <div className={styles.affiliations}>
              {clan ? (
                <Link href={`/clans/${clan.clanId}`} className={styles.affiliation}>
                  {clan.crestSmall ? (
                    <Image
                      src={clan.crestSmall}
                      alt=""
                      width={28}
                      height={28}
                      unoptimized
                    />
                  ) : null}
                  <span>
                    <small>Клан</small>
                    {clan.name}
                  </span>
                </Link>
              ) : (
                <span className={styles.affiliation}>
                  <span><small>Клан</small>Без клана</span>
                </span>
              )}

              {player.allianceName ? (
                <Link href="/alliances" className={styles.affiliation}>
                  <span className={styles.allianceMark}>✦</span>
                  <span>
                    <small>Альянс</small>
                    {player.allianceName}
                  </span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className={styles.levelPanel}>
            <div className={styles.levelShield} aria-label={`Уровень ${player.level}`}>
              <span>{player.level}</span>
            </div>
            <strong>Уровень</strong>
            <p>Реинкарнация: {player.reincarnationLevel ?? "—"}</p>

            {player.profileUrl ? (
              <a
                href={player.profileUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.dmLink}
              >
                Профиль в ДМ ↗
              </a>
            ) : null}
          </div>
        </section>

        <div className={styles.twoColumns}>
          <section className={styles.panel}>
            <header className={styles.sectionHeading}>
              <span>♥</span>
              <div>
                <p>Семья</p>
                <h2>Семейная пара</h2>
              </div>
            </header>

            {player.marriagePartner ? (
              <div className={styles.partnerCard}>
                <div className={styles.partnerNames}>
                  {player.nick}
                  <span>♥</span>
                  {partner ? (
                    <Link href={`/players/${partner.cuid}`}>{partner.nick}</Link>
                  ) : (
                    player.marriagePartner
                  )}
                </div>
                {player.marriageSince ? (
                  <p>Вместе с {player.marriageSince}</p>
                ) : null}
              </div>
            ) : (
              <p className={styles.emptyText}>Семейная пара не указана.</p>
            )}
          </section>

          <section className={styles.panel}>
            <header className={styles.sectionHeading}>
              <span>✦</span>
              <div>
                <p>Коллекция</p>
                <h2>Коротко о персонаже</h2>
              </div>
            </header>

            <dl className={styles.statsGrid}>
              <div><dt>Личных смайликов</dt><dd>{smiles?.personalSmilesCount ?? 0}</dd></div>
              <div><dt>Именных вещей</dt><dd>{items.length}</dd></div>
              <div><dt>Событий в летописи</dt><dd>{timeline.length}</dd></div>
            </dl>
          </section>
        </div>

        <section className={styles.collectionPanel}>
          <header className={styles.collectionHeader}>
            <div>
              <p className={styles.eyebrow}>Личные смайлики</p>
              <h2>{smiles?.personalSmilesCount ?? 0} в коллекции</h2>
            </div>
            {smiles ? (
              <Link href={`/personal-smiles?player=${player.cuid}`}>Смотреть все →</Link>
            ) : null}
          </header>

          {displayedSmiles.length ? (
            <div className={styles.smileGrid}>
              {displayedSmiles.map((src, index) => (
                <span className={styles.smileCard} key={`${src}-${index}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Личный смайлик ${player.nick}`} loading="lazy" />
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Личные смайлики пока не найдены.</p>
          )}
        </section>

        <section className={styles.collectionPanel}>
          <header className={styles.collectionHeader}>
            <div>
              <p className={styles.eyebrow}>Именные вещи</p>
              <h2>{items.length} в коллекции</h2>
            </div>
            {items.length ? (
              <Link href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>
                Смотреть все →
              </Link>
            ) : null}
          </header>

          {displayedItems.length ? (
            <div className={styles.itemGrid}>
              {displayedItems.map((item) => (
                <a
                  href={item.itemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.itemCard}
                  key={`${item.id}-${item.imageUrl}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Именные вещи пока не найдены.</p>
          )}
        </section>

        <section className={styles.chroniclePanel}>
          <header className={styles.collectionHeader}>
            <div>
              <p className={styles.eyebrow}>Личный след</p>
              <h2>Летопись игрока</h2>
            </div>
            <Link href={`/chronicle?player=${encodeURIComponent(player.nick)}`}>
              Вся летопись →
            </Link>
          </header>

          {timeline.length ? (
            <div className={styles.timeline}>
              {timeline.slice(0, 16).map((entry) =>
                entry.kind === "event" ? (
                  <article className={styles.timelineEntry} key={entry.event.id}>
                    <span className={styles.timelineIcon}>{eventIcon(entry.event)}</span>
                    <div>
                      <time>{formatDate(entry.date)}</time>
                      <h3>{eventText(entry.event)}</h3>
                    </div>
                  </article>
                ) : (
                  <article
                    className={`${styles.timelineEntry} ${styles.festivalEntry}`}
                    key={entry.festival.id}
                  >
                    <span className={styles.timelineIcon}>✦</span>
                    <div>
                      <time>{formatDate(entry.date)}</time>
                      <h3>{formatFestivalPlace(entry.festival)} за фестиваль</h3>
                      <p>{entry.festival.title}</p>
                      {entry.festival.prizes.map((prize) => (
                        <strong className={styles.prize} key={prize}>
                          Приз: {prize}
                        </strong>
                      ))}
                      <a href={entry.festival.sourceUrl} target="_blank" rel="noreferrer">
                        Новость и результаты ↗
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <p className={styles.emptyText}>В личной летописи пока тихо.</p>
          )}
        </section>
      </div>
    </main>
  );
}
