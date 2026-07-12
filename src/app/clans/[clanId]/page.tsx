import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clansJson from "../../../../data/clans.json";
import playersJson from "../../../../data/players.json";
import ClanSmiles from "@/components/ClanSmiles";

type Clan = {
  clanId: string;
  name: string;
  icon?: string;
  slogan?: string;
  crestSmall?: string;
  crestLarge: string;
  membersCount: number;
  members: string[];
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
};

const clansData = clansJson as Clan[];
const playersData = playersJson as Player[];

export async function generateStaticParams() {
  return clansData.map((clan) => ({
    clanId: clan.clanId,
  }));
}

export default async function ClanDetailPage(
  props: PageProps<"/clans/[clanId]">,
) {
  const { clanId } = await props.params;

  const clan = clansData.find(
    (item) => item.clanId === clanId,
  );

  if (!clan) {
    notFound();
  }

  const members = playersData
    .filter((player) =>
      clan.members.includes(player.cuid),
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

  const hasRealCrest =
    clan.crestLarge.startsWith("http");

  const hasPositions = members.some(
    (member) => member.position,
  );

  const allianceLargeUrl = clan.allianceId
    ? `https://dm-game.com/pics/alc/ali_${clan.allianceId}_b.jpg`
    : "";

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <Link
        href="/clans"
        className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8"
      >
        ← Кланы и состав
      </Link>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-7 items-start">
          <div className="flex flex-col sm:flex-row gap-5 items-start flex-1 min-w-0">
            <div className="shrink-0">
              {hasRealCrest ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={clan.crestLarge}
                    alt={`${clan.name} герб`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 glass rounded-xl flex items-center justify-center text-4xl">
                  {clan.icon ?? "🛡"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mb-1">
                {clan.name}
              </h1>

              {clan.slogan && (
                <p className="text-ink-muted text-sm mb-3">
                  {clan.slogan}
                </p>
              )}

              <div className="text-sm text-ink-muted">
                {clan.membersCount} участников
              </div>
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

                <div className="min-w-0">
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
                              className="w-[19px] h-[19px] object-contain shrink-0"
                            />
                          ) : (
                            <span className="w-[19px] text-center">
                              {allianceClan.icon ?? "🛡"}
                            </span>
                          )}

                          <span className="text-sm font-semibold text-ink truncate">
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

      <details className="group glass rounded-2xl mb-6 overflow-hidden">
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none hover:bg-white/[0.03] transition-colors [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Клановые смайлики :)
          </span>

          <span className="text-ink-muted text-lg transition-transform duration-200 group-open:rotate-180">
            ⌄
          </span>
        </summary>

        <div className="border-t border-white/[0.06] px-5 py-5">
          <ClanSmiles clanId={clan.clanId} />
        </div>
      </details>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Участники — {members.length}
          </h2>
        </div>

        {members.length > 0 ? (
          <>
            {hasPositions ? (
              <div className="hidden sm:grid grid-cols-[32px_1fr_70px_70px_1fr_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
                <div />
                <div>Ник</div>
                <div className="text-center">Уровень</div>
                <div className="text-center">Реинк.</div>
                <div>Должность</div>
                <div className="text-right">Профиль</div>
              </div>
            ) : (
              <div className="hidden sm:grid grid-cols-[32px_1fr_70px_70px_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
                <div />
                <div>Ник</div>
                <div className="text-center">Уровень</div>
                <div className="text-center">Реинк.</div>
                <div className="text-right">Профиль</div>
              </div>
            )}

            {members.map((player) => (
              <div
                key={player.cuid}
                className={[
                  "flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors",
                  hasPositions
                    ? "sm:grid sm:grid-cols-[32px_1fr_70px_70px_1fr_90px]"
                    : "sm:grid sm:grid-cols-[32px_1fr_70px_70px_90px]",
                ].join(" ")}
              >
                <div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-white/10 flex items-center justify-center text-sm">
                  {clan.crestSmall ? (
                    <Image
                      src={clan.crestSmall}
                      alt=""
                      width={28}
                      height={28}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span>{clan.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-medium text-ink text-sm">
                    {player.nick}
                  </span>

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

                {hasPositions && (
                  <div className="hidden sm:block min-w-0">
                    <span className="text-ink-dim text-sm truncate block">
                      {player.position || "—"}
                    </span>
                  </div>
                )}

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
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="text-ink-muted text-sm">
              Участники не указаны
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
