"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clansJson from "../../../data/clans.json";

type Clan = {
  clanId: string;
  name: string;
  crestSmall?: string;
  allianceId?: string;
  allianceName?: string;
};

type Alliance = {
  allianceId: string;
  allianceName: string;
  clans: Clan[];
};

const clansData = clansJson as Clan[];

function buildAlliances(): Alliance[] {
  const byId = new Map<string, Alliance>();

  for (const clan of clansData) {
    if (!clan.allianceId || !clan.allianceName) continue;

    const existing = byId.get(clan.allianceId);

    if (existing) {
      existing.clans.push(clan);
    } else {
      byId.set(clan.allianceId, {
        allianceId: clan.allianceId,
        allianceName: clan.allianceName,
        clans: [clan],
      });
    }
  }

  return Array.from(byId.values())
    .map((alliance) => ({
      ...alliance,
      clans: [...alliance.clans].sort((a, b) =>
        a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
      ),
    }))
    .sort((a, b) =>
      a.allianceName.localeCompare(b.allianceName, "ru", {
        sensitivity: "base",
      }),
    );
}

export default function AlliancesPage() {
  const alliances = useMemo(() => buildAlliances(), []);
  const [selectedAllianceIds, setSelectedAllianceIds] = useState<string[]>([]);

  function toggleAlliance(allianceId: string) {
    setSelectedAllianceIds((current) => {
      if (current.includes(allianceId)) {
        return current.filter((selectedId) => selectedId !== allianceId);
      }

      if (current.length >= 3) return current;
      return [...current, allianceId];
    });
  }

  const selectedAlliances = selectedAllianceIds
    .map((allianceId) =>
      alliances.find((alliance) => alliance.allianceId === allianceId),
    )
    .filter((alliance): alliance is Alliance => Boolean(alliance));

  const compareHref =
    selectedAllianceIds.length >= 2
      ? `/alliances/compare?ids=${selectedAllianceIds.join(",")}`
      : "#";

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10 pb-32">
      <Link
        href="/clans"
        className="inline-flex items-center gap-1.5 text-ink-muted text-xs font-medium hover:text-accent transition-colors mb-8"
      >
        ← К списку кланов
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Сравнение альянсов
        </h1>
        <p className="text-ink-muted text-sm mt-2">
          Выбери для сравнения два-три альянса
        </p>
      </div>

      <div className="space-y-3">
        {alliances.map((alliance) => {
          const selected = selectedAllianceIds.includes(alliance.allianceId);
          const disabled = selectedAllianceIds.length >= 3 && !selected;
          const smallIconUrl = `https://dm-game.com/pics/alc/ali_${alliance.allianceId}.gif`;

          return (
            <button
              key={alliance.allianceId}
              type="button"
              onClick={() => toggleAlliance(alliance.allianceId)}
              disabled={disabled}
              className={[
                "w-full glass glass-hover rounded-2xl p-5 flex items-center gap-4 text-left transition-all",
                selected ? "ring-2 ring-accent/45 bg-accent/[0.06]" : "",
                disabled ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "w-6 h-6 shrink-0 rounded-lg border flex items-center justify-center",
                  selected
                    ? "border-accent/60 bg-accent/15 text-accent"
                    : "border-black/10 bg-white/35 text-ink-muted",
                ].join(" ")}
              >
                {selected ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full border border-current" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-black text-ink">{alliance.allianceName}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {alliance.clans.map((clan) => (
                    <span key={clan.clanId} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      {clan.crestSmall && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={clan.crestSmall} alt="" width={17} height={17} className="w-[17px] h-[17px] object-contain" />
                      )}
                      <span>{clan.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={smallIconUrl} alt="" width={28} height={28} className="w-7 h-7 object-contain shrink-0" />
            </button>
          );
        })}
      </div>

      {selectedAlliances.length > 0 && (
        <div className="fixed left-1/2 bottom-5 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[900px]">
          <div className="glass rounded-2xl border border-white/15 shadow-[0_18px_55px_rgba(0,0,0,.28)] px-5 py-4 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
                  Выбрано: {selectedAlliances.length} из 3
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm font-semibold text-ink">
                  {selectedAlliances.map((alliance, index) => (
                    <span key={alliance.allianceId}>
                      {index > 0 && <span className="text-ink-muted mr-2">•</span>}
                      {alliance.allianceName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedAllianceIds([])}
                  className="px-4 py-2.5 rounded-xl border border-black/10 bg-white/35 text-sm font-bold text-ink-muted hover:text-ink hover:bg-white/60 transition-all"
                >
                  Очистить
                </button>

                {selectedAllianceIds.length >= 2 ? (
                  <Link href={compareHref} className="px-5 py-2.5 rounded-xl border border-accent/50 bg-accent/15 text-accent text-sm font-black hover:bg-accent/20 transition-all">
                    Сравнить
                  </Link>
                ) : (
                  <span className="px-5 py-2.5 rounded-xl border border-black/10 bg-white/20 text-ink-muted/50 text-sm font-black cursor-not-allowed">
                    Сравнить
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
