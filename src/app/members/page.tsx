import Image from "next/image";
import Link from "next/link";
import clansJson from "../../../data/clans.json";
import playersJson from "../../../data/players.json";
import styles from "./page.module.css";

const OUR_CLAN_ID = "278";

type Clan = {
  clanId: string;
  name: string;
  membersCount: number;
  allianceId?: string;
  allianceName?: string;
};

type Player = {
  cuid: string;
  nick: string;
  level: number;
  reincarnationLevel?: number | null;
  position?: string;
  profileUrl?: string;
  clanId: string;
  inactiveMinutes?: number | null;
};

type ActivityCategory = {
  className: string;
  label: string;
};

const clansData = clansJson as Clan[];
const playersData = playersJson as Player[];

function formatWolves(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return `${count} волчат`;
  }

  if (remainder10 === 1) {
    return `${count} волчонок`;
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return `${count} волчонка`;
  }

  return `${count} волчат`;
}

function getActivityCategory(
  inactiveMinutes?: number | null,
): ActivityCategory {
  if (inactiveMinutes != null && inactiveMinutes < 2 * 24 * 60) {
    return {
      className: styles.activityRecent,
      label: "Заходил менее 48 часов назад",
    };
  }

  if (inactiveMinutes != null && inactiveMinutes < 7 * 24 * 60) {
    return {
      className: styles.activityWeek,
      label: "Заходил от 2 до 7 дней назад",
    };
  }

  if (inactiveMinutes != null && inactiveMinutes < 30 * 24 * 60) {
    return {
      className: styles.activityMonth,
      label: "Заходил от 7 до 30 дней назад",
    };
  }

  return {
    className: styles.activityOld,
    label:
      inactiveMinutes == null
        ? "Нет данных о последнем входе"
        : "Заходил больше месяца назад",
  };
}

function ActivityDot({
  inactiveMinutes,
}: {
  inactiveMinutes?: number | null;
}) {
  const activity = getActivityCategory(inactiveMinutes);

  return (
    <span
      className={`${styles.activityDot} ${activity.className}`}
      title={activity.label}
      aria-label={activity.label}
      role="img"
    />
  );
}

const legendItems = [
  { className: styles.activityRecent, label: "до 48 часов" },
  { className: styles.activityWeek, label: "2–7 дней" },
  { className: styles.activityMonth, label: "7–30 дней" },
  { className: styles.activityOld, label: "больше месяца" },
];

export default function MembersPage() {
  const clan = clansData.find((item) => item.clanId === OUR_CLAN_ID)!;

  const members = playersData
    .filter((player) => player.clanId === OUR_CLAN_ID)
    .sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level;
      }

      const reincarnationDifference =
        (b.reincarnationLevel ?? 0) - (a.reincarnationLevel ?? 0);

      if (reincarnationDifference !== 0) {
        return reincarnationDifference;
      }

      return a.nick.localeCompare(b.nick, "ru", { sensitivity: "base" });
    });

  const wolvesLabel = formatWolves(members.length);

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <section className={styles.hero} aria-labelledby="members-title">
          <Image
            src="/og/members.webp"
            alt="Белая и тёмная волчицы возле знамени клана die Wölfchen"
            fill
            priority
            sizes="(max-width: 1180px) 100vw, 1120px"
            className={styles.heroImage}
          />

          <div className={styles.heroShade} />

          <div className={styles.heroContent}>
            <h1 id="members-title" className={styles.srOnly}>Наша стая</h1>
            <p>
              {clan.name} <span aria-hidden="true">·</span> {wolvesLabel}
            </p>

            <div className={styles.heroActions}>
              <Link href="/about" className={styles.heroButton}>
                О клане
              </Link>

              {clan.allianceName ? (
                <Link href="/alliances" className={styles.heroButton}>
                  Альянс «{clan.allianceName}»
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.membersSection} aria-labelledby="members-list-title">
          <header className={styles.sectionHeader}>
            <h2 id="members-list-title">Состав клана — {wolvesLabel}</h2>

            <div className={styles.legend} aria-label="Обозначения последнего входа">
              {legendItems.map((item) => (
                <span key={item.label} className={styles.legendItem}>
                  <span
                    className={`${styles.activityDot} ${item.className}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </header>

          <div className={styles.membersGrid}>
            {members.map((player) => (
              <article key={player.cuid} className={styles.memberCard}>
                <ActivityDot inactiveMinutes={player.inactiveMinutes} />

                <div className={styles.memberIdentity}>
                  <h3>{player.nick}</h3>
                  <p>{player.position || "Без должности"}</p>
                </div>

                <div
                  className={styles.levelShield}
                  aria-label={`Уровень ${player.level}`}
                  title={`Уровень ${player.level}`}
                >
                  <span>{player.level}</span>
                </div>

                <div className={styles.memberMeta}>
                  <span className={styles.reincarnationLabel}>Реинкарнация</span>
                  <strong>{player.reincarnationLevel ?? "—"}</strong>

                  {player.profileUrl ? (
                    <a
                      href={player.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.profileLink}
                    >
                      Профиль <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
