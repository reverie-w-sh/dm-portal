import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Clan = {
  clanId: string;
  name: string;
  smilesCount?: number;
  [key: string]: unknown;
};

const CLANS_FILE = path.join(process.cwd(), "data", "clans.json");
const DM_BASE_URL = "https://dm-game.com";
const CONCURRENCY = 4;

function getAttribute(tag: string, attribute: string): string | null {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i")
  );

  return match?.[1] ?? null;
}

function normalizeImageUrl(src: string): URL | null {
  try {
    // Прибираємо подвійні слеші в старих шляхах DM,
    // але не пошкоджуємо https://
    const normalizedSrc = src.replace(/([^:]\/)\/+/g, "$1");

    return new URL(normalizedSrc, DM_BASE_URL);
  } catch {
    return null;
  }
}

function countClanSmiles(html: string): number {
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const uniqueSmiles = new Set<string>();

  for (const tag of imageTags) {
    const src = getAttribute(tag, "src");

    if (!src) continue;

    const imageUrl = normalizeImageUrl(src);

    if (!imageUrl) continue;

    const pathname = imageUrl.pathname.toLowerCase();
    const filename = pathname.split("/").pop() ?? "";

    // aa.gif — перший загальний смайлик.
    // Усе перед ним вважаємо клановими смайликами.
    if (filename === "aa.gif") {
      break;
    }

    if (!filename.endsWith(".gif")) {
      continue;
    }

    uniqueSmiles.add(imageUrl.href);
  }

  return uniqueSmiles.size;
}

async function getClanSmilesCount(clanId: string): Promise<number> {
  const url = `${DM_BASE_URL}/xmir/b/smiles_old.php?c=${encodeURIComponent(
    clanId
  )}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  return countClanSmiles(html);
}

async function processClan(clan: Clan, index: number, total: number) {
  try {
    const smilesCount = await getClanSmilesCount(clan.clanId);

    console.log(
      `[${index + 1}/${total}] ${clan.name} (${clan.clanId}): ${smilesCount}`
    );

    return {
      ...clan,
      smilesCount,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";

    console.warn(
      `[${index + 1}/${total}] Не удалось проверить ${clan.name} ` +
        `(${clan.clanId}): ${message}`
    );

    /*
     * Якщо сторінка одного клану тимчасово недоступна,
     * не стираємо його попереднє значення.
     */
    return {
      ...clan,
      smilesCount: clan.smilesCount ?? 0,
    };
  }
}

async function runWithConcurrency(
  clans: Clan[],
  concurrency: number
): Promise<Clan[]> {
  const result = new Array<Clan>(clans.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;

      if (index >= clans.length) {
        return;
      }

      result[index] = await processClan(clans[index], index, clans.length);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, clans.length) },
    () => worker()
  );

  await Promise.all(workers);

  return result;
}

async function main() {
  console.log("Загрузка data/clans.json...");

  const raw = await readFile(CLANS_FILE, "utf8");
  const clans = JSON.parse(raw) as Clan[];

  if (!Array.isArray(clans)) {
    throw new Error("data/clans.json должен содержать массив кланов");
  }

  console.log(`Найдено кланов: ${clans.length}`);
  console.log("Проверяем клановые смайлики...");

  const updatedClans = await runWithConcurrency(clans, CONCURRENCY);

  await writeFile(
    CLANS_FILE,
    `${JSON.stringify(updatedClans, null, 2)}\n`,
    "utf8"
  );

  const clansWithSmiles = updatedClans.filter(
    (clan) => (clan.smilesCount ?? 0) > 0
  ).length;

  const totalSmiles = updatedClans.reduce(
    (sum, clan) => sum + (clan.smilesCount ?? 0),
    0
  );

  console.log("");
  console.log("Готово.");
  console.log(`Кланов со смайликами: ${clansWithSmiles}`);
  console.log(`Всего найдено смайликов: ${totalSmiles}`);
  console.log(`Обновлён файл: ${CLANS_FILE}`);
}

main().catch((error) => {
  console.error("Ошибка обновления количества смайликов:", error);
  process.exitCode = 1;
});
