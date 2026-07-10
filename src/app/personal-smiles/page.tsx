"use client";

import { useMemo, useState } from "react";
import personalSmilesData from "../../../data/personal-smiles.json";

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

type SortType = "count" | "nick";

export default function PersonalSmilesPage() {
  const [sortType, setSortType] = useState<SortType>("count");
  const [openedPlayers, setOpenedPlayers] = useState<Set<string>>(
    new Set()
  );

  const players = useMemo(() => {
    const result = [
      ...(personalSmilesData as PlayerWithSmiles[]),
    ];

    if (sortType === "nick") {
      return result.sort((a, b) =>
        a.nick.localeCompare(b.nick, "uk", {
          sensitivity: "base",
        })
      );
    }

    return result.sort((a, b) => {
      const countDifference =
        b.personalSmilesCount - a.personalSmilesCount;

      if (countDifference !== 0) {
        return countDifference;
      }

      return a.nick.localeCompare(b.nick, "uk", {
        sensitivity: "base",
      });
    });
  }, [sortType]);

  function togglePlayer(cuid: string) {
    setOpenedPlayers((current) => {
      const next = new Set(current);

      if (next.has(cuid)) {
        next.delete(cuid);
      } else {
        next.add(cuid);
      }

      return next;
    });
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/70 border border-black/10 flex items-center justify-center text-3xl shadow-sm">
            🙂
          </div>

          <div>
            <h1 className="text-3xl font-black text-ink tracking-tight">
              Особисті колекції смайликів
            </h1>

            <p className="text-ink-muted mt-2 max-w-2xl">
              Тут зібрані особисті смайлики гравців ДМ.
              Колекцію кожного гравця можна розгорнути та
              переглянути прямо на сторінці.
            </p>
          </div>
        </div>

        <div className="divider-accent mt-7" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-sm text-ink-muted">
          Знайдено колекцій:{" "}
          <span className="font-bold text-ink">
            {players.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-muted">
            Сортувати:
          </span>

          <div className="flex rounded-xl bg-white/40 border border-black/10 p-1">
            <button
              type="button"
              onClick={() => setSortType("count")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                sortType === "count"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              За кількістю
            </button>

            <button
              type="button"
              onClick={() => setSortType("nick")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                sortType === "nick"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              За ніком
            </button>
          </div>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">🙂</div>

          <p className="font-bold text-ink">
            Особисті смайлики поки не знайдені
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {players.map((player) => {
            const isOpened = openedPlayers.has(player.cuid);

            const clanCrestUrl = player.clanId
              ? `https://dm-game.com/pics/clanpic/clan_${player.clanId}.gif`
              : "";

            return (
              <article
                key={player.cuid}
                className="glass rounded-2xl overflow-hidden border border-white/30 transition-shadow hover:shadow-[0_12px_35px_rgba(0,0,0,.08)]"
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/60 border border-black/10 flex items-center justify-center text-xl font-black text-ink">
                        {player.nick
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <a
                          href={player.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xl font-black text-ink hover:opacity-65 transition-opacity break-words"
                        >
                          {player.nick}
                          <span className="text-xs font-normal">
                            ↗
                          </span>
                        </a>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-ink-muted">
                          <span>{player.level} рівень</span>

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
                      <div className="shrink-0">
                        <div className="text-xs uppercase tracking-[0.15em] text-ink-muted mb-1">
                          У колекції
                        </div>

                        <div className="text-xl font-black text-ink">
                          {player.personalSmilesCount}{" "}
                          <span className="text-sm font-bold text-ink-muted">
                            смайликів
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          togglePlayer(player.cuid)
                        }
                        aria-expanded={isOpened}
                        className="min-w-[175px] px-4 py-3 rounded-xl bg-white/65 border border-black/10 text-sm font-bold text-ink shadow-sm transition-all hover:bg-white hover:-translate-y-0.5"
                      >
                        {isOpened
                          ? "Сховати смайлики ↑"
                          : "Переглянути смайлики ↓"}
                      </button>
                    </div>
                  </div>
                </div>

                {isOpened && (
                  <div className="border-t border-black/10 bg-white/20 px-5 py-6 md:px-6">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {player.personalSmiles.map(
                        (smileUrl, smileIndex) => (
                          <a
                            key={`${player.cuid}-${smileUrl}`}
                            href={smileUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={`Смайлик ${
                              smileIndex + 1
                            }`}
                            className="flex items-center justify-center min-w-[72px] min-h-[72px] p-2 rounded-xl bg-white/65 border border-black/10 shadow-sm transition-all hover:bg-white hover:scale-105"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={smileUrl}
                              alt={`Смайлик ${player.nick} ${
                                smileIndex + 1
                              }`}
                              loading="lazy"
                              className="max-w-[100px] max-h-[100px] object-contain"
                            />
                          </a>
                        )
                      )}
                    </div>

                    <div className="mt-6 text-center">
                      <a
                        href={player.smilesPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted hover:text-ink transition-colors"
                      >
                        Відкрити колекцію на сайті гри
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
