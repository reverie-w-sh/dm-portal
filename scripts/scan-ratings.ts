/**
 * Scans dm-game.com Rating People page (levels 4–17) and extracts players
 * from known clans plus clanless players.
 * Outputs data/rating-scan.md in FORMAT D for import-rating-scan.ts.
 *
 * Usage:
 *   npx tsx scripts/scan-ratings.ts
 */

import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const LEVELS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const RATING_URL = "https://dm-game.com/?file=library&page=ratingPeople";
const DELAY_MS = 2000;
const CLANS_PATH = path.resolve("data/clans.json");
const SCAN_MD_PATH = path.resolve("data/rating-scan.md");

interface ScannedPlayer {
  nick: string;
  level: number;
  cuid: string;
  profileUrl: string;
  clanId: string;
}

async function main(): Promise<void> {
  const clansRaw: Array<{ clanId: string; name: string }> = JSON.parse(
    fs.readFileSync(CLANS_PATH, "utf-8"),
  );
  const knownClanIds = new Set<string>(clansRaw.map((c) => c.clanId));
  const clanNameToId = new Map<string, string>();
  const clanIdToName = new Map<string, string>();

  for (const clan of clansRaw) {
    clanNameToId.set(clan.name.toLowerCase(), clan.clanId);
    clanIdToName.set(clan.clanId, clan.name);
  }
  clanNameToId.set("хранители", "7");

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  console.log(`Opening ${RATING_URL}...`);
  try {
    await page.goto(RATING_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForSelector('select[name="sortType"]', { timeout: 15_000 });
    await page.waitForSelector("#tbody", { timeout: 15_000 });
  } catch (err) {
    await browser.close();
    throw new Error(`Rating page failed to load: ${(err as Error).message}`);
  }

  const allPlayers: ScannedPlayer[] = [];
  let totalSkipped = 0;

  for (const level of LEVELS) {
    console.log(`Scanning level ${level}...`);
    await page.selectOption('select[name="sortType"]', String(level));

    await page.evaluate(() => {
      const sel = document.querySelector(
        'select[name="sortType"]',
      ) as HTMLSelectElement | null;
      if (!sel) return;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      sel.dispatchEvent(new Event("input", { bubbles: true }));
      const jq = (window as unknown as Record<string, unknown>)["jQuery"];
      if (typeof jq === "function") {
        try {
          (jq as (el: Element) => { trigger: (e: string) => void })(sel).trigger("change");
        } catch {
          /* ignore */
        }
      }
    });

    await page.waitForTimeout(DELAY_MS);

    const { players, skipped } = await page.evaluate(
      ({
        level,
        knownIdsArr,
        clanNameMapEntries,
      }: {
        level: number;
        knownIdsArr: string[];
        clanNameMapEntries: [string, string][];
      }) => {
        const known = new Set(knownIdsArr);
        const nameToId = new Map(clanNameMapEntries);
        const BASE = "https://dm-game.com/index.php?file=infouser&cuid=";
        const rows = Array.from(document.querySelectorAll("#tbody tr"));
        const found: ScannedPlayer[] = [];
        let skipped = 0;

        interface ScannedPlayer {
          nick: string;
          level: number;
          cuid: string;
          profileUrl: string;
          clanId: string;
        }

        for (const tr of rows) {
          const tds = tr.querySelectorAll("td");
          if (tds.length < 2) continue;

          const nickTd = (tr.querySelector("td.nickname") || tds[1]) as HTMLElement;
          const allImgs = Array.from(nickTd.querySelectorAll("img")) as HTMLImageElement[];

          const clanImg = allImgs.find((img) => {
            const src = img.getAttribute("src") || "";
            return /\/pics\/clanpic\/clan_\d+\.gif/i.test(src) || /h-sheriff/i.test(src);
          });

          let clanId = "";

          if (clanImg) {
            const clanSrc = clanImg.getAttribute("src") || "";

            if (/h-sheriff/i.test(clanSrc)) {
              clanId = "7";
            } else {
              const m = clanSrc.match(/clan_(\d+)\.gif/i);
              clanId = m ? m[1] : "";
            }

            if (!clanId) {
              const label = (
                clanImg.getAttribute("alt") ||
                clanImg.getAttribute("title") ||
                ""
              ).toLowerCase().trim();
              if (label) clanId = nameToId.get(label) || "";
            }

            // A clan icon exists, but this clan is not in clans.json.
            // Do not mistake such a player for clanless.
            if (!clanId || !known.has(clanId)) {
              skipped++;
              continue;
            }
          }

          const profileImg = allImgs.find((img) => {
            const oc = img.getAttribute("onclick") || "";
            return oc.includes("infouser") && oc.includes("cuid=");
          });

          let cuid = "";
          if (profileImg) {
            const oc = profileImg.getAttribute("onclick") || "";
            const m = oc.match(/cuid=(\d+)/i);
            if (m) cuid = m[1];
          }

          // Fallback for rows where the profile is a normal link.
          if (!cuid) {
            const profileLink = Array.from(nickTd.querySelectorAll("a")).find((a) => {
              const href = a.getAttribute("href") || "";
              return href.includes("infouser");
            });
            const href = profileLink?.getAttribute("href") || "";
            const cuidMatch = href.match(/[?&]cuid=(\d+)/i);
            if (cuidMatch) cuid = cuidMatch[1];
          }

          if (!cuid) {
            skipped++;
            continue;
          }

          let nick = (nickTd.textContent || "").replace(/\s+/g, " ").trim();
          nick = nick.replace(/\[\d+\]/g, "").trim();
          if (!nick) nick = `player${cuid}`;

          found.push({
            nick,
            level,
            cuid,
            profileUrl: BASE + cuid,
            clanId, // "" means clanless
          });
        }

        return { players: found, skipped };
      },
      {
        level,
        knownIdsArr: [...knownClanIds],
        clanNameMapEntries: [...clanNameToId.entries()],
      },
    );

    const clanlessCount = players.filter((p) => !p.clanId).length;
    console.log(
      `  Level ${level}: ${players.length} players found (${clanlessCount} clanless), ${skipped} skipped (unknown clan / no profile id)`,
    );
    allPlayers.push(...players);
    totalSkipped += skipped;
  }

  await browser.close();

  const seen = new Set<string>();
  const unique: ScannedPlayer[] = [];
  for (const p of allPlayers) {
    if (seen.has(p.cuid)) continue;
    seen.add(p.cuid);
    unique.push(p);
  }

  console.log(`\nTotal rows collected:      ${allPlayers.length}`);
  console.log(`Unique players:            ${unique.length}`);
  console.log(`Clanless players:          ${unique.filter((p) => !p.clanId).length}`);
  console.log(`Skipped (unknown/no cuid): ${totalSkipped}`);

  const byClan = new Map<string, ScannedPlayer[]>();
  for (const p of unique) {
    if (!byClan.has(p.clanId)) byClan.set(p.clanId, []);
    byClan.get(p.clanId)!.push(p);
  }

  const lines: string[] = [];

  const clanless = byClan.get("") ?? [];
  if (clanless.length > 0) {
    lines.push(`## Без клана — CLANLESS — знайдено ${clanless.length}`);
    lines.push("");
    clanless
      .sort((a, b) => b.level - a.level || a.nick.localeCompare(b.nick))
      .forEach((m, i) => {
        lines.push(`${i + 1}. ${m.nick}[${m.level}] — cuid=${m.cuid} — ${m.profileUrl}`);
      });
    lines.push("");
  }

  for (const [clanId, members] of [...byClan.entries()]
    .filter(([clanId]) => clanId !== "")
    .sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const clanName = clanIdToName.get(clanId) ?? `Clan ${clanId}`;
    lines.push(`## ${clanName} — CLAN ${clanId} — знайдено ${members.length}`);
    lines.push("");
    members
      .sort((a, b) => b.level - a.level || a.nick.localeCompare(b.nick))
      .forEach((m, i) => {
        lines.push(`${i + 1}. ${m.nick}[${m.level}] — cuid=${m.cuid} — ${m.profileUrl}`);
      });
    lines.push("");
  }

  fs.writeFileSync(SCAN_MD_PATH, lines.join("\n") + "\n", "utf-8");
  console.log(`\nWritten: ${SCAN_MD_PATH}`);
  console.log(`Done — ${unique.length} players`);
}

main().catch((err) => {
  console.error("Fatal:", (err as Error).message);
  process.exit(1);
});
