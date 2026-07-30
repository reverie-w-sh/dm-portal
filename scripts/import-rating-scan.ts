/**
 * Import a rating scan file into data/players.json and data/clans.json.
 *
 * Supports known-clan sections and:
 *
 *   ## Без клана — CLANLESS — знайдено N
 *
 * Clanless players are stored with clanId = "" and are therefore available
 * for profile updates and event history without being added to any clan.
 */

import * as fs from "node:fs";
import * as path from "node:path";

const PLAYERS_PATH = path.resolve("data/players.json");
const CLANS_PATH = path.resolve("data/clans.json");
const BASE_URL = "https://dm-game.com/index.php?file=infouser&cuid=";

interface Player {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
  profileUrl: string;
  position: string;
  clanIcon?: string;
  clanName?: string;
  [key: string]: unknown;
}

interface Clan {
  clanId: string;
  name: string;
  membersCount: number;
  members: string[];
  [key: string]: unknown;
}

interface ScanRecord {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
}

function detectFormat(
  lines: string[],
): "csv-header" | "csv-positional" | "grouped" | "markdown" | "unknown" {
  if (
    lines.some((l) =>
      /^##\s*.+—\s*(?:CLAN\s+\d+|CLANLESS)\s*—/i.test(l.trim()),
    )
  ) {
    return "markdown";
  }

  const nonEmpty = lines.filter(
    (l) => l.trim() && !l.startsWith("#") && !l.startsWith("="),
  );
  if (nonEmpty.length === 0) return "unknown";

  const csvLines = nonEmpty.filter((l) => l.includes(",") || l.includes("\t"));

  if (csvLines.length > nonEmpty.length * 0.5) {
    const first = nonEmpty[0].split(/[,\t]/)[0].trim();
    if (/^(cuid|id|uid|nick|name|level|lv|clan)/i.test(first)) {
      return "csv-header";
    }

    const parts = nonEmpty[0].split(/[,\t]/).map((p) => p.trim());
    if (
      parts.length >= 4 &&
      /^\d+$/.test(parts[0]) &&
      /^\d+$/.test(parts[2])
    ) {
      return "csv-positional";
    }

    return "unknown";
  }

  const hasHeader = lines.some((l) => /^[#=]+\s*\d+/.test(l.trim()));
  if (hasHeader) return "grouped";

  return "unknown";
}

function parseMarkdown(lines: string[]): ScanRecord[] {
  const records: ScanRecord[] = [];
  let currentClanId: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();

    const clanMatch = /^##\s*.+?—\s*CLAN\s+(\d+)\s*—/i.exec(line);
    if (clanMatch) {
      currentClanId = clanMatch[1];
      continue;
    }

    if (/^##\s*.+?—\s*CLANLESS\s*—/i.test(line)) {
      currentClanId = "";
      continue;
    }

    if (currentClanId === null) continue;

    const playerMatch =
      /^\d+\.\s+(.+)\[(\d+)\]\s*—\s*cuid=(\d+)\s*—/.exec(line);

    if (playerMatch) {
      const nick = playerMatch[1].trim();
      const level = parseInt(playerMatch[2], 10);
      const cuid = playerMatch[3];

      if (nick && !Number.isNaN(level)) {
        records.push({ cuid, nick, level, clanId: currentClanId });
      }
    }
  }

  return records;
}

function parseCsvHeader(lines: string[]): ScanRecord[] {
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length < 2) return [];

  const delimiter = nonEmpty[0].includes("\t") ? "\t" : ",";
  const header = nonEmpty[0].split(delimiter).map((c) => c.trim().toLowerCase());

  const col = (aliases: string[]): number =>
    header.findIndex((h) => aliases.some((a) => h === a || h.startsWith(a)));

  const cuidCol = col(["cuid", "id", "uid"]);
  const nickCol = col(["nick", "name", "player"]);
  const levelCol = col(["level", "lv", "lvl"]);
  const clanCol = col(["clanid", "clan_id", "clan"]);

  if (nickCol === -1 || levelCol === -1) return [];

  const records: ScanRecord[] = [];
  for (let i = 1; i < nonEmpty.length; i++) {
    const parts = nonEmpty[i].split(delimiter).map((p) => p.trim());
    const nick = nickCol >= 0 ? parts[nickCol] ?? "" : "";
    const level = parseInt(levelCol >= 0 ? parts[levelCol] ?? "" : "", 10);
    const cuid = cuidCol >= 0 ? parts[cuidCol] ?? "" : "";
    const clanId = clanCol >= 0 ? parts[clanCol] ?? "" : "";

    if (!nick || Number.isNaN(level)) continue;
    records.push({ cuid, nick, level, clanId });
  }
  return records;
}

function parseCsvPositional(lines: string[]): ScanRecord[] {
  const records: ScanRecord[] = [];
  const delimiter = lines[0]?.includes("\t") ? "\t" : ",";

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(delimiter).map((p) => p.trim());
    if (parts.length < 4) continue;

    const [cuid, nick, levelRaw, clanId] = parts;
    const level = parseInt(levelRaw, 10);
    if (!nick || Number.isNaN(level)) continue;

    records.push({ cuid, nick, level, clanId });
  }

  return records;
}

