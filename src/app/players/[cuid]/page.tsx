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
import ratingsJson from "../../../../data/ratings.json";
import { ActivityDot } from "@/components/ActivityStatus";
import { getExperienceProgress } from "@/lib/experience";
import { shortFestivalName } from "@/lib/festival-names";
import {
  formatFestivalPlace,
  getPlayerFestivalResults,
  type PlayerFestivalResult,
} from "@/lib/player-profile";
import { PortraitGallery } from "./PortraitGallery";
import { PortraitImage } from "./PortraitImage";
import styles from "./page.module.css";

type Player = {
  cuid: string;
  nick: string;
  level: number;
  levelUp?: number;
  clanId?: string;
  clanName?: string;
  profileUrl?: string;
  reincarnationLevel?: number | null;
  reincarnationUp?: number;
  allianceName?: string;
  inactiveMinutes?: number | null;
  marriagePartner?: string;
  marriageSince?: string;
  characterImage?: string;
  characterImages?: string[];
};

type Clan = { clanId: string; name: string };

type PersonalSmiles = {
  cuid: string;
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
  newPosition?: string;
  partnerName?: string;
  amount?: number;
  newLevel?: number;
  addedSmiles?: string[];
  addedAchievements?: Achievement[];
  isInitialImport?: boolean;
};

type Achievement = {
  id: string;
  name: string;
  imageUrl: string;
  category: "battle" | "profession" | "research" | "underground" | "other";
};

type RatingItem = {
  rank?: number;
  name: string;
  level?: number;
  value?: number | string;
  experience?: number;
  exp?: number;
};

type Rating = {
  title: string;
  valueLabel?: string;
  items: RatingItem[];
};

type RatingsData = {
  ratings: Record<string, Rating>;
};

