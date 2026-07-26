import { chromium, type Page } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Item = {
  rank: number;
  name: string;
  level?: number;
  value: number | string;
  experience?: number;
  monsterWins?: number;
  playerWins?: number;
};

type Rating = {
  title: string;
  valueLabel: string;
  items: Item[];
};

type RatingsFile = {
  updatedAt?: string;
  ratings: Record<string, Rating>;
};

type TableCandidate = {
  rows: string[][];
  headerIndex: number;
  headers: string[];
};

type PlayerApiRow = {
  username?: string;
  level?: string | number;
  experience?: string | number;
  statBattleMonstr?: string | number;
  statBattleWin?: string | number;
};

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "ratings.json");
const BASE = "https://dm-game.com/?file=library&page=";

const PROFESSIONS = [
  ["fishing", "ratingFishing", "Лучшие рыболовы"],
  ["collector", "ratingCollector", "Лучшие собиратели"],
  ["hunting", "ratingHunting", "Лучшие охотники"],
  ["blacksmith", "ratingBeetle", "Лучшие кузнецы"],
  ["leatherworker", "ratingSkiner", "Лучшие кожевники"],
  ["doctor", "ratingDoctor", "Лучшие лекари"],
  ["alchemy", "ratingAlchemy", "Лучшие алхимики"],
  ["enchanter", "ratingZaklin", "Лучшие заклинатели"],
  ["seer", "ratingVedun", "Лучшие ведуны"],
  ["shooter", "ratingShooter", "Лучшие производители болтов"],
] as const;

const COMMUNITY_SOURCES = [
  {
    key: "communitiesVictories",
    pageName: "rating&sortType=quantityVictory&x=61&y=6",
    title: "Кланы по количеству побед",
    valueLabel: "Победы",
    valueColumn: 2,
  },
  {
    key: "communitiesRatio",
    pageName: "rating&sortType=ratioVL&x=27&y=3",
    title: "Кланы по соотношению побед и поражений",
    valueLabel: "Победы / поражения",
    valueColumn: 4,
  },
  {
    key: "communitiesDate",
    pageName: "rating&sortType=date&x=51&y=3",
    title: "Кланы по дате создания",
    valueLabel: "Дата создания",
    valueColumn: 2,
  },
] as const;

const FIXED_ACHIEVEMENTS: Item[] = [
  { rank: 1, name: "WanTeck", level: 15, value: 624 },
  { rank: 2, name: "Мужские слезы", level: 12, value: 602 },
  { rank: 3, name: "Таракашка", level: 17, value: 599 },
  { rank: 4, name: "Torturer", level: 14, value: 547 },
  { rank: 5, name: "MAX PAYNE", level: 15, value: 532 },
  { rank: 6, name: "Юпитер", level: 15, value: 532 },
];

