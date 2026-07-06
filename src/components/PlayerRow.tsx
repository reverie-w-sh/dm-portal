interface Player {
  cuid: string;
  nick: string;
  level: number;
  profileUrl?: string;
  clanId?: string;
}

export default function PlayerRow({
  player,
  showClan = false,
  clanName = "",
}: {
  player: Player;
  showClan?: boolean;
  clanName?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] px-3 -mx-3 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <span className="font-medium text-ink text-sm truncate block">
          {player.nick}
        </span>
        {showClan && clanName && (
          <span className="text-ink-muted text-xs">{clanName}</span>
        )}
      </div>
      <span className="text-accent font-semibold text-sm shrink-0">
        Ур. {player.level}
      </span>
    </div>
  );

  if (player.profileUrl) {
    return (
      <a href={player.profileUrl} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return inner;
}
