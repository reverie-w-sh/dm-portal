/**
 * Fetches live profile pages for every real player in data/players.json
 * and updates their fields from the parsed HTML.
 *
* Fields updated: nick, level, clanId, clanName, clanIcon, position, profileUrl
 *
 * clanId IS updated from the live profile (fixed 2026-07-06): players.json
 * and clans.json both use the game's numeric clan ID ("278"), so this is
 * safe. This is what makes players who left the clan disappear from the
 * Members page — without it, a departed member's old clanId would linger
 * forever since scan-ratings.ts skips clanless players entirely.
 *
 *
 * Skipped: players whose cuid is not a plain number (placeholder entries).
 *
 * Usage:
 *   npx tsx scripts/update-players-from-profiles.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseProfileHtml } from "./parse-profile";

const PLAYERS_PATH = path.resolve("data/players.json");
const BASE_URL     = "https://dm-game.com/index.php?file=infouser&cuid=";
const DELAY_MS     = 300;

interface Player {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
  profileUrl?: string;
  position?: string;
  clanName?: string;
  clanIcon?: string;
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(cuid: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${cuid}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DM-Portal-Scanner/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function main(): Promise<void> {
  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));

  const realPlayers  = players.filter((p) => /^\d+$/.test(p.cuid));
  const skippedCount = players.length - realPlayers.length;

  let updatedCount   = 0;
  let posFoundCount  = 0;
  let emptyPosCount  = 0;
  let errorCount     = 0;

  for (let i = 0; i < realPlayers.length; i++) {
    const player = realPlayers[i];
    if (i > 0) await sleep(DELAY_MS);

    process.stdout.write(
      `[${i + 1}/${realPlayers.length}] cuid=${player.cuid} (${player.nick}) … `,
    );

    try {
      const html   = await fetchHtml(player.cuid);
      const parsed = parseProfileHtml(html);

     if (parsed.nick  !== null) player.nick  = parsed.nick;
      if (parsed.level !== null) player.level = parsed.level;
      if (parsed.clanId !== null) player.clanId = parsed.clanId;
      if (parsed.clanName !== null) player.clanName = parsed.clanName;
      if (parsed.clanIcon !== null) player.clanIcon = parsed.clanIcon;
      player.position   = parsed.position;
      player.profileUrl = `${BASE_URL}${player.cuid}`;

      if (parsed.position) posFoundCount++;
      else emptyPosCount++;

      updatedCount++;
      process.stdout.write(
        `OK  lv=${parsed.level}  pos="${parsed.position || "—"}"\n`,
      );
    } catch (err) {
      errorCount++;
      process.stdout.write(`FAIL — ${(err as Error).message}\n`);
    }
  }

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2) + "\n", "utf-8");

  console.log("\n─── Summary ──────────────────────────────────────────────────");
  console.log(`  Total in file:        ${players.length}`);
  console.log(`  Real (numeric cuid):  ${realPlayers.length}`);
  console.log(`  Skipped (no cuid):    ${skippedCount}`);
  console.log(`  Updated:              ${updatedCount}`);
  console.log(`  Positions found:      ${posFoundCount}`);
  console.log(`  Empty positions:      ${emptyPosCount}`);
  console.log(`  Errors:               ${errorCount}`);
  console.log("──────────────────────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
