"use client";

import { useState } from "react";
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

  const filtered = clansData
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
    });

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Поиск клана по названию..."
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#b9bec6] text-xs uppercase tracking-wider whitespace-nowrap">
            Сорт.
          </span>

          {(Object.keys(SORT_LABELS) as SortKey[]).map(
            (key) => (
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
            ),
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((clan) => (
            <ClanCard
              key={clan.clanId}
              clan={clan}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-14 text-center">
          <div className="text-4xl mb-3 opacity-20">
            🛡
          </div>

          <p className="text-ink-muted text-sm">
            Кланов не найдено для &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
