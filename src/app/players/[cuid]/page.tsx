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
import { PortraitImage } from "./PortraitImage";
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
  characterImage?: string;
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
  if (inactiveMinutes == null) return "Последний вход неизвестен";
  if (inactiveMinutes < 2 * 24 * 60) return "Был(а) недавно";
  if (inactiveMinutes < 7 * 24 * 60) return "Был(а) 2–7 дней назад";
  if (inactiveMinutes < 30 * 24 * 60) return "Был(а) 7–30 дней назад";
  return "Был(а) больше месяца назад";
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
    robots: { index: false, follow: false },
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
  const timeline = playerTimeline(player);
  const displayedSmiles = smiles?.personalSmiles.slice(0, 8) ?? [];
  const displayedItems = items.slice(0, 4);
  const partner = player.marriagePartner
    ? players.find((item) => sameText(item.nick, player.marriagePartner))
    : undefined;
  const characterImage = player.characterImage;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/members" className={styles.backLink}>
          ← Составы кланов
        </Link>

        <section className={styles.profileCard} aria-labelledby="player-title">
          <div className={styles.portraitStage}>
            <div className={styles.portraitFrame}>
              <PortraitImage
                src={characterImage}
                alt={`Образ персонажа ${player.nick}`}
                className={styles.portrait}
                fallbackClassName={styles.portraitFallback}
              />
            </div>
            <span className={styles.portraitCaption}>Образ из ДМ</span>
          </div>

          <div className={styles.identity}>
            <p className={styles.eyebrow}>Карточка игрока</p>
            <h1 id="player-title">{player.nick}</h1>
            <div className={styles.activity}>
              <ActivityDot inactiveMinutes={player.inactiveMinutes} className="w-4 h-4" />
              <span>{activityLabel(player.inactiveMinutes)}</span>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <div className={styles.levelShield} aria-label={`Уровень ${player.level}`}>
                  <span>{player.level}</span>
                </div>
                <div><small>Уровень</small><strong>{player.level}</strong></div>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/reincarnation-wheel.png" alt="" width={240} height={238} unoptimized />
                </span>
                <div><small>Реинкарнация</small><strong>{player.reincarnationLevel ?? "—"}</strong></div>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/clan-paw.png" alt="" width={194} height={240} unoptimized />
                </span>
                <div>
                  <small>Клан</small>
                  {clan ? <Link href={`/clans/${clan.clanId}`}>{clan.name}</Link> : <strong>Без клана</strong>}
                </div>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/alliance-banner.png" alt="" width={180} height={228} unoptimized />
                </span>
                <div>
                  <small>Альянс</small>
                  {player.allianceName ? <Link href="/alliances">{player.allianceName}</Link> : <strong>Без альянса</strong>}
                </div>
              </div>
            </div>

            {player.profileUrl ? (
              <a href={player.profileUrl} target="_blank" rel="noreferrer" className={styles.dmLink}>
                <Image src="/images/players/profile-button.png" alt="Профиль в ДМ" width={760} height={169} unoptimized />
              </a>
            ) : null}
          </div>

          <aside className={styles.familyCard}>
            <p className={styles.familyTitle}>Личная жизнь</p>
            {player.marriagePartner ? (
              <div className={styles.couple}>
                <div className={styles.familyPerson}>
                  <span className={styles.familyPortraitFrame}>
                    <PortraitImage
                      src={characterImage}
                      alt={`Образ ${player.nick}`}
                      className={styles.familyPortrait}
                      fallbackClassName={styles.portraitFallback}
                    />
                  </span>
                  <strong>{player.nick}</strong>
                </div>
                <div className={styles.ringsWrap}>
                  <Image src="/images/players/wedding-rings.png" alt="Обручальные кольца" width={220} height={132} unoptimized />
                  {player.marriageSince ? <small>с {player.marriageSince}</small> : null}
                </div>
                <div className={styles.familyPerson}>
                  <span className={styles.familyPortraitFrame}>
                    <PortraitImage
                      src={partner?.characterImage}
                      alt={`Образ ${player.marriagePartner}`}
                      className={styles.familyPortrait}
                      fallbackClassName={styles.portraitFallback}
                    />
                  </span>
                  <strong>{player.marriagePartner}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.singleState}>
                <span>♡</span>
                <strong>Одиночка</strong>
              </div>
            )}
          </aside>
        </section>

        <div className={styles.showcaseGrid}>
          <section className={styles.collectionPanel}>
            <header className={styles.collectionHeader}>
              <div>
                <h2>Личные смайлики</h2>
                <p>{displayedSmiles.length} / {smiles?.personalSmilesCount ?? 0}</p>
              </div>
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
            ) : <p className={styles.emptyText}>Личных смайликов пока нет.</p>}
            {smiles ? <Link className={styles.panelLink} href={`/personal-smiles?player=${player.cuid}`}>Показать все →</Link> : null}
          </section>

          <section className={styles.collectionPanel}>
            <header className={styles.collectionHeader}>
              <div>
                <h2>Именные вещи</h2>
                <p>{displayedItems.length} / {items.length}</p>
              </div>
            </header>
            {displayedItems.length ? (
              <div className={styles.itemGrid}>
                {displayedItems.map((item) => (
                  <a href={item.itemUrl} target="_blank" rel="noreferrer" className={styles.itemCard} key={`${item.id}-${item.imageUrl}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  </a>
                ))}
              </div>
            ) : <p className={styles.emptyText}>Именных вещей пока нет.</p>}
            {items.length ? <Link className={styles.panelLink} href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>Показать все →</Link> : null}
          </section>

          <section className={styles.chroniclePanel}>
            <header className={styles.collectionHeader}>
              <div>
                <h2>Личная летопись</h2>
                <p>{Math.min(timeline.length, 4)} / {timeline.length}</p>
              </div>
            </header>
            {timeline.length ? (
              <div className={styles.timeline}>
              {timeline.slice(0, 4).map((entry) =>
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
            ) : <p className={styles.emptyText}>В личной летописи пока тихо.</p>}
            <Link className={styles.panelLink} href={`/chronicle?player=${encodeURIComponent(player.nick)}`}>Показать все →</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
