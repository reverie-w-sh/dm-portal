import Image from "next/image";
import clansData from "../../../data/clans.json";
import playersData from "../../../data/players.json";

const OUR_CLAN_ID = "278";

export default function MembersPage() {
  const clan = clansData.find((c) => c.clanId === OUR_CLAN_ID)!;

  const members = playersData
    .filter((p) => p.clanId === OUR_CLAN_ID)
    .sort((a, b) => b.level - a.level);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">

      {/* Clan header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <Image
              src={clan.crestSmall}
              alt={clan.name}
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink tracking-tight">{clan.name}</h1>
            <p className="text-ink-muted text-sm mt-0.5">
              {clan.slogan ? `${clan.slogan} · ` : ""}{clan.membersCount} участников
            </p>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Состав клана — {members.length} участников
          </h2>
        </div>

        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[32px_1fr_70px_1fr_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
          <div></div>
          <div>Ник</div>
          <div className="text-center">Уровень</div>
          <div>Должность</div>
          <div className="text-right">Профиль</div>
        </div>

        {/* Rows */}
        {members.map((player) => (
          <div
            key={player.cuid}
            className="flex sm:grid sm:grid-cols-[32px_1fr_70px_1fr_90px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
          >
            {/* Icon */}
            <div className="w-7 h-7 rounded overflow-hidden shrink-0 border border-white/10">
              <Image
                src={clan.crestSmall}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>

            {/* Nick */}
            <div className="flex-1 min-w-0">
              <span className="font-medium text-ink text-sm">{player.nick}</span>
              {/* Mobile fallback */}
              <div className="text-ink-muted text-xs sm:hidden mt-0.5">
                Ур. {player.level}
                {player.position ? ` · ${player.position}` : ""}
              </div>
            </div>

            {/* Level */}
            <div className="hidden sm:flex justify-center">
              <span className="text-accent font-black text-base">{player.level}</span>
            </div>

            {/* Position */}
            <div className="hidden sm:block min-w-0">
              <span className="text-ink-dim text-sm truncate block">
                {player.position || "—"}
              </span>
            </div>

            {/* Profile link */}
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
      </div>
    </div>
  );
}
