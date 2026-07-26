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
    valueHeaders: [/кол.*побед/u, /^побед/u, /побед/u],
    valueKind: "number" as const,
  },
  {
    key: "communitiesRatio",
    pageName: "rating&sortType=ratioVL&x=27&y=3",
    title: "Кланы по соотношению побед и поражений",
    valueLabel: "Победы / поражения",
    valueHeaders: [
      /соотнош/u,
      /отнош/u,
      /побед.*пораж/u,
      /коэффициент/u,
      /процент/u,
      /%/u,
    ],
    valueKind: "text" as const,
  },
  {
    key: "communitiesDate",
    pageName: "rating&sortType=date&x=51&y=3",
    title: "Кланы по дате создания",
    valueLabel: "Дата создания",
    valueHeaders: [/дата/u],
    valueKind: "text" as const,
  },
] as const;

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

async function parseAchievements(page: Page) {
  await openRating(page, "ratingAchievementRate");
  return parseRankedTable(await getTables(page), {
    nameHeaders: [/^ник/u, /игрок/u],
    valueHeaders: [/очки достиж/u, /очк/u],
    preferLast: true,
    valueKind: "number",
  });
}

function parsePlayersFromTables(tables: string[][][]) {
  const found = candidates(
    tables,
    [/^ник/u, /игрок/u],
    [/опыт/u, /монстр/u, /побед над игрок/u],
  ).filter((candidate) => {
    const text = candidate.headers.join(" ");
    return (
      /опыт/u.test(text) &&
      /монстр/u.test(text) &&
      /побед над игрок/u.test(text)
    );
  });

  if (!found.length) return [] as Item[];
  const candidate = [...found].sort(
    (a, b) => b.rows.length - b.headerIndex - (a.rows.length - a.headerIndex),
  )[0];

  const rankColumn = headerIndex(candidate.headers, [/^№/u, /^#$/u]);
  const nameColumn = headerIndex(candidate.headers, [/^ник/u, /игрок/u]);
  const experienceColumn = headerIndex(candidate.headers, [/опыт/u]);
  const monsterColumn = headerIndex(candidate.headers, [/монстр/u]);
  const playerColumn = candidate.headers.findIndex(
    (header, index) => index !== nameColumn && /побед над игрок/u.test(header),
  );
  const items: Item[] = [];

  for (const row of candidate.rows.slice(candidate.headerIndex + 1)) {
    if (
      row.length <=
      Math.max(nameColumn, experienceColumn, monsterColumn, playerColumn)
    ) {
      continue;
    }

    const parsedName = nameAndLevel(row[nameColumn] || "");
    if (!parsedName.name || /^вернуться$/iu.test(parsedName.name)) continue;

    const experience = numeric(row[experienceColumn] || "") ?? 0;
    const monsterWins = numeric(row[monsterColumn] || "") ?? 0;
    const playerWins = numeric(row[playerColumn] || "") ?? 0;
    const explicitRank =
      rankColumn >= 0 ? numeric(row[rankColumn] || "") : undefined;

    items.push({
      rank: explicitRank ?? items.length + 1,
      name: parsedName.name,
      level: parsedName.level,
      value: experience,
      experience,
      monsterWins,
      playerWins,
    });
  }

  return items;
}

async function parsePlayers(page: Page) {
  const versions: Item[][] = [];
  const labels = ["Кол. опыта", "Побед над монстрами", "Побед над игроками"];

  await openRating(page, "ratingPeople");
  versions.push(parsePlayersFromTables(await getTables(page)));

  for (const label of labels) {
    await openRating(page, "ratingPeople");
    const selects = page.locator("select");
    const count = await selects.count();

    for (let index = 0; index < count; index += 1) {
      const select = selects.nth(index);
      const options = await select.locator("option").evaluateAll((nodes) =>
        nodes.map((node) => ({
          value: (node as HTMLOptionElement).value,
          label: (node.textContent || "").replace(/\s+/g, " ").trim(),
        })),
      );
      const option = options.find(
        (item) => normalized(item.label) === normalized(label),
      );
      if (!option) continue;

      await select.selectOption(option.value);
      await page.waitForTimeout(1_500);
      versions.push(parsePlayersFromTables(await getTables(page)));
      break;
    }
  }

  return versions.sort((a, b) => b.length - a.length)[0] ?? [];
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
      const items = await parseAchievements(page);
      if (items.length) {
        next.ratings.achievements = {
          title: "Рейтинг достижений",
          valueLabel: "Очки достижений",
          items,
        };
      }
      console.log(`achievements: ${items.length || "сохранены прежние"}`);
    } catch (error) {
      console.warn("achievements: не удалось обновить", error);
    }

    for (const source of COMMUNITY_SOURCES) {
      try {
        await openRating(page, source.pageName);
        const items = parseRankedTable(await getTables(page), {
          nameHeaders: [/имя сообщества/u, /сообществ/u, /клан/u],
          valueHeaders: [...source.valueHeaders],
          valueKind: source.valueKind,
        });
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
