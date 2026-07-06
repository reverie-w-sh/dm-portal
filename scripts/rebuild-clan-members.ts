/**
 * Rebuilds each clan's `members` array and `membersCount` in data/clans.json
 * strictly from the current `clanId` field of each player in data/players.json.
 *
 * Must run AFTER update-players-from-profiles.ts, because that script is the
 * one that corrects a player's clanId when they leave/switch clans (import-
 * rating-scan.ts already rebuilds members too, but it runs BEFORE the
 * per-profile clanId correction, so its result goes stale the moment step 3
 * fixes someone's clanId).
 *
 * Usage:
 *   npx tsx scripts/rebuild-clan-members.ts
 */

import * as fs from "node:fs";
import path from "node:path";

const PLAYERS_PATH = path.resolve("data/players.json");
const CLANS_PATH   = path.resolve("data/clans.json");

interface Player {
  cuid: string;
  clanId: string;
  [key: string]: unknown;
}

interface Clan {
  clanId: string;
  members: string[];
  membersCount: number;
  [key: string]: unknown;
}

function main(): void {
  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));
  const clans:   Clan[]   = JSON.parse(fs.readFileSync(CLANS_PATH,   "utf-8"));

  const byClan = new Map<string, string[]>();
  for (const p of players) {
    if (!p.clanId || !p.cuid) continue;
    const arr = byClan.get(p.clanId) ?? [];
    arr.push(p.cuid);
    byClan.set(p.clanId, arr);
  }

  let changed = 0;
  for (const clan of clans) {
    const members = byClan.get(clan.clanId) ?? [];
    const before = JSON.stringify(clan.members);
    const after  = JSON.stringify(members);
    if (before !== after) changed++;
    clan.members      = members;
    clan.membersCount = members.length;
  }

  fs.writeFileSync(CLANS_PATH, JSON.stringify(clans, null, 2) + "\n", "utf-8");
  console.log(`Rebuilt clan members. Clans with changed rosters: ${changed} / ${clans.length}`);
}

main();
