import Image from "next/image";
import Link from "next/link";
import clansJson from "../../../../data/clans.json";
import playersJson from "../../../../data/players.json";

type Clan = {
  clanId: string;
  name: string;
  crestSmall?: string;
  members: string[];
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

type ComparedAlliance = {
  allianceId: string;
  allianceName: string;
  clans: Clan[];
  members: Player[];
  averageLevel: number;
  maximumLevel: number;
};

type ComparePageProps = {
  searchParams: Promise<{ ids?: string | string[] }>;
};

const clansData = clansJson as Clan[];
const playersData = playersJson as Player[];

function formatNumber(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function sortMembers(members: Player[]): Player[] {
  return [...members].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;

    const reincarnationDifference =
      (b.reincarnationLevel ?? 0) - (a.reincarnationLevel ?? 0);

    if (reincarnationDifference !== 0) return reincarnationDifference;

    return a.nick.localeCompare(b.nick, "ru", { sensitivity: "base" });
  });
}

function buildComparedAlliance(allianceId: string): ComparedAlliance | null {
  const clans = clansData
    .filter((clan) => clan.allianceId === allianceId && clan.allianceName)
    .sort((a, b) =>
      a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
    );

  if (clans.length === 0) return null;

  const clanIds = new Set(clans.map((clan) => clan.clanId));
  const members = sortMembers(
    playersData.filter((player) => clanIds.has(player.clanId)),
  );

  const levelSum = members.reduce((sum, player) => sum + player.level, 0);

  return {
    allianceId,
    allianceName: clans[0].allianceName ?? `Альянс ${allianceId}`,
    clans,
    members,
    averageLevel: members.length > 0 ? levelSum / members.length : 0,
    maximumLevel:
      members.length > 0
        ? Math.max(...members.map((player) => player.level))
        : 0,
  };
}

function getUniqueWinnerIndex(values: number[]): number | null {
  const maximum = Math.max(...values);
  const indexes = values
    .map((value, index) => (value === maximum ? index : -1))
    .filter((index) => index !== -1);

  return indexes.length === 1 ? indexes[0] : null;
}

function WinnerValue({ children, isWinner }: { children: React.ReactNode; isWinner: boolean }) {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 font-black text-ink">
      <span>{children}</span>
      {isWinner && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-accent" aria-hidden="true">
          <path d="m5 12 4 4L19 6" />
        </svg>
      )}
    </div>
  );
}

