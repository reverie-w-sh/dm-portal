"use client";

import { useState } from "react";
import clansData from "../../../data/clans.json";
import ClanCard from "@/components/ClanCard";
import SearchBar from "@/components/SearchBar";

type SortKey = "members" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  members: "Участники",
  name:    "Имя",
};

export default function ClansPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("members");

  const filtered = clansData
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "members") return b.membersCount - a.membersCount;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-2">
        <div className="mb-2">
  <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
    Кланы ДМ. Состав
  </h1>
  <p className="text-[#b9bec6] text-sm mt-1">
    Всего в мире {clansData.length} кланов
  </p>
</div>
      <div className="divider-accent mb-8" />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Поиск клана по названию..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-muted text-xs uppercase tracking-wider whitespace-nowrap">
            Сорт.
          </span>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={[
                "text-xs px-3 py-2 rounded-lg border transition-colors",
                sortBy === key
                  ? "border-accent/40 text-accent bg-accent/10"
                  : "border-white/8 text-ink-muted hover:text-ink hover:border-white/15",
              ].join(" ")}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((clan) => (
            <ClanCard key={clan.clanId} clan={clan} />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-14 text-center">
          <div className="text-4xl mb-3 opacity-20">🛡</div>
          <p className="text-ink-muted text-sm">
            Кланов не найдено для &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
