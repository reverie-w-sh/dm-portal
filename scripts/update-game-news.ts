import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DM_BASE_URL = "https://dm-game.com";
const NEWS_LIST_URL = `${DM_BASE_URL}/guide/news.php?rid=48&index=1`;
const OUTPUT_PATH = path.resolve("data", "game-news.json");
const CONCURRENCY = 4;

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
  commentCount: number;
  comments: GameNewsComment[];
};

type GameNewsData = {
  updatedAt: string;
  sourceUrl: string;
  items: GameNewsItem[];
};

type ListedNews = Omit<
  GameNewsItem,
  "category" | "festivalType" | "comments"
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
  return "other";
}

function classifyNews(title: string, body: string): {
  category: NewsCategory;
  festivalType?: FestivalType;
} {
  const titleLower = title.toLocaleLowerCase("ru-RU");
  const fullText = `${title}\n${body}`.toLocaleLowerCase("ru-RU");

  if (titleLower.includes("фестивал")) {
    return {
      category: "festival",
      festivalType: festivalTypeFor(title),
    };
  }

  if (
    /бой с|мега[- ]?бой|состоится бой|праздничн(?:ым|ого) моб/.test(
      fullText,
    )
  ) {
    return { category: "boss" };
  }

  return { category: "other" };
}

async function fetchHtml(url: string): Promise<string> {
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
  return (
    comment.isSystemResult ||
    /победител|получил|награ|медал|приз|рейтинг\s+топ|топ\s*\d/i.test(
      comment.body,
    )
  );
}

async function readExisting(): Promise<GameNewsData> {
  try {
    const raw = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw) as GameNewsData;
    return {
      updatedAt: parsed.updatedAt ?? "",
      sourceUrl: parsed.sourceUrl ?? NEWS_LIST_URL,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { updatedAt: "", sourceUrl: NEWS_LIST_URL, items: [] };
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
  const [listHtml, existing] = await Promise.all([
    fetchHtml(NEWS_LIST_URL),
    readExisting(),
  ]);
  const listed = parseListing(listHtml);

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
      console.log(
        `[${index + 1}/${listed.length}] ${item.title}: ${comments.length} итогов`,
      );

      return { ...item, ...classification, comments };
    },
  );

  const merged = new Map(existing.items.map((item) => [item.id, item]));
  for (const item of current) merged.set(item.id, item);

  const data: GameNewsData = {
    updatedAt: new Date().toISOString(),
    sourceUrl: NEWS_LIST_URL,
    items: Array.from(merged.values()).sort((a, b) => {
      const byDate = b.createdAt.localeCompare(a.createdAt);
      if (byDate !== 0) return byDate;
      return Number(b.tid) - Number(a.tid);
    }),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(`Новостей на текущей странице: ${current.length}`);
  console.log(`Новостей сохранено всего: ${data.items.length}`);
  console.log(`Обновлён файл: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(
    "Ошибка обновления новостей DM:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