export default async function CompareAlliancesPage({ searchParams }: ComparePageProps) {
  const resolved = await searchParams;
  const rawIds = Array.isArray(resolved.ids) ? resolved.ids.join(",") : resolved.ids ?? "";
  const ids = Array.from(new Set(rawIds.split(",").map((id) => id.trim()).filter(Boolean))).slice(0, 3);

  const comparedAlliances = ids
    .map(buildComparedAlliance)
    .filter((alliance): alliance is ComparedAlliance => Boolean(alliance));

  if (comparedAlliances.length < 2) {
    return (
      <div className="max-w-[1180px] mx-auto px-6 py-10">
        <Link href="/alliances" className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8">
          ← Вернуться к альянсам
        </Link>
        <div className="glass rounded-2xl p-12 text-center">
          <h1 className="text-2xl font-black text-ink">Недостаточно альянсов для сравнения</h1>
          <p className="text-ink-muted text-sm mt-2">Выберите минимум два альянса.</p>
        </div>
      </div>
    );
  }

  const winners = {
    members: getUniqueWinnerIndex(comparedAlliances.map((alliance) => alliance.members.length)),
    maximumLevel: getUniqueWinnerIndex(comparedAlliances.map((alliance) => alliance.maximumLevel)),
    averageLevel: getUniqueWinnerIndex(comparedAlliances.map((alliance) => alliance.averageLevel)),
  };

  const rows = [
    {
      key: "members",
      label: "👥 Участников",
      values: comparedAlliances.map((alliance) => alliance.members.length),
      display: (value: number) => String(value),
      winner: winners.members,
    },
    {
      key: "maximum-level",
      label: "⭐ Максимальный уровень",
      values: comparedAlliances.map((alliance) => alliance.maximumLevel),
      display: (value: number) => String(value),
      winner: winners.maximumLevel,
    },
    {
      key: "average-level",
      label: "📈 Средний уровень",
      values: comparedAlliances.map((alliance) => alliance.averageLevel),
      display: (value: number) => formatNumber(value),
      winner: winners.averageLevel,
    },
  ];

  const clansById = new Map(clansData.map((clan) => [clan.clanId, clan]));

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-10">
      <Link href="/alliances" className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8">
        ← Выбрать другие альянсы
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink tracking-tight">Сравнение альянсов</h1>
        <p className="text-ink-muted text-sm mt-2">Игроки всех кланов каждого альянса</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-8 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid border-b border-black/10" style={{ gridTemplateColumns: `minmax(190px, .85fr) repeat(${comparedAlliances.length}, minmax(190px, 1fr))` }}>
            <div className="p-5 flex items-end">
              <span className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Показатель</span>
            </div>

            {comparedAlliances.map((alliance) => (
              <div key={alliance.allianceId} className="p-5 border-l border-black/10">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 bg-[#d4d4d4]">
                    <Image src={`https://dm-game.com/pics/alc/ali_${alliance.allianceId}_b.jpg`} alt="" fill unoptimized className="object-contain" />
                  </div>
                  <span className="font-black text-ink leading-tight">{alliance.allianceName}</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {alliance.clans.map((clan) => (
                      <Link key={clan.clanId} href={`/clans/${clan.clanId}`} className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent">
                        {clan.crestSmall && (
                          <Image src={clan.crestSmall} alt="" width={17} height={17} unoptimized className="w-[17px] h-[17px] object-contain" />
                        )}
                        <span>{clan.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.key} className="grid border-b border-black/[0.07] last:border-0 hover:bg-white/20 transition-colors" style={{ gridTemplateColumns: `minmax(190px, .85fr) repeat(${comparedAlliances.length}, minmax(190px, 1fr))` }}>
              <div className="px-5 py-4 text-sm font-semibold text-ink-muted">{row.label}</div>
              {row.values.map((value, index) => (
                <div key={`${row.key}-${comparedAlliances[index].allianceId}`} className="px-5 py-4 border-l border-black/[0.07] text-center text-sm">
                  <WinnerValue isWinner={row.winner === index}>{row.display(value)}</WinnerValue>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={["grid gap-5 items-start", comparedAlliances.length === 2 ? "md:grid-cols-2" : "lg:grid-cols-3"].join(" ")}>
        {comparedAlliances.map((alliance) => {
          const firstRegularIndex = alliance.members.findIndex((player) => player.level < 14);

          return (
            <section key={alliance.allianceId} className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/10">
                <h2 className="font-black text-ink">{alliance.allianceName}</h2>
                <p className="text-xs text-ink-muted mt-0.5">{alliance.members.length} участников</p>
              </div>

              <div>
                {alliance.members.map((player, index) => {
                  const highlighted = player.level >= 14;
                  const showDivider = firstRegularIndex !== -1 && index === firstRegularIndex;
                  const clan = clansById.get(player.clanId);

                  return (
                    <div key={player.cuid} className={[
                      "flex items-center gap-3 px-5 py-3 border-b border-black/[0.06] last:border-0 transition-colors",
                      highlighted ? "bg-accent/[0.075] hover:bg-accent/[0.11]" : "hover:bg-white/25",
                      showDivider ? "border-t-2 border-t-accent/20" : "",
                    ].join(" ")}>
                      <div className="w-[62px] shrink-0 flex items-baseline">
                        <span className={["font-black", highlighted ? "text-accent text-base" : "text-ink text-sm"].join(" ")}>{player.level}</span>
                        <span className="text-ink-muted text-xs ml-0.5">/{player.reincarnationLevel ?? "—"}</span>
                      </div>

                      {clan?.crestSmall ? (
                        <Image src={clan.crestSmall} alt="" width={19} height={19} unoptimized title={clan.name} className="w-[19px] h-[19px] object-contain shrink-0" />
                      ) : (
                        <span className="w-[19px] shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        {player.profileUrl ? (
                          <a href={player.profileUrl} target="_blank" rel="noopener noreferrer" className={["truncate block hover:underline", highlighted ? "font-black text-ink" : "font-medium text-ink text-sm"].join(" ")}>{player.nick}</a>
                        ) : (
                          <span className={["truncate block", highlighted ? "font-black text-ink" : "font-medium text-ink text-sm"].join(" ")}>{player.nick}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
