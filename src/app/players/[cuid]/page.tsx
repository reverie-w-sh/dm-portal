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
  reincarnationLevel?: number | null;
  allianceId?: string;
  allianceName?: string;
  inactiveMinutes?: number | null;
  marriagePartner?: string;
  marriageSince?: string;
  characterImage?: string;
};

type Clan = { clanId: string; name: string };

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
  clanName?: string;
  oldClanName?: string;
  newClanName?: string;
  partnerName?: string;
  amount?: number;
  newLevel?: number;
  addedSmiles?: string[];
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

const LOCAL_PORTRAITS: Record<string, string> = {
  "4394": "/images/players/characters/4394.gif",
  "2171": "/images/players/characters/2171.gif",
};

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

function portraitSource(player?: Player): string | undefined {
  if (!player) return undefined;
  return player.characterImage || LOCAL_PORTRAITS[player.cuid];
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
  if (inactiveMinutes < 2 * 24 * 60) return "Менее 48 часов";
  if (inactiveMinutes < 7 * 24 * 60) return "От 2 до 7 дней";
  if (inactiveMinutes < 30 * 24 * 60) return "От 7 до 30 дней";
  return "Больше месяца";
}

function eventText(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
      return `Новый уровень ${event.newLevel ?? ""}`.trim();
    case "player_reincarnation_level_up":
      return `Новый уровень реинкарнации ${event.newLevel ?? ""}`.trim();
    case "player_joined_clan":
      return `Вступление в клан ${event.clanName ?? ""}`.trim();
    case "player_left_clan":
      return `Выход из клана ${event.clanName ?? ""}`.trim();
    case "player_changed_clan":
      return `Переход из клана ${event.oldClanName ?? "?"} в ${event.newClanName ?? "?"}`;
    case "player_married":
      return `Свадьба с ${event.partnerName ?? "любимым человеком"}`;
    case "player_divorced":
      return `Развод с ${event.partnerName ?? "партнёром"}`;
    case "personal_smile_added":
      return event.amount && event.amount > 1
        ? `${event.amount} новых личных смайлика`
        : "Новый личный смайлик";
    default:
      return "Новое событие";
  }
}

