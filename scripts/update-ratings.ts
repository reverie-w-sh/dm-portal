import { chromium, type Page } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Item = { rank: number; name: string; level?: number; value: number | string };
type Rating = { title: string; valueLabel: string; items: Item[] };
type RatingsFile = { updatedAt?: string; ratings: Record<string, Rating> };

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "ratings.json");
const BASE = "https://dm-game.com/?file=library&page=";

const SOURCES = [
  ["fishing", "ratingFishing", "Лучшие рыболовы", "Очки"],
  ["collector", "ratingCollector", "Лучшие собиратели", "Очки"],
  ["hunter", "ratingHunting", "Лучшие охотники", "Очки"],
  ["blacksmith", "ratingBeetle", "Лучшие кузнецы", "Очки"],
  ["leatherworker", "ratingSkiner", "Лучшие кожевники", "Очки"],
  ["doctor", "ratingDoctor", "Лучшие лекари", "Очки"],
  ["alchemy", "ratingAlchemy", "Лучшие алхимики", "Очки"],
  ["enchanter", "ratingZaklin", "Лучшие заклинатели", "Очки"],
  ["seer", "ratingVedun", "Лучшие ведуны", "Очки"],
  ["shooter", "ratingShooter", "Лучшие стрелки", "Очки"],
  ["achievements", "ratingAchievementRate", "Рейтинг достижений", "Очки достижений"],
] as const;

function parseRankLine(line: string): Item | null {
  const clean = line.replace(/\s+/g, " ").trim();
  const match = clean.match(/^(\d+)\s+(.+?)(?:\s*\[(\d+)\])\s+([\d\s]+)(?:\s+.*)?$/u);
  if (!match) return null;
  const rank = Number(match[1]);
  const name = match[2].trim();
  const level = Number(match[3]);
  const value = Number(match[4].replace(/\s/g, ""));
  if (!rank || !name || !Number.isFinite(value)) return null;
  return { rank, name, level, value };
}

async function getBodyLines(page: Page, pageName: string) {
  await page.goto(`${BASE}${pageName}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(1200);
  const text = await page.locator("body").innerText();
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

async function parseSimple(page: Page, pageName: string): Promise<Item[]> {
  const lines = await getBodyLines(page, pageName);
  const start = lines.findIndex((line) => /^№\s+/u.test(line) || line === "№ ник очки" || line === "№ Ник Очки достижений");
  const body = start >= 0 ? lines.slice(start + 1) : lines;
  const items: Item[] = [];
  for (const line of body) {
    if (/^Время последнего обновления|^Вернуться|^Рейтинг по очкам/u.test(line)) break;
    const item = parseRankLine(line);
    if (item) items.push(item);
    if (items.length >= 20) break;
  }
  return items;
}

async function parseTableRows(page: Page, pageName: string): Promise<Item[]> {
  await page.goto(`${BASE}${pageName}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(1500);
  const rows = await page.locator("tr").evaluateAll((trs) => trs.map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) => (td.textContent || "").replace(/\s+/g, " ").trim())
  ));
  const items: Item[] = [];
  for (const cells of rows) {
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
    const rank = Number(cells[0]);
    const nickCell = cells[1];
    const nameMatch = nickCell.match(/^(.*?)(?:\s*\[(\d+)\])?$/u);
    const name = nameMatch?.[1]?.trim();
    const level = nameMatch?.[2] ? Number(nameMatch[2]) : undefined;
    const valueCell = cells.findLast((cell) => /\d/.test(cell)) ?? "0";
    const numeric = Number(valueCell.replace(/[^\d-]/g, ""));
    if (rank && name) items.push({ rank, name, level, value: Number.isFinite(numeric) ? numeric : valueCell });
    if (items.length >= 20) break;
  }
  return items;
}

async function main() {
  const previous = JSON.parse(await readFile(OUT, "utf8")) as RatingsFile;
  const next: RatingsFile = { ...previous, updatedAt: new Date().toISOString(), ratings: { ...previous.ratings } };
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: "ru-RU", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36" });

  try {
    for (const [key, pageName, title, valueLabel] of SOURCES) {
      try {
        const items = await parseSimple(page, pageName);
        if (items.length) next.ratings[key] = { title, valueLabel, items };
        console.log(`${key}: ${items.length || "сохранены прежние"}`);
      } catch (error) {
        console.warn(`${key}: не удалось обновить`, error);
      }
    }

    for (const [key, pageName, title, valueLabel] of [
      ["players", "ratingPeople", "Рейтинг игроков", "Опыт"],
      ["communities", "rating&sortType=ratingSite", "Рейтинг сообществ", "Визиты"],
    ] as const) {
      try {
        const items = await parseTableRows(page, pageName);
        if (items.length) next.ratings[key] = { title, valueLabel, items };
        console.log(`${key}: ${items.length || "сохранены прежние"}`);
      } catch (error) {
        console.warn(`${key}: не удалось обновить`, error);
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(OUT, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
