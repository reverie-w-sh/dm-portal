/**
 * Test script for the dm-game.com profile parser.
 *
 * Usage:
 *   # Parse a saved HTML file:
 *   npx tsx scripts/test-parse-profile.ts --file scripts/sample-2171.html
 *
 *   # Fetch and parse one or more live profiles:
 *   npx tsx scripts/test-parse-profile.ts 2171
 *   npx tsx scripts/test-parse-profile.ts 2171 7939 1980
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseProfileHtml, type ParsedProfile } from "./parse-profile";

const BASE_URL = "https://dm-game.com/index.php?file=infouser&cuid=";
const DELAY_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(cuid: string): Promise<string> {
  const url = `${BASE_URL}${cuid}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DM-Portal-Scanner/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

function printResult(r: ParsedProfile, index: number, total: number): void {
  const prefix = total > 1 ? `[${index + 1}/${total}] ` : "";
  console.log(`\n${prefix}─── cuid: ${r.cuid ?? "?"} ───`);
  console.log(`  nick:      ${r.nick      ?? "(not found)"}`);
  console.log(`  level:     ${r.level     ?? "(not found)"}`);
  console.log(`  clanId:    ${r.clanId    ?? "(none)"}`);
  console.log(`  clanName:  ${r.clanName  ?? "(none)"}`);
  console.log(`  clanIcon:  ${r.clanIcon  ?? "(none)"}`);
  console.log(`  position:  ${r.position  || "(none)"}`);
}

const EMPTY: ParsedProfile = {
  cuid: null,
  nick: null,
  level: null,
  reincarnationLevel: null,
  clanId: null,
  clanName: null,
  clanIcon: null,
  position: "",
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error([
      "Usage:",
      "  npx tsx scripts/test-parse-profile.ts --file scripts/sample-2171.html",
      "  npx tsx scripts/test-parse-profile.ts 2171",
      "  npx tsx scripts/test-parse-profile.ts 7939 111 4441",
    ].join("\n"));
    process.exit(1);
  }

  // ── Mode: --file path ───────────────────────────────────────────────────
  const fileFlag = args.indexOf("--file");
  if (fileFlag !== -1) {
    const filePath = args[fileFlag + 1];
    if (!filePath) {
      console.error("Error: --file requires a path argument.");
      process.exit(1);
    }
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: file not found — ${resolved}`);
      process.exit(1);
    }
    console.log(`Parsing: ${resolved}\n`);
    const html = fs.readFileSync(resolved, "utf-8");
    const result = parseProfileHtml(html);
    printResult(result, 0, 1);
    console.log("\n--- Raw JSON ---");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // ── Mode: live fetch by cuid(s) ─────────────────────────────────────────
  const cuids = args.filter((a) => /^\d+$/.test(a));
  if (cuids.length === 0) {
    console.error("Error: no numeric cuid arguments found.");
    process.exit(1);
  }

  console.log(`Fetching ${cuids.length} profile(s) from dm-game.com…`);
  const results: ParsedProfile[] = [];

  for (let i = 0; i < cuids.length; i++) {
    const cuid = cuids[i];
    try {
      if (i > 0) await sleep(DELAY_MS);
      process.stdout.write(`  [${i + 1}/${cuids.length}] cuid=${cuid} … `);
      const html = await fetchHtml(cuid);
      const result = parseProfileHtml(html);
      results.push(result);
      process.stdout.write(`OK (${result.nick ?? "??"}, lv${result.level ?? "?"})\n`);
    } catch (err) {
      process.stdout.write(`FAIL — ${(err as Error).message}\n`);
      results.push({ ...EMPTY, cuid });
    }
  }

  results.forEach((r, i) => printResult(r, i, results.length));

  if (cuids.length > 1) {
    console.log("\n─── Summary ──────────────────────────────────────────────────");
    console.log("cuid".padEnd(8) + "nick".padEnd(16) + "lv".padEnd(5) + "clan".padEnd(6) + "position");
    console.log("─".repeat(70));
    for (const r of results) {
      console.log(
        (r.cuid ?? "?").padEnd(8) +
        (r.nick  ?? "?").padEnd(16) +
        String(r.level ?? "?").padEnd(5) +
        (r.clanId ?? "—").padEnd(6) +
        (r.position || "—"),
      );
    }
    console.log("─".repeat(70));
  }
}

main().catch((err) => {
  console.error("\nFatal:", (err as Error).message);
  process.exit(1);
});
