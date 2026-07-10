import Link from "next/link";

interface Clan {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
  membersCount: number;
}

export default function ClanCard({ clan }: { clan: Clan }) {
  return (
    <Link href={`/clans/${clan.clanId}`}>
      <div className="glass glass-hover rounded-2xl p-5 flex items-center gap-[10px] cursor-pointer group">
        <div className="shrink-0 flex items-center justify-center" style={{ width: 19, height: 19 }}>
          {clan.crestSmall ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clan.crestSmall}
              alt=""
              width={19}
              height={19}
              className="clan-icon"
              style={{ objectFit: "contain", display: "block" }}
            />
          ) : (
            <span style={{ fontSize: 14 }}>{clan.icon ?? "🛡"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink group-hover:text-accent transition-colors truncate text-[15px]">
            {clan.name}
          </h3>
<div className="flex items-center gap-5 mt-1 text-sm text-ink-muted">
  <div className="flex items-center gap-1">
    <span>👫</span>
    <span>{clan.membersCount}</span>
  </div>

  <div className="flex items-center gap-1">
    <span>😊</span>
    <span>{clan.smilesCount ?? 0}</span>
  </div>
</div>
        </div>
      </div>
    </Link>
  );
}
