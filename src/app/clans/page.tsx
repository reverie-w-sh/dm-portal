"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clansJson from "../../../data/clans.json";
import lastSync from "../../../data/last-sync.json";
import ClanCard from "@/components/ClanCard";
import SearchBar from "@/components/SearchBar";
import EventsFeed from "@/components/EventsFeed";

type Clan = {
  clanId: string;
  name: string;
  icon?: string;
  crestSmall?: string;
  membersCount: number;
  smilesCount?: number;
  allianceId?: string;
  allianceName?: string;
};

type SortKey =
  | "members"
  | "smiles"
  | "alliance"
  | "name";

const clansData = clansJson as Clan[];

const SORT_LABELS: Record<SortKey, string> = {
  members: "Участники",
  smiles: "♥ Смайлики ♥",
  alliance: "Альянс",
  name: "Название",
};

function formatLastSync(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClansPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortKey>("members");

  const [comparisonMode, setComparisonMode] =
    useState(false);

  const [selectedClanIds, setSelectedClanIds] =
    useState<string[]>([]);

  const filtered = useMemo(
    () =>
      [...clansData]
        .filter((clan) =>
          clan.name
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        )
        .sort((a, b) => {
          switch (sortBy) {
            case "members":
              return b.membersCount - a.membersCount;

            case "smiles":
              return (
                (b.smilesCount ?? 0) -
                (a.smilesCount ?? 0)
              );

            case "alliance": {
              const aAlliance =
                a.allianceName?.trim() ?? "";

              const bAlliance =
                b.allianceName?.trim() ?? "";

              if (aAlliance && !bAlliance) {
                return -1;
              }

              if (!aAlliance && bAlliance) {
                return 1;
              }

              const allianceDifference =
                aAlliance.localeCompare(
                  bAlliance,
                  "ru",
                  { sensitivity: "base" },
                );

              if (allianceDifference !== 0) {
                return allianceDifference;
              }

              return a.name.localeCompare(
                b.name,
                "ru",
                { sensitivity: "base" },
              );
            }

            case "name":
            default:
              return a.name.localeCompare(
                b.name,
                "ru",
                { sensitivity: "base" },
              );
          }
        }),
    [search, sortBy],
  );

  const selectedClans = selectedClanIds
    .map((clanId) =>
      clansData.find(
        (clan) => clan.clanId === clanId,
      ),
    )
    .filter(
      (clan): clan is Clan => Boolean(clan),
    );

  function toggleComparisonMode() {
    setComparisonMode((current) => {
      if (current) {
        setSelectedClanIds([]);
      }

      return !current;
    });
  }

  function toggleClanForComparison(
    clanId: string,
  ) {
    setSelectedClanIds((current) => {
      if (current.includes(clanId)) {
        return current.filter(
          (selectedId) =>
            selectedId !== clanId,
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, clanId];
    });
  }

  const compareHref =
    selectedClanIds.length >= 2
      ? `/clans/compare?ids=${selectedClanIds.join(
          ",",
        )}`
      : "#";

  const comparisonButtonClass = [
    "flex-1 sm:flex-none",
    "inline-flex items-center justify-center",
    "whitespace-nowrap",
    "px-4 py-2.5 rounded-xl border",
    "text-sm font-bold transition-all",
  ].join(" ");

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10 pb-32">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
          Все кланы ДМ. Составы. Альянсы. Смайлики
        </h1>

        <p className="text-[#b9bec6] text-sm mt-1">
          Всего в мире {clansData.length} кланов
        </p>

        <p className="text-[#b9bec6]/70 text-xs mt-1">
          Обновление данных:{" "}
          {formatLastSync(lastSync.updatedAt)}
        </p>

        <EventsFeed
          scope="clans"
          variant="dark"
        />
      </div>

      <div className="divider-accent mb-8 mt-7" />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Поиск клана по названию..."
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleComparisonMode}
              className={[
                comparisonButtonClass,
                comparisonMode
                  ? "border-accent/45 text-accent bg-accent/10"
                  : "border-white/10 text-[#d9dde3] bg-white/[0.04] hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {comparisonMode
                ? "Закрыть сравнение"
                : "Сравнить кланы"}
            </button>

            <Link
              href="/alliances"
              className={[
                comparisonButtonClass,
                "border-white/10 text-[#d9dde3] bg-white/[0.04] hover:bg-white/[0.08]",
              ].join(" ")}
            >
              Сравнить альянсы
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#b9bec6] text-xs uppercase tracking-wider whitespace-nowrap">
            Сорт.
          </span>

          {(Object.keys(
            SORT_LABELS,
          ) as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={[
                "text-xs px-3 py-2 rounded-lg border transition-colors",
                sortBy === key
                  ? "border-accent/40 text-accent bg-accent/10"
                  : "border-white/10 text-[#b9bec6] hover:text-[#e6e6e6] hover:border-white/20",
              ].join(" ")}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>

        {comparisonMode && (
          <p className="text-xs text-[#b9bec6]/75">
            Выберите от двух до трёх кланов.
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((clan) => (
            <ClanCard
              key={clan.clanId}
              clan={clan}
              comparisonMode={comparisonMode}
              selectedForComparison={selectedClanIds.includes(
                clan.clanId,
              )}
              comparisonDisabled={
                selectedClanIds.length >= 3 &&
                !selectedClanIds.includes(
                  clan.clanId,
                )
              }
              onToggleComparison={
                toggleClanForComparison
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-14 text-center">
          <div className="text-4xl mb-3 opacity-20">
            🛡
          </div>

          <p className="text-ink-muted text-sm">
            Кланов не найдено для &ldquo;
            {search}&rdquo;
          </p>
        </div>
      )}

      {comparisonMode &&
        selectedClans.length > 0 && (
          <div className="fixed left-1/2 bottom-5 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[900px]">
            <div className="glass rounded-2xl border border-white/15 shadow-[0_18px_55px_rgba(0,0,0,.28)] px-5 py-4 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1">
                    Выбрано:{" "}
                    {selectedClans.length} из 3
                  </div>

                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm font-semibold text-ink">
                    {selectedClans.map(
                      (clan, index) => (
                        <span key={clan.clanId}>
                          {index > 0 && (
                            <span className="text-ink-muted mr-2">
                              •
                            </span>
                          )}

                          {clan.name}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedClanIds([])
                    }
                    className="px-4 py-2.5 rounded-xl border border-black/10 bg-white/35 text-sm font-bold text-ink-muted hover:text-ink hover:bg-white/60 transition-all"
                  >
                    Очистить
                  </button>

                  {selectedClanIds.length >= 2 ? (
                    <Link
                      href={compareHref}
                      className="px-5 py-2.5 rounded-xl border border-accent/50 bg-accent/15 text-accent text-sm font-black hover:bg-accent/20 transition-all"
                    >
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
