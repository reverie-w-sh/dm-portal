import Image from "next/image";
import clansData from "../../../data/clans.json";
import playersData from "../../../data/players.json";

const OUR_CLAN_ID = "278";

type Player = {
  cuid: string;
  nick: string;
  level: number;
  reincarnationLevel?: number | null;
  position?: string;
  profileUrl?: string;
  clanId: string;
};

export default function MembersPage() {
  const clan = clansData.find(
    (item) => item.clanId === OUR_CLAN_ID
  )!;

  const members = (playersData as Player[])
    .filter(
      (player) => player.clanId === OUR_CLAN_ID
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

      return a.nick.localeCompare(b.nick, "ru", {
        sensitivity: "base",
      });
    });

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      {/* Clan header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-5">
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
      </div>

      {/* Members table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Состав клана — {members.length} участников
          </h2>
        </div>

        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[32px_1fr_70px_70px_1fr_90px] gap-3 px-5 py-2 text-[11px] font-medium text-ink-muted uppercase tracking-wider border-b border-white/[0.05]">
          <div />
          <div>Ник</div>
          <div className="text-center">
            Уровень
          </div>
          <div className="text-center">
            Реинк.
          </div>
          <div>Должность</div>
          <div className="text-right">
            Профиль
          </div>
        </div>

        {/* Rows */}
        {members.map((player) => (
          <div
            key={player.cuid}
            className="flex sm:grid sm:grid-cols-[32px_1fr_70px_70px_1fr_90px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
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
              <span className="font-medium text-ink text-sm">
                {player.nick}
              </span>

              {/* Mobile fallback */}
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

            {/* Level */}
            <div className="hidden sm:flex justify-center">
              <span className="text-accent font-black text-base">
                {player.level}
              </span>
            </div>

            {/* Reincarnation */}
            <div className="hidden sm:flex justify-center">
              <span className="text-ink-dim font-semibold text-sm">
                {player.reincarnationLevel ?? "—"}
              </span>
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
