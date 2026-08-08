import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DM_BASE_URL = "https://dm-game.com";
const NEWS_LIST_URL = `${DM_BASE_URL}/guide/news.php?rid=48&index=1`;
const OUTPUT_PATH = path.resolve("data", "game-news.json");
const CONCURRENCY = 4;
const ARCHIVE_PAGE_COUNT = 19;

type NewsCategory = "festival" | "boss" | "other";
type FestivalType =
  | "fisher"
  | "gatherer"
  | "hunter"
  | "andvari"
  | "blacksmith"
  | "fighters"
  | "labyrinth"
  | "familiar"
  | "easter"
  | "pumpkin"
  | "other";

type BossType =
  | "cupid"
  | "gorgon"
  | "clown"
  | "zaya"
  | "neuch"
  | "rudi"
  | "pumpkin"
  | "snowman"
  | "other";

type GameNewsComment = {
  author: string;
  date: string;
  body: string;
  profileUrl?: string;
  isSystemResult: boolean;
};

type GameNewsItem = {
  id: string;
  tid: string;
  title: string;
  publishedAt: string;
  createdAt: string;
  body: string;
  sourceUrl: string;
  category: NewsCategory;
  festivalType?: FestivalType;
  bossType?: BossType;
  commentCount: number;
  comments: GameNewsComment[];
  synthetic?: boolean;
  periodLabel?: string;
  resultText?: string;
};

type GameNewsData = {
  updatedAt: string;
  sourceUrl: string;
  archiveComplete: boolean;
  archivePages: number;
  items: GameNewsItem[];
};

type ListedNews = Omit<
  GameNewsItem,
  "category" | "festivalType" | "bossType" | "comments"
>;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
};

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, entity: string) =>
      ENTITY_MAP[entity.toLowerCase()] ?? match,
    );
}

