"use client";

import { useMemo, useState } from "react";
import personalSmilesData from "@/data/personal-smiles.json";

type PlayerWithSmiles = {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
  clanName: string;
  clanIcon: string;
  profileUrl: string;
  smilesPageUrl: string;
  personalSmilesCount: number;
  personalSmiles: string[];
};

function getPlaceIcon(place: number) {
  if (place === 1) return "🥇";
  if (place === 2) return "🥈";
  if (place === 3) return "🥉";

  return place;
}

export default function PersonalSmilesPage() {
  const [openedPlayerId, setOpenedPlayerId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const players = useMemo(() => {
    return [...(personalSmilesData as PlayerWithSmiles[])].sort((a, b) => {
      const smilesDifference =
        b.personalSmilesCount - a.personalSmilesCount;

      if (smilesDifference !== 0) {
        return smilesDifference;
      }

      return a.nick.localeCompare(b.nick, "ru");
    });
  }, []);

  const visiblePlayers = showAll ? players : players.slice(0, 10);
  const record = players[0]?.personalSmilesCount ?? 0;

  function togglePlayer(cuid: string) {
    setOpenedPlayerId((current) =>
      current === cuid ? null : cuid
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-ink tracking-tight mb-2">
          Рейтинг личных смайликов
        </h1>

        <div className="divider-accent mb-4" />

        <p className="text-ink-muted text-sm">
          Игроки с самыми большими коллекциями личных смайликов.
        </p>
      </div>

      {players.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-ink-muted">
          Пока личные смайлики не найдены.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {visiblePlayers.map((player, index) => {
              const place = index + 1;
              const isOpened = openedPlayerId === player.cuid;

              const clanCrestUrl = player.clanId
                ? `https://dm-game.com/pics/clanpic/clan_${player.clanId}.gif`
                : "";

              return (
                <div
                  key={player.cuid}
                  className="glass rounded-2xl overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 shrink-0 text-center text-2xl font-black text-ink">
                          {getPlaceIcon(place)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <a
                            href={player.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-xl font-black text-ink hover:opacity-70 transition-opacity break-words"
                          >
                            {player.nick}
                          </a>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-ink-muted">
                            <span>{player.level} уровень</span>

                            {player.clanName && (
                              <span className="flex items-center gap-2">
                                {clanCrestUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={clanCrestUrl}
                                    alt=""
                                    width={19}
                                    height={19}
                                    className="object-contain"
                                  />
                                )}

                                <span>{player.clanName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black text-ink">
                            😄 {player.personalSmilesCount}
                          </div>

                          {record > 0 && (
                            <div className="text-xs text-ink-muted mt-1">
                              из {record}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePlayer(player.cuid)}
                          className="px-4 py-2.5 rounded-xl bg-white/60 border border-black/10 text-sm font-bold text-ink transition-all hover:bg-white/80 hover:scale-[1.02]"
                        >
                          {isOpened
                            ? "Скрыть смайлики ▲"
                            : "Показать смайлики ▼"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isOpened && (
                    <div className="border-t border-black/10 bg-white/20 p-5 md:p-6">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {player.personalSmiles.map((smileUrl, smileIndex) => (
                          <a
                            key={`${player.cuid}-${smileIndex}`}
                            href={smileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center min-w-[70px] min-h-[70px] p-2 rounded-xl bg-white/60 border border-black/10 transition-transform hover:scale-110"
                            title={`Смайлик ${smileIndex + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={smileUrl}
                              alt={`Смайлик ${player.nick} ${
                                smileIndex + 1
                              }`}
                              className="max-w-[90px] max-h-[90px] object-contain"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>

                      <div className="mt-5 text-center">
                        <a
                          href={player.smilesPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-ink hover:opacity-60 transition-opacity"
                        >
                          Открыть страницу смайликов в игре ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {players.length > 10 && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => {
                  setShowAll((current) => !current);
                  setOpenedPlayerId(null);
                }}
                className="glass glass-hover rounded-xl px-6 py-3 font-bold text-ink transition-all hover:scale-[1.03]"
              >
                {showAll
                  ? "Показать только ТОП-10"
                  : `Показать всех (${players.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