function clean(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalized(value: string) {
  return clean(value).toLocaleLowerCase("ru-RU");
}

function numeric(value: string) {
  const match = clean(value).match(/-?\d[\d\s]*/u);
  if (!match) return undefined;
  const parsed = Number(match[0].replace(/\s/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function nameAndLevel(value: string) {
  const text = clean(value);
  const match = text.match(/^(.*?)\s*\[(\d+)\]\s*$/u);
  if (!match) return { name: text, level: undefined };
  return { name: clean(match[1]), level: Number(match[2]) };
}

async function openRating(page: Page, pageName: string) {
  await page.goto(`${BASE}${pageName}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForTimeout(1_200);
}

async function getTables(page: Page): Promise<string[][][]> {
  return page.locator("table").evaluateAll((tables) =>
    tables.map((table) =>
      Array.from(table.querySelectorAll("tr"))
        .map((row) =>
          Array.from(row.querySelectorAll(":scope > th, :scope > td")).map(
            (cell) =>
              (cell.textContent || "")
                .replace(/\u00a0/g, " ")
                .replace(/\s+/g, " ")
                .trim(),
          ),
        )
        .filter((row) => row.some(Boolean)),
    ),
  );
}

function candidates(
  tables: string[][][],
  nameHeaders: RegExp[],
  valueHeaders: RegExp[],
) {
  const found: TableCandidate[] = [];
  for (const rows of tables) {
    rows.forEach((row, headerIndex) => {
      const headers = row.map(normalized);
      const hasName = headers.some((header) =>
        nameHeaders.some((pattern) => pattern.test(header)),
      );
      const hasValue = headers.some((header) =>
        valueHeaders.some((pattern) => pattern.test(header)),
      );
      if (hasName && hasValue) found.push({ rows, headerIndex, headers });
    });
  }
  return found;
}

function headerIndex(headers: string[], patterns: RegExp[]) {
  return headers.findIndex((header) =>
    patterns.some((pattern) => pattern.test(header)),
  );
}

function parseRankedTable(
  tables: string[][][],
  options: {
    nameHeaders: RegExp[];
    valueHeaders: RegExp[];
    preferLast?: boolean;
    limit?: number;
    valueKind?: "number" | "text";
  },
) {
  const found = candidates(tables, options.nameHeaders, options.valueHeaders);
  if (!found.length) return [] as Item[];

  const candidate = options.preferLast
    ? found[found.length - 1]
    : [...found].sort(
        (a, b) =>
          b.rows.length - b.headerIndex - (a.rows.length - a.headerIndex),
      )[0];

  const rankColumn = headerIndex(candidate.headers, [/^№/u, /^#$/u]);
  const nameColumn = headerIndex(candidate.headers, options.nameHeaders);
  const valueColumn = headerIndex(candidate.headers, options.valueHeaders);
  const items: Item[] = [];

  for (const row of candidate.rows.slice(candidate.headerIndex + 1)) {
    if (row.length <= Math.max(nameColumn, valueColumn)) continue;
    const parsedName = nameAndLevel(row[nameColumn] || "");
    if (!parsedName.name || /^вернуться$/iu.test(parsedName.name)) continue;

    const explicitRank =
      rankColumn >= 0 ? numeric(row[rankColumn] || "") : undefined;
    const rank = explicitRank ?? items.length + 1;
    const rawValue = clean(row[valueColumn] || "");
    const parsedValue =
      options.valueKind === "text" ? rawValue : numeric(rawValue);

    if (!rank || parsedValue === undefined || parsedValue === "") continue;

    items.push({
      rank,
      name: parsedName.name,
      level: parsedName.level,
      value: parsedValue,
    });

    if (options.limit && items.length >= options.limit) break;
  }

  return items;
}

async function parseProfession(page: Page, pageName: string) {
  await openRating(page, pageName);
  return parseRankedTable(await getTables(page), {
    nameHeaders: [/^ник/u, /игрок/u],
    valueHeaders: [/^очки?$/u, /очк/u],
    limit: 20,
    valueKind: "number",
  });
}

function fixedAchievements() {
  return FIXED_ACHIEVEMENTS.map((item) => ({ ...item }));
}

async function parsePlayers(page: Page) {
  const response = await page.request.get(
    `${BASE}ratingPeople&ajax=1&order_by=experience&cur_lvl=0`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok()) {
    throw new Error(`ratingPeople API: HTTP ${response.status()}`);
  }

  const rows = (await response.json()) as Array<PlayerApiRow | null>;
  return rows
    .filter((row): row is PlayerApiRow => {
      if (!row) return false;
      const name = clean(String(row.username ?? ""));
      return name && !/^mob\d+[a-z]*$/iu.test(name);
    })
    .map((row, index) => {
      const name = clean(String(row.username ?? ""));
      const experience = Number(row.experience ?? 0);
      const monsterWins = Number(row.statBattleMonstr ?? 0);
      const playerWins = Number(row.statBattleWin ?? 0);

      return {
        rank: index + 1,
        name,
        level: Number(row.level ?? 0) || undefined,
        value: Number.isFinite(experience) ? experience : 0,
        experience: Number.isFinite(experience) ? experience : 0,
        monsterWins: Number.isFinite(monsterWins) ? monsterWins : 0,
        playerWins: Number.isFinite(playerWins) ? playerWins : 0,
      };
    });
}

async function parseCommunity(
  page: Page,
  source: (typeof COMMUNITY_SOURCES)[number],
) {
  await openRating(page, source.pageName);
  return page.locator('table.tb-br tr:has(a[href*="clanId="])').evaluateAll(
    (rows, valueColumn) =>
      rows
        .map((row, index) => {
          const cells = Array.from(row.children).filter(
            (cell) => cell.tagName === "TD",
          );
          const name =
            row
              .querySelector('a[href*="clanId="] b')
              ?.textContent?.replace(/\u00a0/g, " ")
              .replace(/\s+/g, " ")
              .trim() ?? "";
          const value =
            cells[valueColumn]?.textContent
              ?.replace(/\u00a0/g, " ")
              .replace(/\s+/g, " ")
              .trim() ?? "";

          if (!name || !value) return null;
          return { rank: index + 1, name, value };
        })
        .filter(
          (item): item is { rank: number; name: string; value: string } =>
            item !== null,
        ),
    source.valueColumn,
  );
}

async function main() {
  const previous = JSON.parse(await readFile(OUT, "utf8")) as RatingsFile;
  const next: RatingsFile = {
    ...previous,
    updatedAt: new Date().toISOString(),
    ratings: { ...previous.ratings },
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    locale: "ru-RU",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });

  try {
    for (const [key, pageName, title] of PROFESSIONS) {
      try {
        const items = await parseProfession(page, pageName);
        if (items.length) {
          next.ratings[key] = { title, valueLabel: "Очки", items };
        }
        console.log(`${key}: ${items.length || "сохранены прежние"}`);
      } catch (error) {
        console.warn(`${key}: не удалось обновить`, error);
      }
    }

    try {
      const items = fixedAchievements();
      next.ratings.achievements = {
        title: "Рейтинг достижений",
        valueLabel: "Очки достижений",
        items,
      };
      console.log(`achievements: ${items.length} (фиксировано)`);
    } catch (error) {
      console.warn("achievements: не удалось обновить", error);
    }

    for (const source of COMMUNITY_SOURCES) {
      try {
        const items = await parseCommunity(page, source);
        if (items.length) {
          next.ratings[source.key] = {
            title: source.title,
            valueLabel: source.valueLabel,
            items,
          };
          if (source.key === "communitiesVictories") {
            next.ratings.communities = {
              title: source.title,
              valueLabel: source.valueLabel,
              items,
            };
          }
        }
        console.log(`${source.key}: ${items.length || "сохранены прежние"}`);
      } catch (error) {
        console.warn(`${source.key}: не удалось обновить`, error);
      }
    }

    try {
      const items = await parsePlayers(page);
      if (items.length) {
        next.ratings.players = {
          title: "Рейтинг игроков",
          valueLabel: "Опыт",
          items,
        };
      }
      console.log(`players: ${items.length || "сохранены прежние"}`);
    } catch (error) {
      console.warn("players: не удалось обновить", error);
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
