import Image from "next/image";
import Link from "next/link";
import clansJson from "../../../../data/clans.json";
import playersJson from "../../../../data/players.json";
import EngravedPawIcon from "@/components/EngravedPawIcon";

type Clan = {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
  crestLarge?: string;
  membersCount: number;
  members: string[];
  smilesCount?: number;
  allianceId?: string;
  allianceName?: string;
};

type Player = {
  cuid: string;
  nick: string;
  level: number;
  reincarnationLevel?: number | null;
  clanId: string;
  profileUrl?: string;
};

type ComparedClan = Clan & {
  membersData: Player[];
  averageLevel: number;
  maximumLevel: number;
  averageReincarnation: number | null;
  smilesPerMember: number;
};

type ComparePageProps = {
  searchParams: Promise<{
    ids?: string | string[];
  }>;
};

const clansData = clansJson as Clan[];
const playersData = playersJson as Player[];

function formatNumber(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function sortMembers(
  members: Player[],
): Player[] {
  return [...members].sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    }

    const reincarnationDifference =
      (b.reincarnationLevel ?? 0) -
      (a.reincarnationLevel ?? 0);

    if (reincarnationDifference !== 0) {
      return reincarnationDifference;
    }

    return a.nick.localeCompare(
      b.nick,
      "ru",
      { sensitivity: "base" },
    );
  });
}

function makeComparedClan(clan: Clan): ComparedClan {
  const membersData = sortMembers(
    playersData.filter((player) =>
      clan.members.includes(player.cuid),
    ),
  );

  const levelSum = membersData.reduce(
    (sum, player) => sum + player.level,
    0,
  );

  const reincarnationValues = membersData
    .map((player) => player.reincarnationLevel)
    .filter(
      (value): value is number =>
        typeof value === "number",
    );

  const reincarnationSum =
    reincarnationValues.reduce(
      (sum, value) => sum + value,
      0,
    );

  return {
    ...clan,
    membersData,
    averageLevel:
      membersData.length > 0
        ? levelSum / membersData.length
        : 0,
    maximumLevel:
      membersData.length > 0
        ? Math.max(
            ...membersData.map(
              (player) => player.level,
            ),
          )
        : 0,
    averageReincarnation:
      reincarnationValues.length > 0
        ? reincarnationSum /
          reincarnationValues.length
        : null,
    smilesPerMember:
      clan.membersCount > 0
        ? (clan.smilesCount ?? 0) /
          clan.membersCount
        : 0,
  };
}

function getUniqueWinnerIndex(
  values: Array<number | null>,
): number | null {
  const numericValues = values.map(
    (value) =>
      typeof value === "number"
        ? value
        : Number.NEGATIVE_INFINITY,
  );

  const maximum = Math.max(...numericValues);

  if (!Number.isFinite(maximum)) {
    return null;
  }

  const winnerIndexes = numericValues
    .map((value, index) =>
      value === maximum ? index : -1,
    )
    .filter((index) => index !== -1);

  return winnerIndexes.length === 1
    ? winnerIndexes[0]
    : null;
}

function WinnerValue({
  children,
  isWinner,
}: {
  children: React.ReactNode;
  isWinner: boolean;
}) {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 font-black text-ink">
      <span>{children}</span>

      {isWinner && (
<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2.2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-4 h-4 text-accent"
  aria-hidden="true"
>
  <path d="m5 12 4 4L19 6" />
</svg>
      )}
    </div>
  );
}