function parseGrouped(lines: string[]): ScanRecord[] {
  const records: ScanRecord[] = [];
  let currentClanId = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const clanMatch = /^[#=]+\s*(\d+)/.exec(line);
    if (clanMatch) {
      currentClanId = clanMatch[1];
      continue;
    }

    if (!currentClanId) continue;

    const tokens = line.split(/\s+/);
    if (tokens.length < 3) continue;

    const maybeFirst = tokens[0];
    const maybeLast = tokens[tokens.length - 1];

    if (!/^\d+$/.test(maybeFirst) || !/^\d+$/.test(maybeLast)) continue;

    const cuid = maybeFirst;
    const level = parseInt(maybeLast, 10);
    const nick = tokens.slice(1, -1).join(" ");

    if (!nick || Number.isNaN(level)) continue;
    records.push({ cuid, nick, level, clanId: currentClanId });
  }

  return records;
}

function mergeIntoPlayers(
  existing: Player[],
  records: ScanRecord[],
  clansMap: Map<string, string>,
): { players: Player[]; added: number; updated: number; skipped: number } {
  const byUid = new Map<string, Player>(existing.map((p) => [p.cuid, p]));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const rec of records) {
    if (!rec.cuid) {
      skipped++;
      continue;
    }

    const clanIcon = rec.clanId
      ? `https://dm-game.com/pics/clanpic/clan_${rec.clanId}.gif`
      : undefined;
    const clanName = rec.clanId ? clansMap.get(rec.clanId) : undefined;
    const profileUrl = `${BASE_URL}${rec.cuid}`;

    if (byUid.has(rec.cuid)) {
      const p = byUid.get(rec.cuid)!;
      p.nick = rec.nick;
      p.level = rec.level;
      p.clanId = rec.clanId;
      p.profileUrl = profileUrl;

      if (rec.clanId) {
        if (clanIcon) p.clanIcon = clanIcon;
        if (clanName) p.clanName = clanName;
      } else {
        delete p.clanIcon;
        delete p.clanName;
        p.position = "";
      }

      updated++;
    } else {
      byUid.set(rec.cuid, {
        cuid: rec.cuid,
        nick: rec.nick,
        level: rec.level,
        clanId: rec.clanId,
        profileUrl,
        position: "",
        ...(clanIcon && { clanIcon }),
        ...(clanName && { clanName }),
      });
      added++;
    }
  }

  return { players: Array.from(byUid.values()), added, updated, skipped };
}

function rebuildClanMembers(clans: Clan[], players: Player[]): Clan[] {
  const byClan = new Map<string, string[]>();

  for (const p of players) {
    if (!p.clanId || !p.cuid) continue;
    const arr = byClan.get(p.clanId) ?? [];
    arr.push(p.cuid);
    byClan.set(p.clanId, arr);
  }

  for (const clan of clans) {
    const members = byClan.get(clan.clanId) ?? [];
    clan.members = members;
    clan.membersCount = members.length;
  }

  return clans;
}

async function main(): Promise<void> {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-rating-scan.ts path/to/scan.txt");
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(resolved, "utf-8").split(/\r?\n/);
  const format = detectFormat(lines);
  console.log(`Detected format: ${format}`);

  let records: ScanRecord[];
  if (format === "csv-header") records = parseCsvHeader(lines);
  else if (format === "csv-positional") records = parseCsvPositional(lines);
  else if (format === "grouped") records = parseGrouped(lines);
  else if (format === "markdown") records = parseMarkdown(lines);
  else {
    console.error("Unknown scan format.");
    process.exit(1);
  }

  if (records.length === 0) {
    console.error("No valid player records found in file.");
    process.exit(1);
  }

  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));
  const clans: Clan[] = JSON.parse(fs.readFileSync(CLANS_PATH, "utf-8"));
  const clansMap = new Map(clans.map((c) => [c.clanId, c.name]));
  const knownClanIds = new Set(clans.map((c) => c.clanId));

  const acceptedRecords = records.filter(
    (r) => r.clanId === "" || knownClanIds.has(r.clanId),
  );
  const unknownRecords = records.filter(
    (r) => r.clanId !== "" && !knownClanIds.has(r.clanId),
  );

  if (unknownRecords.length > 0) {
    const unknownIds = [...new Set(unknownRecords.map((r) => r.clanId))]
      .sort()
      .join(", ");
    console.log(
      `Skipping ${unknownRecords.length} player(s) from clans not in our list: ${unknownIds}`,
    );
  }

  const clanlessCount = acceptedRecords.filter((r) => r.clanId === "").length;
  console.log(
    `Importing ${acceptedRecords.length} players (${clanlessCount} clanless).`,
  );

  const { players: merged, added, updated, skipped } = mergeIntoPlayers(
    players,
    acceptedRecords,
    clansMap,
  );

  const updatedClans = rebuildClanMembers(clans, merged);

  fs.writeFileSync(
    PLAYERS_PATH,
    JSON.stringify(merged, null, 2) + "\n",
    "utf-8",
  );
  fs.writeFileSync(
    CLANS_PATH,
    JSON.stringify(updatedClans, null, 2) + "\n",
    "utf-8",
  );

  console.log("\n─── Summary ──────────────────────────────────────────────────");
  console.log(`  Records in scan:            ${records.length}`);
  console.log(`  Clanless accepted:          ${clanlessCount}`);
  console.log(`  Skipped (unknown clan):     ${unknownRecords.length}`);
  console.log(`  Skipped (no cuid):          ${skipped}`);
  console.log(`  Players added (new):        ${added}`);
  console.log(`  Players updated (existing): ${updated}`);
  console.log(`  Total in players.json:      ${merged.length}`);
  console.log("──────────────────────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
