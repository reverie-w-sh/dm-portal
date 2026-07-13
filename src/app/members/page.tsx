import Image from "next/image";
import Link from "next/link";
import clansJson from "../../../data/clans.json";
import playersJson from "../../../data/players.json";
import {
  ActivityDot,
  ActivityLegend,
} from "@/components/ActivityStatus";

const OUR_CLAN_ID = "278";

type Clan = {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
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

const clansData = clansJson as Clan[];
const playersData = playersJson as Player[];

export default function MembersPage() {
  const clan = clansData.find(
    (item) => item.clanId === OUR_CLAN_ID,
  )!;

  const members = playersData
    .filter(
      (player) => player.clanId === OUR_CLAN_ID,
    )
    .sort((a, b) => {
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

  const allianceClans =
    clan.allianceId
      ? clansData
          .filter(
            (item) =>
              item.allianceId === clan.allianceId &&
              item.clanId !== clan.clanId,
          )
          .sort((a, b) =>
            a.name.localeCompare(
              b.name,
              "ru",
              { sensitivity: "base" },
            ),
          )
      : [];

  const allianceLargeUrl = clan.allianceId
    ? `https://dm-game.com/pics/alc/ali_${clan.allianceId}_b.jpg`
    : "";

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-5">
  <ActivityLegend />
</div>
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#d3d3d3] border border-black/15">
              <Image
                src="https://dm-game.com/pics/clanpic/clan_278_b.jpg"
                alt={clan.name}
                width={80}
                height={80}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-ink tracking-tight">
                {clan.name}
              </h1>

              <p className="text-ink-muted text-sm mt-1">
                {clan.membersCount} участников
              </p>
            </div>
          </div>

          {clan.allianceId && clan.allianceName && (
            <aside className="w-full lg:w-[360px] lg:border-l lg:border-black/10 lg:pl-7">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 bg-white/40 shrink-0">
                  <Image
                    src={allianceLargeUrl}
                    alt={`Альянс ${clan.allianceName}`}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-muted">
                    Альянс
                  </div>

                  <div className="font-black text-ink text-lg mt-1">
                    {clan.allianceName}
                  </div>
                </div>
              </div>

              {allianceClans.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                    В одном альянсе с:
                  </div>

                  <div className="space-y-2">
                    {allianceClans.map(
                      (allianceClan) => (
                        <Link
                          key={allianceClan.clanId}
                          href={`/clans/${allianceClan.clanId}`}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/40 transition-colors"
                        >
                          {allianceClan.crestSmall ? (
                            <Image
                              src={allianceClan.crestSmall}
                              alt=""
                              width={19}
                              height={19}
                              unoptimized
                              className="w-[19px] h-[19px] object-contain"
                            />
                          ) : (
                            <span className="w-[19px] text-center">
                              {allianceClan.icon ?? "🛡"}
                            </span>
                          )}

                          <span className="text-sm font-semibold text-ink">
                            {allianceClan.name}
                          </span>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Состав клана — {members.length} участников
          </h2>
        </div>

        <div className="hidden sm:grid grid-cols-[32px_1fr_70px_70px_1fr_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
          <div />
          <div>Ник</div>
          <div className="text-center">Уровень</div>
          <div className="text-center">Реинк.</div>
          <div>Должность</div>
          <div className="text-right">Профиль</div>
        </div>

        {members.map((player) => (
          <div
            key={player.cuid}
            className="flex sm:grid sm:grid-cols-[32px_1fr_70px_70px_1fr_90px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-white/10">
              <Image
                src={clan.crestSmall ?? ""}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>

{/* Nick */}
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">
    <ActivityDot
      inactiveMinutes={player.inactiveMinutes}
    />

    <span className="font-medium text-ink text-sm">
      {player.nick}
    </span>
  </div>

              <div className="text-ink-muted text-xs sm:hidden mt-0.5">
                Ур. {player.level}
                {player.reincarnationLevel != null
                  ? ` · Реинк. ${player.reincarnationLevel}`
                  : ""}
                {player.position
                  ? ` · ${player.position}`
                  : ""}
              </div>
            </div>

            <div className="hidden sm:flex justify-center">
              <span className="text-accent font-black text-base">
                {player.level}
              </span>
            </div>

            <div className="hidden sm:flex justify-center">
              <span className="text-ink-dim font-semibold text-sm">
                {player.reincarnationLevel ?? "—"}
              </span>
            </div>

            <div className="hidden sm:block min-w-0">
              <span className="text-ink-dim text-sm truncate block">
                {player.position || "—"}
              </span>
            </div>

            <div className="text-right shrink-0">
              {player.profileUrl ? (
                <a
                  href={player.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Профиль ↗
                </a>
              ) : (
                <span className="text-xs text-ink-muted">
                  —
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
