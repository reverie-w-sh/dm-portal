/**
 * Test script for the dm-game.com profile parser.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  parseProfileHtml,
  type ParsedProfile,
} from "./parse-profile";

const BASE_URL =
  "https://dm-game.com/index.php?file=infouser&cuid=";

const DELAY_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(cuid: string): Promise<string> {
  const url = `${BASE_URL}${cuid}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; DM-Portal-Scanner/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${url}`);
  }

  return response.text();
}

function printResult(
  result: ParsedProfile,
  index: number,
  total: number,
): void {
  const prefix =
    total > 1 ? `[${index + 1}/${total}] ` : "";

  console.log(
    `\n${prefix}─── cuid: ${result.cuid ?? "?"} ───`,
  );

  console.log(
    `  nick:       ${result.nick ?? "(not found)"}`,
  );

  console.log(
    `  level:      ${result.level ?? "(not found)"}`,
  );

  console.log(
    `  reinc:      ${result.reincarnationLevel ?? "(none)"}`,
  );

  console.log(
    `  clanId:     ${result.clanId ?? "(none)"}`,
  );

  console.log(
    `  clanName:   ${result.clanName ?? "(none)"}`,
  );

  console.log(
    `  clanIcon:   ${result.clanIcon ?? "(none)"}`,
  );

  console.log(
    `  allianceId: ${result.allianceId ?? "(unknown)"}`,
  );

  console.log(
    `  alliance:   ${result.allianceName || "(none)"}`,
  );

  console.log(
    `  position:   ${result.position || "(none)"}`,
  );
}

const EMPTY: ParsedProfile = {
  cuid: null,
  nick: null,
  level: null,
  reincarnationLevel: null,
  clanId: null,
  clanName: null,
  clanIcon: null,
  allianceId: null,
  allianceName: null,
  position: "",
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error([
      "Usage:",
      "  npx tsx scripts/test-parse-profile.ts --file scripts/sample-2171.html",
      "  npx tsx scripts/test-parse-profile.ts 2171",
    ].join("\n"));

    process.exit(1);
  }

  const fileFlag = args.indexOf("--file");

  if (fileFlag !== -1) {
    const filePath = args[fileFlag + 1];

    if (!filePath) {
      throw new Error("--file requires a path");
    }

    const resolved = path.resolve(filePath);
    const html = fs.readFileSync(resolved, "utf-8");
    const result = parseProfileHtml(html);

    printResult(result, 0, 1);
    console.log("\n--- Raw JSON ---");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const cuids = args.filter((value) =>
    /^\d+$/.test(value),
  );

  const results: ParsedProfile[] = [];

  for (let index = 0; index < cuids.length; index++) {
    const cuid = cuids[index];

    try {
      if (index > 0) {
        await sleep(DELAY_MS);
      }

      const html = await fetchHtml(cuid);
      results.push(parseProfileHtml(html));
    } catch (error) {
      console.error(
        `cuid=${cuid}: ${
          error instanceof Error
            ? error.message
            : error
        }`,
      );

      results.push({
        ...EMPTY,
        cuid,
      });
    }
  }

  results.forEach((result, index) =>
    printResult(result, index, results.length),
  );
}

main().catch((error) => {
  console.error(
    "Fatal:",
    error instanceof Error ? error.message : error,
  );

  process.exit(1);
});
