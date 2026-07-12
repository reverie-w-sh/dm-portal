/**
 * Fetches live profile pages for every real player in data/players.json
 * and updates their fields from the parsed HTML.
 *
 * Fields updated:
 * nick, level, reincarnationLevel, clanId, clanName, clanIcon,
 * allianceId, allianceName, position, profileUrl
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseProfileHtml } from "./parse-profile";

const PLAYERS_PATH = path.resolve("data/players.json");
const BASE_URL = "https://dm-game.com/index.php?file=infouser&cuid=";
const DELAY_MS = 300;

interface Player {
  cuid: string;
  nick: string;
  level: number;
  reincarnationLevel?: number | null;
  clanId: string;
  profileUrl?: string;
  position?: string;
  clanName?: string;
  clanIcon?: string;
  allianceId?: string;
  allianceName?: string;
  [key: string]: unknown;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(cuid: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${cuid}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DM-Portal-Scanner/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function main(): Promise<void> {
  const players: Player[] = JSON.parse(
    fs.readFileSync(PLAYERS_PATH, "utf-8"),
  );

  const realPlayers = players.filter((player) =>
    /^\d+$/.test(player.cuid),
  );

  const skippedCount = players.length - realPlayers.length;

  let updatedCount = 0;
  let posFoundCount = 0;
  let emptyPosCount = 0;
  let alliancesFoundCount = 0;
  let errorCount = 0;

  for (let index = 0; index < realPlayers.length; index++) {
    const player = realPlayers[index];

    if (index > 0) {
      await sleep(DELAY_MS);
    }

    process.stdout.write(
      `[${index + 1}/${realPlayers.length}] ` +
        `cuid=${player.cuid} (${player.nick}) … `,
    );

    try {
      const html = await fetchHtml(player.cuid);
      const parsed = parseProfileHtml(html);

      if (parsed.nick !== null) {
        player.nick = parsed.nick;
      }

      if (parsed.level !== null) {
        player.level = parsed.level;
      }

      player.reincarnationLevel =
        parsed.reincarnationLevel;

      if (parsed.clanId !== null) {
        player.clanId = parsed.clanId;
      }

      if (parsed.clanName !== null) {
        player.clanName = parsed.clanName;
      }

      if (parsed.clanIcon !== null) {
        player.clanIcon = parsed.clanIcon;
      }

      if (parsed.allianceId !== null) {
        player.allianceId = parsed.allianceId;
      }

      if (parsed.allianceName !== null) {
        player.allianceName = parsed.allianceName;
      }

      player.position = parsed.position;
      player.profileUrl = `${BASE_URL}${player.cuid}`;

      if (parsed.position) {
        posFoundCount++;
      } else {
        emptyPosCount++;
      }

      if (parsed.allianceId) {
        alliancesFoundCount++;
      }

      updatedCount++;

      process.stdout.write(
        `OK  lv=${parsed.level ?? "?"}  ` +
          `reinc=${parsed.reincarnationLevel ?? "—"}  ` +
          `alliance="${parsed.allianceName || "—"}"  ` +
          `pos="${parsed.position || "—"}"\n`,
      );
    } catch (error) {
      errorCount++;

      process.stdout.write(
        `FAIL — ${
          error instanceof Error
            ? error.message
            : "Неизвестная ошибка"
        }\n`,
      );
    }
  }

  fs.writeFileSync(
    PLAYERS_PATH,
    `${JSON.stringify(players, null, 2)}\n`,
    "utf-8",
  );

  console.log("\n─── Summary ──────────────────────────────────────────────────");
  console.log(`  Total in file:        ${players.length}`);
  console.log(`  Real (numeric cuid):  ${realPlayers.length}`);
  console.log(`  Skipped (no cuid):    ${skippedCount}`);
  console.log(`  Updated:              ${updatedCount}`);
  console.log(`  Positions found:      ${posFoundCount}`);
  console.log(`  Empty positions:      ${emptyPosCount}`);
  console.log(`  Alliance profiles:    ${alliancesFoundCount}`);
  console.log(`  Errors:               ${errorCount}`);
  console.log("──────────────────────────────────────────────────────────────");
}

main().catch((error) => {
  console.error(
    "Fatal:",
    error instanceof Error ? error.message : error,
  );

  process.exit(1);
});