export default async function CompareClansPage({
  searchParams,
}: ComparePageProps) {
  const resolvedSearchParams =
    await searchParams;

  const rawIds = Array.isArray(
    resolvedSearchParams.ids,
  )
    ? resolvedSearchParams.ids.join(",")
    : resolvedSearchParams.ids ?? "";

  const ids = Array.from(
    new Set(
      rawIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);

  const comparedClans = ids
    .map((id) =>
      clansData.find((clan) => clan.clanId === id),
    )
    .filter((clan): clan is Clan => Boolean(clan))
    .map(makeComparedClan);

  if (comparedClans.length < 2) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 py-10">
        <Link
          href="/clans"
          className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8"
        >
          ← Вернуться к кланам
        </Link>

        <div className="glass rounded-2xl p-12 text-center">
          <h1 className="text-2xl font-black text-ink">
            Недостаточно кланов для сравнения
          </h1>

          <p className="text-ink-muted text-sm mt-2">
            Выберите на странице кланов минимум два клана.
          </p>
        </div>
      </div>
    );
  }

  const winners = {
    members: getUniqueWinnerIndex(
      comparedClans.map(
        (clan) => clan.membersCount,
      ),
    ),
    smiles: getUniqueWinnerIndex(
      comparedClans.map(
        (clan) => clan.smilesCount ?? 0,
      ),
    ),
    smilesPerMember: getUniqueWinnerIndex(
      comparedClans.map(
        (clan) => clan.smilesPerMember,
      ),
    ),
    averageLevel: getUniqueWinnerIndex(
      comparedClans.map(
        (clan) => clan.averageLevel,
      ),
    ),
    maximumLevel: getUniqueWinnerIndex(
      comparedClans.map(
        (clan) => clan.maximumLevel,
      ),
    ),
    averageReincarnation:
      getUniqueWinnerIndex(
        comparedClans.map(
          (clan) =>
            clan.averageReincarnation,
        ),
      ),
  };

  const statisticRows = [
    {
      key: "members",
      label: "👥 Участников",
      values: comparedClans.map(
        (clan) => clan.membersCount,
      ),
      display: (value: number) =>
        String(value),
      winner: winners.members,
    },
    {
      key: "smiles",
      label: "😊 Клановых смайликов",
      values: comparedClans.map(
        (clan) => clan.smilesCount ?? 0,
      ),
      display: (value: number) =>
        String(value),
      winner: winners.smiles,
    },
    {
      key: "smiles-per-member",
      label: "🙂 Смайлик на нос :)",
      values: comparedClans.map(
        (clan) => clan.smilesPerMember,
      ),
      display: (value: number) =>
        formatNumber(value),
      winner: winners.smilesPerMember,
    },
    {
      key: "alliance",
      label: "🤝 Альянс",
      values: comparedClans.map(
        (clan) => clan.allianceName || "—",
      ),
      display: (value: string) =>
        value,
      winner: null,
    },
    {
      key: "average-level",
      label: "📈 Средний уровень",
      values: comparedClans.map(
        (clan) => clan.averageLevel,
      ),
      display: (value: number) =>
        formatNumber(value),
      winner: winners.averageLevel,
    },
    {
      key: "maximum-level",
      label: "⭐ Максимальный уровень",
      values: comparedClans.map(
        (clan) => clan.maximumLevel,
      ),
      display: (value: number) =>
        String(value),
      winner: winners.maximumLevel,
    },
    {
      key: "average-reincarnation",
      label: "🔥 Средняя реинкарнация",
      values: comparedClans.map(
        (clan) =>
          clan.averageReincarnation,
      ),
      display: (
        value: number | null,
      ) =>
        value === null
          ? "—"
          : formatNumber(value),
      winner:
        winners.averageReincarnation,
    },
  ];

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-10">
      <Link
        href="/clans"
        className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8"
      >
        ← Выбрать другие кланы
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Сравнение кланов
        </h1>

        <p className="text-ink-muted text-sm mt-2">
          Выбери для сравнения два-три клана, посмотрим, кто круче :)
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-8 overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className="grid border-b border-black/10"
            style={{
              gridTemplateColumns: `minmax(190px, .85fr) repeat(${comparedClans.length}, minmax(190px, 1fr))`,
            }}
          >
            <div className="p-5 flex items-end">
              <span className="text-xs uppercase tracking-wider text-ink-muted font-semibold">
                Показатель
              </span>
            </div>

            {comparedClans.map((clan) => (
              <Link
                key={clan.clanId}
                href={`/clans/${clan.clanId}`}
                className="p-5 border-l border-black/10 hover:bg-white/35 transition-colors"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 bg-white/50">
                    {clan.crestLarge ? (
                      <Image
                        src={clan.crestLarge}
                        alt=""
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {clan.icon ?? "🛡"}
                      </div>
                    )}
                  </div>

                  <span className="font-black text-ink leading-tight">
                    {clan.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {statisticRows.map((row) => (
            <div
              key={row.key}
              className="grid border-b border-black/[0.07] last:border-0 hover:bg-white/20 transition-colors"
              style={{
                gridTemplateColumns: `minmax(190px, .85fr) repeat(${comparedClans.length}, minmax(190px, 1fr))`,
              }}
            >
              <div className="px-5 py-4 text-sm font-semibold text-ink-muted">
                {row.label}
              </div>

              {row.values.map(
                (value, index) => (
                  <div
                    key={`${row.key}-${comparedClans[index].clanId}`}
                    className="px-5 py-4 border-l border-black/[0.07] text-center text-sm"
                  >
                    <WinnerValue
                      isWinner={
                        row.winner === index
                      }
                    >
                      {(
                        row.display as (
                          value: never,
                        ) => string
                      )(value as never)}
                    </WinnerValue>
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={[
          "grid gap-5 items-start",
          comparedClans.length === 2
            ? "md:grid-cols-2"
            : "lg:grid-cols-3",
        ].join(" ")}
      >
        {comparedClans.map((clan) => {
          const firstRegularIndex =
            clan.membersData.findIndex(
              (player) => player.level < 14,
            );

          return (
            <section
              key={clan.clanId}
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-black/10">
                <div className="flex items-center gap-3">
                  {clan.crestSmall ? (
                    <Image
                      src={clan.crestSmall}
                      alt=""
                      width={28}
                      height={28}
                      unoptimized
                      className="w-7 h-7 object-contain"
                    />
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center">
                      {clan.icon ?? "🛡"}
                    </span>
                  )}

                  <div className="min-w-0">
                    <h2 className="font-black text-ink truncate">
                      {clan.name}
                    </h2>

                    <p className="text-xs text-ink-muted mt-0.5">
                      {clan.membersData.length} участников
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {clan.membersData.map(
                  (player, index) => {
                    const highlighted =
                      player.level >= 14;

                    const showDivider =
                      firstRegularIndex !== -1 &&
                      index === firstRegularIndex;

                    return (
                      <div
                        key={player.cuid}
                        className={[
                          "flex items-center gap-3 px-5 py-3 border-b border-black/[0.06] last:border-0 transition-colors",
                          highlighted
                            ? "bg-accent/[0.075] hover:bg-accent/[0.11]"
                            : "hover:bg-white/25",
                          showDivider
                            ? "border-t-2 border-t-accent/20"
                            : "",
                        ].join(" ")}
                      >
                        <div className="w-[62px] shrink-0 flex items-baseline">
                          <span
                            className={[
                              "font-black",
                              highlighted
                                ? "text-accent text-base"
                                : "text-ink text-sm",
                            ].join(" ")}
                          >
                            {player.level}
                          </span>

                          <span className="text-ink-muted text-xs ml-0.5">
                            /
                            {player.reincarnationLevel ??
                              "—"}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {player.profileUrl ? (
                            <a
                              href={player.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={[
                                "truncate block hover:underline",
                                highlighted
                                  ? "font-black text-ink"
                                  : "font-medium text-ink text-sm",
                              ].join(" ")}
                            >
                              {player.nick}
                            </a>
                          ) : (
                            <span
                              className={[
                                "truncate block",
                                highlighted
                                  ? "font-black text-ink"
                                  : "font-medium text-ink text-sm",
                              ].join(" ")}
                            >
                              {player.nick}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-muted mt-7">

    🙂 Смайлик на нос = количество клановых смайликов ÷ количество участников.
    <br />
    Да, мы тоже не знаем, зачем это считать))
      </p>
    </div>
  );
}
