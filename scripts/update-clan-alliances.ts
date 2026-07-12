/**
 * Copies alliance data from players.json into clans.json.
 *
 * The script does not fetch anything and does not change clan members.
 * For every clan it chooses the most common alliance value among its members.
 *
 * Usage:
 *   npx tsx scripts/update-clan-alliances.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

const PLAYERS_PATH = path.resolve("data/players.json");
const CLANS_PATH = path.resolve("data/clans.json");

interface Player {
  cuid: string;
  clanId?: string;
  allianceId?: string;
  allianceName?: string;
  [key: string]: unknown;
}

interface Clan {
  clanId: string;
  allianceId?: string;
  allianceName?: string;
  [key: string]: unknown;
}

type AllianceValue = {
  allianceId: string;
  allianceName: string;
};

function main(): void {
  const players: Player[] = JSON.parse(
    fs.readFileSync(PLAYERS_PATH, "utf-8"),
  );

  const clans: Clan[] = JSON.parse(
    fs.readFileSync(CLANS_PATH, "utf-8"),
  );

  const valuesByClan = new Map<string, AllianceValue[]>();

  for (const player of players) {
    if (!player.clanId) {
      continue;
    }

    /*
     * undefined means an old/unverified player record.
     * An empty string is a verified "no alliance" value and must be counted.
     */
    if (
      typeof player.allianceId !== "string" ||
      typeof player.allianceName !== "string"
    ) {
      continue;
    }

    const values = valuesByClan.get(player.clanId) ?? [];

    values.push({
      allianceId: player.allianceId,
      allianceName: player.allianceName,
    });

    valuesByClan.set(player.clanId, values);
  }

  let changed = 0;

  for (const clan of clans) {
    const values = valuesByClan.get(clan.clanId);

    /*
     * No verified member profile: preserve the previous clan value.
     */
    if (!values || values.length === 0) {
      continue;
    }

    const counts = new Map<
      string,
      { count: number; value: AllianceValue }
    >();

    for (const value of values) {
      const key = `${value.allianceId}\u0000${value.allianceName}`;
      const current = counts.get(key);

      if (current) {
        current.count++;
      } else {
        counts.set(key, {
          count: 1,
          value,
        });
      }
    }

    const winner = Array.from(counts.values()).sort(
      (a, b) => b.count - a.count,
    )[0]?.value;

    if (!winner) {
      continue;
    }

    const oldAllianceId = clan.allianceId ?? "";
    const oldAllianceName = clan.allianceName ?? "";

    if (
      oldAllianceId !== winner.allianceId ||
      oldAllianceName !== winner.allianceName
    ) {
      changed++;
    }

    clan.allianceId = winner.allianceId;
    clan.allianceName = winner.allianceName;
  }

  fs.writeFileSync(
    CLANS_PATH,
    `${JSON.stringify(clans, null, 2)}\n`,
    "utf-8",
  );

  console.log(
    `Updated clan alliances. Changed clans: ${changed} / ${clans.length}`,
  );
}

main();