type ProfessionPosition = {
  key: string;
  label: string;
  icon: string;
  rank: number;
  value?: number | string;
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
const ratings = (ratingsJson as RatingsData).ratings;
const PREVIEW_EVENTS = 5;
const PROFESSIONS = [
  { key: "fishing", label: "Рыболов", icon: "fishing.png" },
  { key: "collector", label: "Собиратель", icon: "collector.png" },
  { key: "hunting", label: "Охотник", icon: "hunting.png" },
  { key: "blacksmith", label: "Кузнец", icon: "blacksmith.png" },
  { key: "leatherworker", label: "Кожевник", icon: "leatherworker.png" },
  { key: "doctor", label: "Лекарь", icon: "doctor.png" },
  { key: "alchemy", label: "Алхимик", icon: "alchemy.png" },
  { key: "enchanter", label: "Заклинатель", icon: "enchanter.png" },
  { key: "seer", label: "Ведун", icon: "seer.png" },
  { key: "shooter", label: "Стрелок", icon: "shooter.png" },
] as const;
const LOCAL_CHARACTER_IMAGES: Record<string, string> = {
  "2171": "/images/players/characters/2171.gif",
  "3358": "/images/players/characters/3358v6-0.gif",
  "4394": "/images/players/characters/4394.gif",
};

function findPlayer(cuid: string): Player | undefined {
  return players.find((player) => player.cuid === cuid);
}

function sameText(a?: string, b?: string): boolean {
  return Boolean(
    a && b && a.trim().toLocaleLowerCase("ru-RU") === b.trim().toLocaleLowerCase("ru-RU"),
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
  if (inactiveMinutes < 2 * 24 * 60) return "Менее 48 часов";
  if (inactiveMinutes < 7 * 24 * 60) return "2–7 дней";
  if (inactiveMinutes < 30 * 24 * 60) return "7–30 дней";
  return "Больше месяца";
}

function characterImage(player?: Player): string | undefined {
  if (!player) return undefined;
  if (player.characterImage?.startsWith("/")) return player.characterImage;
  return LOCAL_CHARACTER_IMAGES[player.cuid] ?? player.characterImage;
}

function characterImages(player: Player): string[] {
  return Array.from(
    new Set([
      characterImage(player),
      ...(player.characterImages ?? []),
    ].filter((image): image is string => Boolean(image))),
  );
}

function eventText(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up":
      return `Новый уровень ${event.newLevel ?? "?"}`;
    case "player_reincarnation_level_up":
      return `Новый уровень реинкарнации ${event.newLevel ?? "?"}`;
    case "player_joined_clan":
      return `Вступление в клан ${event.clanName ?? ""}`.trim();
    case "player_left_clan":
      return `Выход из клана ${event.clanName ?? ""}`.trim();
    case "player_changed_clan":
      return `Переход из клана ${event.oldClanName ?? "?"} в ${event.newClanName ?? "?"}`;
    case "player_position_changed":
      return `Новая должность: ${event.newPosition || "без должности"}`;
    case "player_married":
      return `Свадьба с ${event.partnerName ?? "любимым человеком"}`;
    case "player_divorced":
      return `Развод с ${event.partnerName ?? "партнёром"}`;
    case "personal_smile_added":
      return event.amount && event.amount > 1
        ? `Новые личные смайлики: +${event.amount}`
        : "Новый личный смайлик";
    case "player_achievement_added":
      if (event.isInitialImport !== false) {
        return `Достижения: ${event.addedAchievements?.length ?? event.amount ?? 0}`;
      }
      return event.addedAchievements?.length === 1
        ? `Новое достижение: ${event.addedAchievements[0].name}`
        : `Новые достижения: ${event.addedAchievements?.length ?? event.amount ?? 0}`;
    default:
      return "Новое событие";
  }
}

function eventIcon(event: ChronicleEvent): string {
  switch (event.type) {
    case "player_level_up": return String(event.newLevel ?? "★");
    case "player_reincarnation_level_up": return "✦";
    case "player_married": return "∞";
    case "player_divorced": return "💔";
    case "personal_smile_added": return "☺";
    case "player_joined_clan":
    case "player_changed_clan": return "⚑";
    case "player_left_clan": return "⚐";
    default: return "✦";
  }
}

function festivalName(result: PlayerFestivalResult): string {
  const title = result.title.trim();
  const shortName = shortFestivalName(title);
  if (shortName) return shortName;

  return title
    .replace(/^Итоги\s+(?:Фестиваля|Фестиваль)\s+/iu, "")
    .replace(/^Стартовал(?:а|о)?\s+(?:Фестиваль|Фестиваля)\s+/iu, "")
    .replace(/^Фестиваль\s+/iu, "")
    .replace(/[.!]+$/u, "")
    .trim();
}

function festivalText(result: PlayerFestivalResult): string {
  return `${formatFestivalPlace(result)} в фестивале ${festivalName(result)}`;
}

function professionPositions(nick: string): ProfessionPosition[] {
  const normalizedNick = nick.trim().toLocaleLowerCase("ru-RU");

  return PROFESSIONS.flatMap(({ key, label, icon }) => {
    const items = ratings[key]?.items ?? [];
    const index = items.findIndex(
      (item) => item.name.trim().toLocaleLowerCase("ru-RU") === normalizedNick,
    );

    if (index === -1) return [];
    const item = items[index];

    return [{
      key,
      label,
      icon,
      rank: item.rank ?? index + 1,
      value: item.value,
    }];
  });
}

function playerExperienceProgress(nick: string) {
  const normalizedNick = nick.trim().toLocaleLowerCase("ru-RU");
  const item = (ratings.players?.items ?? []).find(
    (candidate) =>
      candidate.name.trim().toLocaleLowerCase("ru-RU") === normalizedNick,
  );
  const experience = item?.experience ?? item?.exp;

  return typeof experience === "number" && Number.isFinite(experience)
    ? getExperienceProgress(experience)
    : undefined;
}

function formatRatingValue(value?: number | string): string {
  if (typeof value === "number") return value.toLocaleString("ru-RU");
  return value?.trim() ?? "—";
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
    .map<TimelineEntry>((event) => {
      const isPartnerEvent =
        event.characterId !== player.cuid &&
        sameText(event.partnerName, player.nick) &&
        (event.type === "player_married" || event.type === "player_divorced");

      const personalEvent = isPartnerEvent
        ? { ...event, partnerName: event.characterName }
        : event;

      return { kind: "event", date: event.createdAt, event: personalEvent };
    });

  const festivalEvents = getPlayerFestivalResults(news, player.nick).map<TimelineEntry>(
    (festival) => ({ kind: "festival", date: festival.date, festival }),
  );

  return [...personalEvents, ...festivalEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function ScrollIcon() {
  return (
    <svg className={styles.scrollIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
      <path d="M10 8h5M10 12h5" />
    </svg>
  );
}

function TimelineIcon({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === "festival") {
    const isPrizePlace =
      entry.festival.place != null &&
      entry.festival.place >= 1 &&
      entry.festival.place <= 3;

    return (
      <span className={`${styles.timelineIcon} ${styles.festivalIcon}`}>
        {isPrizePlace ? "🏆" : "🏅"}
      </span>
    );
  }

  if (entry.event.type === "player_level_up") {
    return (
      <span className={`${styles.timelineIcon} ${styles.levelEventIcon}`}>
        <b>{entry.event.newLevel ?? "★"}</b>
      </span>
    );
  }

  if (entry.event.type === "player_reincarnation_level_up") {
    return (
      <span className={`${styles.timelineIcon} ${styles.imageEventIcon}`}>
        <Image src="/images/players/reincarnation-wheel.png" alt="" width={239} height={240} unoptimized />
      </span>
    );
  }

  if (entry.event.type === "player_married") {
    return (
      <span className={`${styles.timelineIcon} ${styles.ringsIcon}`}>
        <Image src="/images/players/wedding-rings.png" alt="" width={220} height={132} unoptimized />
      </span>
    );
  }

  if (
    entry.event.type === "player_joined_clan" ||
    entry.event.type === "player_changed_clan" ||
    entry.event.type === "player_left_clan"
  ) {
    return (
      <span className={`${styles.timelineIcon} ${styles.bannerEventIcon}`}>
        <Image src="/images/players/clan-paw.png" alt="" width={375} height={487} unoptimized />
      </span>
    );
  }

  if (entry.event.type === "personal_smile_added") {
    return <span className={`${styles.timelineIcon} ${styles.smileEventIcon}`}>☺</span>;
  }

  if (entry.event.type === "player_position_changed") {
    return (
      <span className={`${styles.timelineIcon} ${styles.scrollEventIcon}`}>
        <ScrollIcon />
      </span>
    );
  }

  if (entry.event.type === "player_achievement_added") {
    return (
      <span className={`${styles.timelineIcon} ${styles.achievementEventIcon}`}>
        ★
      </span>
    );
  }

  return <span className={styles.timelineIcon}>{eventIcon(entry.event)}</span>;
}

function TimelineBody({ entry, compact = false }: { entry: TimelineEntry; compact?: boolean }) {
  if (entry.kind === "festival") {
    return (
      <>
        <time>{formatDate(entry.date)}</time>
        <h3>{festivalText(entry.festival)}</h3>
        {!compact && entry.festival.prizes.map((prize) => (
          <strong className={styles.prize} key={prize}>Приз: {prize}</strong>
        ))}
        {!compact ? (
          <a href={entry.festival.sourceUrl} target="_blank" rel="noreferrer">
            Новость на сайте игры ↗
          </a>
        ) : null}
      </>
    );
  }

  return (
    <>
      <time>{formatDate(entry.date)}</time>
      <h3>{eventText(entry.event)}</h3>
      {!compact && entry.event.type === "personal_smile_added" && entry.event.addedSmiles?.length ? (
        <div className={styles.eventSmiles}>
          {entry.event.addedSmiles.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Новый личный смайлик" key={src} loading="lazy" />
          ))}
        </div>
      ) : null}
      {!compact && entry.event.type === "player_achievement_added" && entry.event.addedAchievements?.length ? (
        <div className={styles.eventAchievements}>
          {entry.event.addedAchievements.map((achievement) => (
            <div className={styles.achievementCard} key={achievement.id}>
              {/* Иконки достижений ДМ загружаются с внешнего домена. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={achievement.imageUrl} alt="" loading="lazy" />
              <span>{achievement.name}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export async function generateMetadata(
  props: PageProps<"/players/[cuid]">,
): Promise<Metadata> {
  const { cuid } = await props.params;
  const player = findPlayer(cuid);
  if (!player) return { title: "Игрок не найден", robots: { index: false, follow: false } };

  const title = `${player.nick} — карточка игрока`;
  const description = `${player.nick}: уровень, клан, личные смайлики, именные вещи и события в летописи Древнего Мира.`;
  const preview = `/players/${player.cuid}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: `/players/${player.cuid}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/players/${player.cuid}`,
      images: [{
        url: preview,
        width: 1200,
        height: 630,
        alt: `${player.nick} — карточка игрока Древнего Мира`,
        type: "image/png",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [preview],
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
  const positions = professionPositions(player.nick);
  const experienceProgress = playerExperienceProgress(player.nick);
  const currentLevelUp =
    experienceProgress?.level === player.level ? experienceProgress.up : undefined;
  const currentReincarnationUp =
    currentLevelUp == null &&
    experienceProgress?.level === player.reincarnationLevel
      ? experienceProgress?.up
      : undefined;
  const displayedUp = currentLevelUp ?? player.levelUp;
  const displayedReincarnationUp =
    currentReincarnationUp ?? player.reincarnationUp;
  const displayedSmiles = smiles?.personalSmiles.slice(0, 8) ?? [];
  const displayedItems = items.slice(0, 8);
  const partner = player.marriagePartner
    ? players.find((item) => sameText(item.nick, player.marriagePartner))
    : undefined;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.profileCard} aria-labelledby="player-title">
          <div className={styles.portraitStage}>
            <PortraitGallery images={characterImages(player)} playerName={player.nick} />
          </div>

          <div className={styles.identity}>
            <h1 id="player-title">{player.nick}</h1>
            <div className={styles.activity}>
              <ActivityDot inactiveMinutes={player.inactiveMinutes} className="w-4 h-4" />
              <span>{activityLabel(player.inactiveMinutes)}</span>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.levelShield}><b>{player.level}</b></span>
                <strong>
                  Уровень {player.level}
                  {displayedUp != null ? `, ${displayedUp} ап` : ""}
                </strong>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/reincarnation-wheel.png" alt="" width={240} height={238} unoptimized />
                </span>
                <strong>
                  Реинкарнация: {player.reincarnationLevel != null
                    ? `${player.reincarnationLevel}${
                        displayedReincarnationUp != null
                          ? `, ${displayedReincarnationUp} ап`
                          : ""
                      }`
                    : "—"}
                </strong>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/clan-paw.png" alt="" width={180} height={228} unoptimized />
                </span>
                {clan ? <Link href={`/clans/${clan.clanId}`}>{clan.name}</Link> : <strong>Без клана</strong>}
              </div>
              <div className={styles.detailRow}>
                <span className={styles.assetMark}>
                  <Image src="/images/players/alliance-banner.png" alt="" width={194} height={240} unoptimized />
                </span>
                {player.allianceName ? <Link href="/alliances">Альянс «{player.allianceName}»</Link> : <strong>Без альянса</strong>}
              </div>
            </div>

            {player.profileUrl ? (
              <a href={player.profileUrl} target="_blank" rel="noreferrer" className={styles.dmLink} aria-label="Профиль в ДМ">
                <span className={styles.profileButton} />
              </a>
            ) : null}
          </div>

          <aside className={styles.familyCard}>
            <h2>Семья</h2>
            {player.marriagePartner ? (
              <>
                <div className={styles.couple}>
                  <div className={styles.familyPerson}>
                    <span className={styles.familyPortraitFrame}>
                      <PortraitImage src={characterImage(player)} alt={`Образ ${player.nick}`} className={styles.familyPortrait} fallbackClassName={styles.portraitFallback} />
                    </span>
                    <Link href={`/players/${player.cuid}`}>{player.nick}</Link>
                  </div>
                  <Image className={styles.weddingRings} src="/images/players/wedding-rings.png" alt="Обручальные кольца" width={220} height={132} unoptimized />
                  <div className={styles.familyPerson}>
                    <span className={styles.familyPortraitFrame}>
                      <PortraitImage src={characterImage(partner)} alt={`Образ ${player.marriagePartner}`} className={styles.familyPortrait} fallbackClassName={styles.portraitFallback} />
                    </span>
                    {partner ? <Link href={`/players/${partner.cuid}`}>{partner.nick}</Link> : <strong>{player.marriagePartner}</strong>}
                  </div>
                </div>
                {player.marriageSince ? <p className={styles.together}>Вместе с {player.marriageSince}</p> : null}
              </>
            ) : (
              <div className={styles.singleState}><span>♡</span><strong>Одиночка</strong></div>
            )}
          </aside>
        </section>

        <div className={styles.showcaseGrid}>
          <section className={styles.collectionPanel}>
            <header className={styles.collectionHeader}>
              <h2>Личные смайлики</h2>
              <p>{displayedSmiles.length} из {smiles?.personalSmilesCount ?? 0}</p>
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
              <h2>Именные вещи</h2>
              <p>{displayedItems.length} из {items.length}</p>
            </header>
            {displayedItems.length ? (
              <div className={styles.itemGrid}>
                {displayedItems.map((item) => (
                  <a href={item.itemUrl} target="_blank" rel="noreferrer" className={styles.itemCard} key={`${item.id}-${item.imageUrl}`} title={item.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  </a>
                ))}
              </div>
            ) : <p className={styles.emptyText}>Именных вещей пока нет.</p>}
            {items.length ? <Link className={styles.panelLink} href={`/personal-items?owner=${encodeURIComponent(player.nick)}`}>Показать все →</Link> : null}
          </section>

          <section className={styles.recentPanel}>
            <header className={styles.collectionHeader}><h2>Последние события</h2></header>
            {timeline.length ? (
              <div className={styles.recentTimeline}>
                {timeline.slice(0, PREVIEW_EVENTS).map((entry) => (
                  <article className={styles.recentEntry} key={entry.kind === "event" ? entry.event.id : entry.festival.id}>
                    <TimelineIcon entry={entry} />
                    <div><TimelineBody entry={entry} compact /></div>
                  </article>
                ))}
              </div>
            ) : <p className={styles.emptyText}>В личной летописи пока тихо.</p>}
          </section>
        </div>

        <section className={styles.ratingPositions}>
          <header className={styles.chronicleTitle}>
            <span />
            <h2>Позиции в рейтингах</h2>
            <span />
          </header>
          {positions.length ? (
            <div className={styles.ratingGrid}>
              {positions.map((position) => (
                <Link
                  className={styles.ratingCard}
                  href={`/ratings#${position.key}`}
                  key={position.key}
                >
                  <Image
                    className={styles.ratingIcon}
                    src={`/images/ratings/icons/${position.icon}`}
                    alt=""
                    width={118}
                    height={104}
                  />
                  <span className={styles.ratingCopy}>
                    <strong>{position.label}</strong>
                    <small>
                      {position.rank}-е место · {formatRatingValue(position.value)} очков
                    </small>
                  </span>
                  <span className={styles.ratingArrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>В топ-20 профессиональных рейтингов пока нет.</p>
          )}
        </section>

        <section className={styles.fullChronicle}>
          <header className={styles.chronicleTitle}><span /><h2>Личная летопись</h2><span /></header>
          {timeline.length ? (
            <div className={styles.fullTimeline}>
              {timeline.map((entry) => (
                <article className={styles.fullEntry} key={`full-${entry.kind === "event" ? entry.event.id : entry.festival.id}`}>
                  <time>{formatDate(entry.date)}</time>
                  <TimelineIcon entry={entry} />
                  <div className={styles.fullEntryBody}><TimelineBody entry={entry} /></div>
                </article>
              ))}
            </div>
          ) : <p className={styles.emptyText}>В личной летописи пока тихо.</p>}
        </section>
      </div>
    </main>
  );
}
