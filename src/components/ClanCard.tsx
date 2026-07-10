import Link from "next/link";

interface Clan {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
  membersCount: number;
  smilesCount?: number;
}

export default function ClanCard({ clan }: { clan: Clan }) {
  return (
    <Link href={`/clans/${clan.clanId}`}>
      <div className="glass glass-hover rounded-2xl p-5 flex items-center gap-[10px] cursor-pointer group">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: 19, height: 19 }}
        >
          {clan.crestSmall ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clan.crestSmall}
              alt=""
              width={19}
              height={19}
              className="clan-icon"
              style={{
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <span style={{ fontSize: 14 }}>
              {clan.icon ?? "🛡"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink group-hover:text-accent transition-colors truncate text-[15px]">
            {clan.name}
          </h3>

          <div className="flex items-center gap-4 mt-1 text-xs text-ink-muted">
            {/* Участники */}
            <span
              className="inline-flex items-center gap-1.5"
              title={`${clan.membersCount} участников`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-ink-dim"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>

              <span>{clan.membersCount}</span>
            </span>

            {/* Смайлики */}
            <span
              className="inline-flex items-center gap-1.5"
              title={`${clan.smilesCount ?? 0} клановых смайликов`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-accent"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2" />
                <path d="M9 9h.01" />
                <path d="M15 9h.01" />
              </svg>

              <span>{clan.smilesCount ?? 0}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