function htmlToText(value: string): string {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|div|li|tr|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function festivalTypeFor(text: string): FestivalType {
  const value = text.toLocaleLowerCase("ru-RU");

  if (/рыбак/.test(value)) return "fisher";
  if (/собират/.test(value)) return "gatherer";
  if (/охотник/.test(value)) return "hunter";
  if (/андвар|адвар/.test(value)) return "andvari";
  if (/кузнец/.test(value)) return "blacksmith";
  if (/бойц/.test(value)) return "fighters";
  if (/лабиринт/.test(value)) return "labyrinth";
  if (/фамильяр/.test(value)) return "familiar";
  if (/безумн.*тыкв/.test(value)) return "pumpkin";
  return "other";
}

function bossTypeFor(title: string, body: string): BossType | undefined {
  const titleLower = title.toLocaleLowerCase("ru-RU");
  const bodyLower = body.toLocaleLowerCase("ru-RU");
  const fullText = `${titleLower}\n${bodyLower}`;

  if (/купидон/.test(fullText)) return "cupid";
  if (/похитительниц.*женск.*красот/.test(fullText)) return "gorgon";
  if (/^1 апреля/.test(titleLower)) return "clown";
  if (/пасхальн.*за|бой с за[её]й/.test(fullText)) return "zaya";
  if (/неуч/.test(fullText) || /день знаний/.test(titleLower)) return "neuch";
  if (/rüdiger|руд(?:и|иг)|рюд(?:и|иг)/.test(fullText)) return "rudi";
  if (
    /бой с тыкв|разбить лицо тыкв/.test(fullText) ||
    (/мега[- ]?бой/.test(titleLower) && /тыкв/.test(fullText))
  ) return "pumpkin";
  if (/снеговик/.test(fullText)) return "snowman";

  if (/бой с|мега[- ]?бой|состоится бой|праздничн(?:ым|ого) моб/.test(titleLower)) {
    return "other";
  }

  return undefined;
}

function classifyNews(title: string, body: string): {
  category: NewsCategory;
  festivalType?: FestivalType;
  bossType?: BossType;
} {
  const titleLower = title.toLocaleLowerCase("ru-RU");
  const bossType = bossTypeFor(title, body);

  if (titleLower.includes("фестивал") || /безумн.*тыкв/.test(titleLower)) {
    return {
      category: "festival",
      festivalType: festivalTypeFor(title),
      bossType,
    };
  }

  if (bossType) {
    return { category: "boss", bossType };
  }

  return { category: "other" };
}

async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 Chrome/150 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${url}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 450));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Не удалось загрузить ${url}`);
}

function parseListing(html: string): ListedNews[] {
  const result: ListedNews[] = [];
  const pattern =
    /<h1>([\s\S]*?)<\/h1>\s*<span class="s_small s_date">([^<]+)<\/span><br><br>([\s\S]*?)<div class="d_more_info"><a href="news\.php\?tid=(\d+)"[^>]*>комментариев:\s*(\d+)<\/a><\/div>/gi;

  for (const match of html.matchAll(pattern)) {
    const [, titleHtml, publishedAtRaw, bodyHtml, tid, countRaw] = match;
    const title = htmlToText(titleHtml);
    const publishedAt = publishedAtRaw.trim();
    const body = htmlToText(bodyHtml);

    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) continue;

    result.push({
      id: `dm-news-${tid}`,
      tid,
      title,
      publishedAt,
      createdAt: `${publishedAt}T12:00:00.000Z`,
      body,
      sourceUrl: `${DM_BASE_URL}/guide/news.php?tid=${tid}`,
      commentCount: Number(countRaw) || 0,
    });
  }

  return result;
}

function parseComments(html: string): GameNewsComment[] {
  const chunks = html.split(/<div class="d_comment">/i).slice(1);
  const comments: GameNewsComment[] = [];

  for (const chunk of chunks) {
    const end = chunk.search(/<\/div>\s*<!--/i);
    const commentHtml = end >= 0 ? chunk.slice(0, end) : chunk;
    const authorMatch = commentHtml.match(
      /class="S-Live-ORK">([\s\S]*?)<\/span>/i,
    );
    const dateMatch = commentHtml.match(
      /class="s_small s_date">([^<]+)<\/span>/i,
    );
    const profileMatch = commentHtml.match(/file=infouser&cuid=(\d+)/i);
    const bodyStart = commentHtml.search(
      /<div style="color:blue;"><\/div>/i,
    );

    let bodyHtml = bodyStart >= 0
      ? commentHtml.slice(bodyStart).replace(
          /^[\s\S]*?<div style="color:blue;"><\/div>/i,
          "",
        )
      : commentHtml;
    const alignIndex = bodyHtml.search(/<div align="right">/i);
    if (alignIndex >= 0) bodyHtml = bodyHtml.slice(0, alignIndex);

    const author = htmlToText(authorMatch?.[1] ?? "");
    const date = dateMatch?.[1]?.trim() ?? "";
    const body = htmlToText(bodyHtml);

    if (!author && !body) continue;

    comments.push({
      author,
      date,
      body,
      ...(profileMatch
        ? {
            profileUrl: `${DM_BASE_URL}/index.php?file=infouser&cuid=${profileMatch[1]}`,
          }
        : {}),
      isSystemResult: body.includes("[Система]"),
    });
  }

  return comments;
}

function isResultComment(comment: GameNewsComment): boolean {
  if (comment.isSystemResult) return true;

  const body = comment.body;

  return (
    /рейтинг\s+топ\s*\d+\s*:/i.test(body) ||
    /фестивал[\s\S]{0,100}окончен/i.test(body) ||
    /получили[\s\S]{0,160}(?:медал|орден|свиток|манускрипт|награ|приз|тг|тера)/i.test(
      body,
    ) ||
    /топ\s+\d+\s*-\s*\d+/i.test(body) ||
    /(?:^|\n)\s*(?:I|II|III|IV)\s+место\s*[-—:]/im.test(body)
  );
}

function gameDateFromIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function isoFromGameDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function easterSourceDate(item: GameNewsItem): string {
  const explicitStart = item.body.match(
    /(?:c|с)\s*(\d{2}\.\d{2}\.\d{4})\s+крашенки/i,
  )?.[1];
  if (explicitStart) return isoFromGameDate(explicitStart) ?? item.publishedAt;

  const embeddedNewsDate = item.body.match(
    /бой с пасхальн[^\n]*\n(\d{4}-\d{2}-\d{2})/i,
  )?.[1];
  return embeddedNewsDate ?? item.publishedAt;
}

function easterEndDate(item: GameNewsItem, year: string): string | null {
  const fullDate = item.body.match(
    /(?:даты окончания|финал)[^\d]{0,12}(\d{2}\.\d{2}\.\d{4})/i,
  )?.[1];
  if (fullDate) return isoFromGameDate(fullDate);

  const shortFinal = item.body.match(
    /(\d{2}\.\d{2})(?:\.\d{4})?\s*[—-]\s*финал/i,
  )?.[1];
  return shortFinal ? isoFromGameDate(`${shortFinal}.${year}`) : null;
}

function easterFestivalBody(item: GameNewsItem): string {
  if (/шкарлуп/i.test(item.title)) return item.body;

  const markers = [
    /(?:c|с)\s*\d{2}\.\d{2}\.\d{4}\s+крашенки\s*:/i,
    /в таверне/i,
    /в трактире/i,
    /в пустыне/i,
  ];

  for (const marker of markers) {
    const match = marker.exec(item.body);
    if (match?.index != null) {
      const body = item.body.slice(match.index).trim();
      const finalIndex = body.search(/\d{2}\.\d{2}\s*[—-]\s*финал/i);
      return finalIndex >= 0 ? body.slice(0, finalIndex).trim() : body;
    }
  }

  return item.body;
}

function easterResultText(item: GameNewsItem): string | undefined {
  const finalIndex = item.body.search(/\d{2}\.\d{2}\s*[—-]\s*финал/i);
  return finalIndex >= 0 ? item.body.slice(finalIndex).trim() : undefined;
}

function buildEasterFestivals(items: GameNewsItem[]): GameNewsItem[] {
  const candidates = items.filter((item) => {
    const text = `${item.title}\n${item.body}`;
    return /пасхальн[^\n]*за|собиратор\s+шкарлуп/i.test(text);
  });

  const bestByYear = new Map<string, GameNewsItem>();

  for (const item of candidates) {
    const startDate = easterSourceDate(item);
    const year = startDate.slice(0, 4);
    if (!/^\d{4}$/.test(year)) continue;

    const current = bestByYear.get(year);
    const score =
      (/шкарлуп/i.test(item.title) ? 4 : 0) +
      (/крашенки/i.test(item.body) ? 2 : 0) +
      (/финал|даты окончания/i.test(item.body) ? 2 : 0) +
      (item.comments.length > 0 ? 1 : 0);
    const currentScore = current
      ? (/шкарлуп/i.test(current.title) ? 4 : 0) +
        (/крашенки/i.test(current.body) ? 2 : 0) +
        (/финал|даты окончания/i.test(current.body) ? 2 : 0) +
        (current.comments.length > 0 ? 1 : 0)
      : -1;

    if (!current || score > currentScore) bestByYear.set(year, item);
  }

  return Array.from(bestByYear.entries()).map(([year, source]) => {
    const startDate = easterSourceDate(source);
    const endDate = easterEndDate(source, year);
    const periodLabel = endDate
      ? `${gameDateFromIso(startDate)} — ${gameDateFromIso(endDate)}`
      : `с ${gameDateFromIso(startDate)}`;

    return {
      ...source,
      id: `dm-easter-${year}`,
      tid: `${source.tid}-easter`,
      title: "Пасхальный фестиваль — Крашенки",
      publishedAt: startDate,
      createdAt: `${startDate}T12:00:00.000Z`,
      body: easterFestivalBody(source),
      category: "festival",
      festivalType: "easter",
      synthetic: true,
      periodLabel,
      resultText: easterResultText(source),
    };
  });
}

async function readExisting(): Promise<GameNewsData> {
  try {
    const raw = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as GameNewsData;
    return {
      updatedAt: parsed.updatedAt ?? "",
      sourceUrl: parsed.sourceUrl ?? NEWS_LIST_URL,
      archiveComplete: parsed.archiveComplete === true,
      archivePages:
        typeof parsed.archivePages === "number" ? parsed.archivePages : 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return {
      updatedAt: "",
      sourceUrl: NEWS_LIST_URL,
      archiveComplete: false,
      archivePages: 0,
      items: [],
    };
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const result = new Array<R>(items.length);
  let nextIndex = 0;

  async function run(): Promise<void> {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      result[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );
  return result;
}

async function main(): Promise<void> {
  const existing = await readExisting();
  const isArchiveBackfill = !existing.archiveComplete;
  const pageNumbers = isArchiveBackfill
    ? Array.from({ length: ARCHIVE_PAGE_COUNT }, (_, index) => index + 1)
    : [1];

  console.log(
    isArchiveBackfill
      ? `Первичный архив: загружаю ${ARCHIVE_PAGE_COUNT} страниц новостей.`
      : "Архив уже собран: обновляю только первую страницу новостей.",
  );

  const listPages = await mapWithConcurrency(
    pageNumbers,
    CONCURRENCY,
    async (pageNumber) => {
      const url = `${DM_BASE_URL}/guide/news.php?rid=48&index=${pageNumber}`;
      const html = await fetchHtml(url);
      const items = parseListing(html);

      if (items.length === 0) {
        throw new Error(`Не удалось распознать новости на странице ${pageNumber}`);
      }

      console.log(`Страница ${pageNumber}: ${items.length} новостей`);
      return items;
    },
  );

  const listed = Array.from(
    new Map(listPages.flat().map((item) => [item.id, item])).values(),
  );

  if (listed.length === 0) {
    throw new Error("Не удалось распознать ни одной новости DM");
  }

  const current = await mapWithConcurrency(
    listed,
    CONCURRENCY,
    async (item, index): Promise<GameNewsItem> => {
      const detailHtml = await fetchHtml(item.sourceUrl);
      const comments = parseComments(detailHtml).filter(isResultComment);
      const classification = classifyNews(item.title, item.body);
      if (comments.length > 0 || (index + 1) % 20 === 0) {
        console.log(
          `[${index + 1}/${listed.length}] ${item.title}: ${comments.length} итогов`,
        );
      }

      return { ...item, ...classification, comments };
    },
  );

  const merged = new Map(
    existing.items.filter((item) => !item.synthetic).map((item) => [
      item.id,
      {
        ...item,
        comments: Array.isArray(item.comments)
          ? item.comments.filter(isResultComment)
          : [],
      },
    ]),
  );
  for (const item of current) merged.set(item.id, item);

  const sourceItems = Array.from(merged.values()).map((item) => ({
    ...item,
    ...classifyNews(item.title, item.body),
  }));
  const easterFestivals = buildEasterFestivals(sourceItems);

  const data: GameNewsData = {
    updatedAt: new Date().toISOString(),
    sourceUrl: NEWS_LIST_URL,
    archiveComplete: existing.archiveComplete || isArchiveBackfill,
    archivePages: Math.max(existing.archivePages, pageNumbers.length),
    items: [...sourceItems, ...easterFestivals].sort((a, b) => {
      const byDate = b.createdAt.localeCompare(a.createdAt);
      if (byDate !== 0) return byDate;
      return Number(b.tid) - Number(a.tid);
    }),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(`Новостей проверено сейчас: ${current.length}`);
  console.log(`Новостей сохранено: ${sourceItems.length}`);
  console.log(`Пасхальных фестивалей: ${easterFestivals.length}`);
  console.log(`Обновлён файл: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(
    "Ошибка обновления новостей DM:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
