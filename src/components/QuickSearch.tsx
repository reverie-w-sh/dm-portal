"use client";

import { useState } from "react";
import playersData from "../../data/players.json";
import clansData from "../../data/clans.json";

export default function QuickSearch() {
  const [query, setQuery] = useState("");

  const results = query.trim().length > 1
    ? playersData
        .filter((p) => p.nick.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];

  const getClanName = (clanId: string) =>
    clansData.find((c) => c.clanId === clanId)?.name ?? "—";

  return (
    <div className="max-w-lg">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите ник персонажа..."
          className="w-full glass rounded-xl px-4 py-3 pl-11 text-sm text-ink placeholder-ink-muted focus:outline-none transition-colors"
        />
      </div>

      {results.length > 0 && (
        <div className="glass rounded-xl mt-2 overflow-hidden">
          {results.map((player) => {
            const row = (
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.04] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink text-sm truncate">{player.nick}</div>
                  <div className="text-ink-muted text-xs">{getClanName(player.clanId)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-accent text-xs font-semibold">Ур. {player.level}</div>
                </div>
                {player.profileUrl && (
                  <span className="text-ink-muted text-xs">↗</span>
                )}
              </div>
            );

            return player.profileUrl ? (
              <a
                key={player.cuid}
                href={player.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {row}
              </a>
            ) : (
              <div key={player.cuid}>{row}</div>
            );
          })}
        </div>
      )}

      {query.trim().length > 1 && results.length === 0 && (
        <p className="text-ink-muted text-sm mt-3 px-1">Персонажей не найдено</p>
      )}
    </div>
  );
}
