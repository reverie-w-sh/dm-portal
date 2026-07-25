import { chromium, type Page } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Item = { rank: number; name: string; level?: number; value: number | string };
type PlayerItem = {
  rank: number;
  name: string;
  level?: number;
  experience: string;
  experienceValue: number;
  monsterWins: number;
  playerWins: number;
};
type Rating = { title: string; valueLabel: string; items: Item[] };
type PlayersRating = { title: string; items: PlayerItem[] };
type RatingsFile = {
  updatedAt?: string;
  ratings: Record<string, Rating>;
  players?: PlayersRating;
};

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
] as const;

function numberFrom(text: string) {
  const value = Number(text.replace(/[^\d-]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function parseNameAndLevel(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^(.*?)(?:\s*\[(\d+)\])?$/u);
  return { name: match?.[1]?.trim() ?? clean, level: match?.[2] ? Number(match[2]) : undefined };
}

async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(900);
}

async function tableMatrix(page: Page) {
  return page.locator("table").evaluateAll((tables) => tables.map((table) => ({
    text: (table.textContent || "").replace(/\s+/g, " ").trim(),
    rows: Array.from(table.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th,td")).map((cell) => (cell.textContent || "").replace(/\s+/g, " ").trim())
    ),
  })));
}

function simpleItemsFromRows(rows: string[][], limit = 20): Item[] {
  const items: Item[] = [];
  for (const cells of rows) {
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
    const rank = Number(cells[0]);
    const { name, level } = parseNameAndLevel(cells[1]);
    const valueText = [...cells].reverse().find((cell) => /\d/.test(cell)) ?? "0";
    if (rank && name) items.push({ rank, name, level, value: numberFrom(valueText) });
    if (items.length >= limit) break;
  }
  return items;
}

async function parseProfession(page: Page, pageName: string): Promise<Item[]> {
  await open(page, `${BASE}${pageName}`);
  const tables = await tableMatrix(page);
  const candidates = tables
    .map((table) => simpleItemsFromRows(table.rows, 20))
    .sort((a, b) => b.length - a.length);
  return candidates[0] ?? [];
}

async function parseAchievementPoints(page: Page): Promise<Item[]> {
  await open(page, `${BASE}ratingAchievementRate`);
  const tables = await tableMatrix(page);
  // На странице две таблицы. Нужна только НИЖНЯЯ — «Рейтинг по очкам».
  const relevant = tables.filter((table) => /Очки достижений/u.test(table.text));
  const bottom = relevant.at(-1);
  return bottom ? simpleItemsFromRows(bottom.rows, Number.POSITIVE_INFINITY) : [];
}

function playerRows(rows: string[][]): PlayerItem[] {
  const result: PlayerItem[] = [];
  for (const cells of rows) {
    if (cells.length < 5 || !/^\d+$/.test(cells[0])) continue;
    const rank = Number(cells[0]);
    const { name, level } = parseNameAndLevel(cells[1]);
    const experience = cells[2];
    const firstExperience = experience.match(/[\d\s]+/)?.[0] ?? "0";
    const monsterWins = numberFrom(cells[3]);
    const playerWins = numberFrom(cells[4]);
    if (rank && name) {
      result.push({ rank, name, level, experience, experienceValue: numberFrom(firstExperience), monsterWins, playerWins });
    }
  }
  return result;
}

async function parseAllPlayers(page: Page): Promise<PlayerItem[]> {
  const startUrl = `${BASE}ratingPeople`;
  const queue = [startUrl];
  const visited = new Set<string>();
  const byName = new Map<string, PlayerItem>();

  while (queue.length && visited.size < 300) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);
    await open(page, url);

    const tables = await tableMatrix(page);
    for (const table of tables) {
      for (const item of playerRows(table.rows)) {
        const old = byName.get(item.name);
        if (!old || item.experienceValue > old.experienceValue) byName.set(item.name, item);
      }
    }

    const links = await page.locator("a[href]").evaluateAll((anchors) => anchors
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => href.includes("file=library") && href.includes("page=ratingPeople")));
    for (const href of links) if (!visited.has(href) && !queue.includes(href)) queue.push(href);
  }

  return [...byName.values()]
    .sort((a, b) => b.experienceValue - a.experienceValue || b.monsterWins - a.monsterWins || a.name.localeCompare(b.name, "ru"))
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

async function parseCommunities(page: Page): Promise<Item[]> {
  await open(page, `${BASE}rating&sortType=ratingSite`);
  const tables = await tableMatrix(page);
  return tables.map((table) => simpleItemsFromRows(table.rows, 20)).sort((a, b) => b.length - a.length)[0] ?? [];
}

async function main() {
  const previous = JSON.parse(await readFile(OUT, "utf8")) as RatingsFile;
  const next: RatingsFile = {
    ...previous,
    updatedAt: new Date().toISOString(),
    ratings: { ...previous.ratings },
    players: previous.players,
  };
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    locale: "ru-RU",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });

  try {
    for (const [key, pageName, title, valueLabel] of SOURCES) {
      try {
        const items = await parseProfession(page, pageName);
        if (items.length) next.ratings[key] = { title, valueLabel, items };
        console.log(`${key}: ${items.length || "сохранены прежние"}`);
      } catch (error) {
        console.warn(`${key}: не удалось обновить`, error);
      }
    }

    try {
      const items = await parseAchievementPoints(page);
      if (items.length) next.ratings.achievements = { title: "Рейтинг достижений", valueLabel: "Очки достижений", items };
      console.log(`achievements (нижняя таблица): ${items.length || "сохранены прежние"}`);
    } catch (error) {
      console.warn("achievements: не удалось обновить", error);
    }

    try {
      const items = await parseAllPlayers(page);
      if (items.length) next.players = { title: "Рейтинг игроков", items };
      console.log(`players: ${items.length || "сохранены прежние"}`);
    } catch (error) {
      console.warn("players: не удалось обновить", error);
    }

    try {
      const items = await parseCommunities(page);
      if (items.length) next.ratings.communities = { title: "Рейтинг сообществ", valueLabel: "Визиты", items };
      console.log(`communities: ${items.length || "сохранены прежние"}`);
    } catch (error) {
      console.warn("communities: не удалось обновить", error);
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