function eventIcon(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
      return String(event.newLevel ?? "★");
    case "player_reincarnation_level_up":
      return "✦";
    case "player_married":
      return "◎";
    case "player_divorced":
      return "💔";
    case "personal_smile_added":
      return "☺";
    case "player_joined_clan":
    case "player_changed_clan":
      return "⚑";
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
        sameText(event.characterName, player.nick) ||
        (sameText(event.partnerName, player.nick) &&
          (event.type === "player_married" || event.type === "player_divorced")),
    )
    .map<TimelineEntry>((event) => ({
      kind: "event",
      date: event.createdAt,
      event,
    }));

  const festivalEvents = getPlayerFestivalResults(news, player.nick).map<TimelineEntry>(
    (festival) => ({ kind: "festival", date: festival.date, festival }),
  );

  return [...personalEvents, ...festivalEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function festivalTitle(festival: PlayerFestivalResult): string {
  return `${formatFestivalPlace(festival)} в фестивале ${festival.festivalName}`;
}

function Portrait({ player, compact = false }: { player?: Player; compact?: boolean }) {
  const source = portraitSource(player);
  const className = compact ? styles.familyPortrait : styles.portrait;

  if (!source) {
    return (
      <span className={`${className} ${styles.portraitFallback}`} aria-hidden="true">
        {player?.nick.slice(0, 1).toLocaleUpperCase("ru-RU") || "?"}
      </span>
    );
  }

  return (
    // Образы ДМ имеют собственные пропорции около 104 × 184.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={player ? `Образ персонажа ${player.nick}` : "Образ персонажа"}
      width="104"
      height="184"
      className={className}
    />
  );
}

function ClanIcon() {
  return (
    <span className={`${styles.infoIcon} ${styles.bannerIcon}`} aria-hidden="true">
      <svg viewBox="0 0 32 38"><path d="M7 3h18v25l-9-5-9 5V3Z"/><path d="M4 3h24M16 3v20"/></svg>
    </span>
  );
}

function AllianceIcon() {
  return (
    <span className={`${styles.infoIcon} ${styles.allianceIcon}`} aria-hidden="true">
      <svg viewBox="0 0 40 40"><path d="M7 23c5 7 11 10 18 9M33 23c-5 7-11 10-18 9M10 17l7-5 5 3 4-2 5 5-8 7-4-2-3 2-8-7 2-1Z"/><path d="M8 11c3-3 6-5 10-6M32 11c-3-3-6-5-10-6"/></svg>
    </span>
  );
}

function RecentEntry({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === "festival") {
    return (
      <li>
        <span className={styles.recentIcon}>✦</span>
        <div><strong>{festivalTitle(entry.festival)}</strong><time>{formatDate(entry.date)}</time></div>
      </li>
    );
  }

  return (
    <li>
      <span className={styles.recentIcon}>{eventIcon(entry.event)}</span>
      <div><strong>{eventText(entry.event)}</strong><time>{formatDate(entry.date)}</time></div>
    </li>
  );
}

export async function generateMetadata(
  props: PageProps<"/players/[cuid]">,
): Promise<Metadata> {
  const { cuid } = await props.params;
  const player = findPlayer(cuid);

  if (!player) {
    return { title: "Игрок не найден", robots: { index: false, follow: false } };
  }

  const title = `${player.nick} — карточка игрока`;
  const description = `${player.nick}: уровень, клан, личные смайлики, именные вещи и события в летописи Древнего Мира.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { type: "profile", title, description, images: ["/og/chronicle.webp"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og/chronicle.webp"] },
  };
}

export default async function PlayerPage(props: PageProps<"/players/[cuid]">) {
  const { cuid } = await props.params;
  const player = findPlayer(cuid);
  if (!player) notFound();

  const clan = clans.find((item) => item.clanId === player.clanId);
  const partner = players.find((item) => sameText(item.nick, player.marriagePartner));
  const smiles = personalSmiles.find((item) => item.cuid === player.cuid);
  const items = uniqueItemsForPlayer(player.nick);
  const timeline = playerTimeline(player);
  const displayedSmiles = smiles?.personalSmiles.slice(0, 8) ?? [];
  const displayedItems = items.slice(0, 8);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.profileCard} aria-labelledby="player-title">
          <div className={styles.mainPortraitFrame}><Portrait player={player} /></div>

          <div className={styles.identity}>
            <h1 id="player-title">{player.nick}</h1>
            <div className={styles.activity}>
              <ActivityDot inactiveMinutes={player.inactiveMinutes} className="w-3 h-3" />
              <span>{activityLabel(player.inactiveMinutes)}</span>
            </div>

            <dl className={styles.playerFacts}>
              <div>
                <dt><span className={styles.levelShield}>{player.level}</span></dt>
                <dd>Уровень {player.level}</dd>
              </div>
              <div>
                <dt><span className={`${styles.infoIcon} ${styles.reincarnationIcon}`}>✦</span></dt>
                <dd>Реинкарнация: {player.reincarnationLevel ?? "—"}</dd>
              </div>
              <div>
                <dt><ClanIcon /></dt>
                <dd>{clan?.name ?? "Без клана"}</dd>
              </div>
              {player.allianceName ? (
                <div>
                  <dt><AllianceIcon /></dt>
                  <dd>Альянс «{player.allianceName}»</dd>
                </div>
              ) : null}
            </dl>

            {player.profileUrl ? (
              <a href={player.profileUrl} target="_blank" rel="noreferrer" className={styles.dmButton}>
                Профиль в ДМ <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>

          {player.marriagePartner ? (
            <aside className={styles.familyPanel} aria-label="Семья">
              <h2>Семья</h2>
              <div className={styles.familyPeople}>
                <div className={styles.familyPerson}>
                  <div className={styles.familyPortraitFrame}><Portrait player={player} compact /></div>
                  <strong>{player.nick}</strong>
                </div>
                <Image
                  src="/images/players/bridal-rings.png"
                  alt="Обручальные кольца"
                  width={74}
                  height={48}
                  className={styles.rings}
                />
                <div className={styles.familyPerson}>
                  <div className={styles.familyPortraitFrame}><Portrait player={partner} compact /></div>
                  <strong>{player.marriagePartner}</strong>
                </div>
              </div>
              {player.marriageSince ? <p>Вместе с {player.marriageSince}</p> : null}
            </aside>
          ) : (
            <aside className={`${styles.familyPanel} ${styles.singlePanel}`}>
              <h2>Личная жизнь</h2>
              <strong>Одиночка</strong>
            </aside>
          )}
        </section>

        <section className={styles.overviewPanel} aria-label="Коллекции и последние события">
          <div className={styles.overviewColumn}>
            <header className={styles.overviewHeader}>
              <h2>Личные смайлики</h2>
              <p>{displayedSmiles.length} из {smiles?.personalSmilesCount ?? 0}</p>
            </header>
            {displayedSmiles.length ? (
              <div className={styles.assetGrid}>
                {displayedSmiles.map((src, index) => (
                  <span className={styles.assetTile} key={`${src}-${index}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Личный смайлик ${player.nick}`} loading="lazy" />
                  </span>
                ))}
              </div>
            ) : <p className={styles.emptyText}>Личных смайликов пока нет.</p>}
            {smiles ? <Link className={styles.showAll} href={`/personal-smiles?player=${player.cuid}`}>Показать все →</Link> : null}
          </div>

          <div className={styles.overviewColumn}>
            <header className={styles.overviewHeader}>
              <h2>Именные вещи</h2>
              <p>{displayedItems.length} из {items.length}</p>
            </header>
            {displayedItems.length ? (
              <div className={styles.assetGrid}>
                {displayedItems.map((item) => (
                  <a
                    href={item.itemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.assetTile}
                    title={item.name}
                    key={`${item.id}-${item.imageUrl}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  </a>
                ))}
              </div>
            ) : <p className={styles.emptyText}>Именных вещей пока нет.</p>}
            {items.length ? <Link className={styles.showAll} href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>Показать все →</Link> : null}
          </div>

          <div className={`${styles.overviewColumn} ${styles.recentColumn}`}>
            <header className={styles.overviewHeader}><h2>Последние события</h2></header>
            {timeline.length ? (
              <ol className={styles.recentList}>
                {timeline.slice(0, 6).map((entry) => (
                  <RecentEntry
                    entry={entry}
                    key={entry.kind === "event" ? entry.event.id : entry.festival.id}
                  />
                ))}
              </ol>
            ) : <p className={styles.emptyText}>В личной летописи пока тихо.</p>}
          </div>
        </section>

        <section className={styles.chroniclePanel} aria-labelledby="chronicle-title">
          <header className={styles.chronicleHeader}>
            <span aria-hidden="true" />
            <h2 id="chronicle-title">Личная летопись</h2>
            <span aria-hidden="true" />
          </header>

          {timeline.length ? (
            <div className={styles.timeline}>
              {timeline.map((entry) =>
                entry.kind === "event" ? (
                  <article className={styles.timelineEntry} key={entry.event.id}>
                    <span className={styles.timelineDot}>✦</span>
                    <time>{formatDate(entry.date)}</time>
                    <span className={styles.timelineIcon}>{eventIcon(entry.event)}</span>
                    <div className={styles.timelineContent}>
                      <h3>{eventText(entry.event)}</h3>
                      {entry.event.type === "personal_smile_added" && entry.event.addedSmiles?.[0] ? (
                        <span className={styles.timelineSmile}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={entry.event.addedSmiles[0]} alt="Новый личный смайлик" loading="lazy" />
                        </span>
                      ) : null}
                    </div>
                  </article>
                ) : (
                  <article className={`${styles.timelineEntry} ${styles.festivalEntry}`} key={entry.festival.id}>
                    <span className={styles.timelineDot}>✦</span>
                    <time>{formatDate(entry.date)}</time>
                    <span className={styles.timelineIcon}>✦</span>
                    <div className={styles.timelineContent}>
                      <h3>{festivalTitle(entry.festival)}</h3>
                      {entry.festival.prizes.map((prize) => (
                        <strong className={styles.prize} key={prize}>Приз: {prize}</strong>
                      ))}
                      <a href={entry.festival.sourceUrl} target="_blank" rel="noreferrer">
                        Новость на сайте игры ↗
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : <p className={styles.emptyText}>В личной летописи пока тихо.</p>}
        </section>
      </div>
    </main>
  );
}
