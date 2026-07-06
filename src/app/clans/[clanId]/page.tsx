import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clansData from "../../../../data/clans.json";
import playersData from "../../../../data/players.json";

export async function generateStaticParams() {
  return clansData.map((c) => ({ clanId: c.clanId }));
}

export default async function ClanDetailPage(props: PageProps<"/clans/[clanId]">) {
  const { clanId } = await props.params;
  const clan = clansData.find((c) => c.clanId === clanId);

  if (!clan) notFound();

  const members = playersData
    .filter((p) => clan.members.includes(p.cuid))
    .sort((a, b) => b.level - a.level);

  const hasRealCrest = clan.crestLarge.startsWith("http");
  const hasPositions = members.some((m) => m.position);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <Link
        href="/clans"
        className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8"
      >
        ← Кланы и состав
      </Link>

      {/* Clan header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
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

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mb-1">
              {clan.name}
            </h1>
            {clan.slogan && (
              <p className="text-ink-muted text-sm mb-3">{clan.slogan}</p>
            )}
            <div className="text-sm text-ink-muted">
              {clan.membersCount} участников
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Участники — {members.length}
          </h2>
        </div>

        {members.length > 0 ? (
          <>
            {/* Desktop header — show Должность only when clan has positions */}
            {hasPositions ? (
              <div className="hidden sm:grid grid-cols-[32px_1fr_70px_1fr_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
                <div></div>
                <div>Ник</div>
                <div className="text-center">Уровень</div>
                <div>Должность</div>
                <div className="text-right">Профиль</div>
              </div>
            ) : (
              <div className="hidden sm:grid grid-cols-[32px_1fr_70px_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
                <div></div>
                <div>Ник</div>
                <div className="text-center">Уровень</div>
                <div className="text-right">Профиль</div>
              </div>
            )}

            {members.map((player) => (
              <div
                key={player.cuid}
                className={[
                  "flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors",
                  hasPositions
                    ? "sm:grid sm:grid-cols-[32px_1fr_70px_1fr_90px]"
                    : "sm:grid sm:grid-cols-[32px_1fr_70px_90px]",
                ].join(" ")}
              >
                {/* Icon */}
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

                {/* Nick */}
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-ink text-sm">{player.nick}</span>
                  <div className="text-ink-muted text-xs sm:hidden mt-0.5">
                    Ур. {player.level}
                    {player.position ? ` · ${player.position}` : ""}
                  </div>
                </div>

                {/* Level */}
                <div className="hidden sm:flex justify-center">
                  <span className="text-accent font-black text-base">{player.level}</span>
                </div>

                {/* Position (only when clan has positions) */}
                {hasPositions && (
                  <div className="hidden sm:block min-w-0">
                    <span className="text-ink-dim text-sm truncate block">
                      {player.position || "—"}
                    </span>
                  </div>
                )}

                {/* Profile */}
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
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="text-ink-muted text-sm">Участники не указаны</p>
          </div>
        )}
      </div>
    </div>
  );
}
