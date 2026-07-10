import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Player = {
  cuid: string;
  nick: string;
  level?: number;
  clanId?: string;
  clanName?: string;
  clanIcon?: string;
  profileUrl?: string;
  [key: string]: unknown;
};

type PersonalSmilesPlayer = {
  cuid: string;
  nick: string;
  level: number;
  clanId: string;
  clanName: string;
  clanIcon: string;
  profileUrl: string;
  smilesPageUrl: string;
  personalSmilesCount: number;
  personalSmiles: string[];
};

const PLAYERS_FILE = path.join(
  process.cwd(),
  "data",
  "players.json"
);

const OUTPUT_FILE = path.join(
  process.cwd(),
  "data",
  "personal-smiles.json"
);

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
    /*
     * Прибираємо подвійні слеші зі старих шляхів DM,
     * але не пошкоджуємо https://
     */
    const normalizedSrc = src.replace(/([^:]\/)\/+/g, "$1");

    return new URL(normalizedSrc, DM_BASE_URL);
  } catch {
    return null;
  }
}

function getPersonalSmiles(html: string, cuid: string): string[] {
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const uniqueSmiles = new Set<string>();

  const expectedFolder = `/layout/all/smiles/${cuid}/`;

  for (const tag of imageTags) {
    const src = getAttribute(tag, "src");

    if (!src) continue;

    const imageUrl = normalizeImageUrl(src);

    if (!imageUrl) continue;

    const pathname = imageUrl.pathname.toLowerCase();
    const filename = pathname.split("/").pop() ?? "";

    /*
     * Беремо лише GIF із персональної папки
     * конкретного гравця.
     *
     * Наприклад:
     * /layout/all/smiles/4394/prv_allania40.gif
     */
    if (!pathname.includes(expectedFolder.toLowerCase())) {
      continue;
    }

    if (!filename.endsWith(".gif")) {
      continue;
    }

    uniqueSmiles.add(imageUrl.href);
  }

  return Array.from(uniqueSmiles);
}

async function getPlayerPersonalSmiles(
  cuid: string
): Promise<string[]> {
  const url =
    `${DM_BASE_URL}/xmir/b/smiles_old.php?u=` +
    encodeURIComponent(cuid);

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
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  return getPersonalSmiles(html, cuid);
}

async function processPlayer(
  player: Player,
  index: number,
  total: number
): Promise<PersonalSmilesPlayer | null> {
  try {
    const personalSmiles = await getPlayerPersonalSmiles(
      player.cuid
    );

    console.log(
      `[${index + 1}/${total}] ${player.nick} ` +
        `(${player.cuid}): ${personalSmiles.length}`
    );

    if (personalSmiles.length === 0) {
      return null;
    }

    return {
      cuid: player.cuid,
      nick: player.nick,
      level: player.level ?? 0,
      clanId: player.clanId ?? "",
      clanName: player.clanName ?? "",
      clanIcon: player.clanIcon ?? "",
      profileUrl:
        player.profileUrl ??
        `${DM_BASE_URL}/index.php?file=infouser&cuid=${player.cuid}`,
      smilesPageUrl:
        `${DM_BASE_URL}/xmir/b/smiles_old.php?u=${player.cuid}`,
      personalSmilesCount: personalSmiles.length,
      personalSmiles,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Неизвестная ошибка";

    console.warn(
      `[${index + 1}/${total}] Не удалось проверить ` +
        `${player.nick} (${player.cuid}): ${message}`
    );

    return null;
  }
}

async function runWithConcurrency(
  players: Player[],
  concurrency: number
): Promise<PersonalSmilesPlayer[]> {
  const result = new Array<PersonalSmilesPlayer | null>(
    players.length
  );

  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;

      if (index >= players.length) {
        return;
      }

      result[index] = await processPlayer(
        players[index],
        index,
        players.length
      );
    }
  }

  const workers = Array.from(
    {
      length: Math.min(concurrency, players.length),
    },
    () => worker()
  );

  await Promise.all(workers);

  return result.filter(
    (player): player is PersonalSmilesPlayer =>
      player !== null
  );
}

async function main() {
  console.log("Загрузка списка игроков...");

  const raw = await readFile(PLAYERS_FILE, "utf8");
  const players = JSON.parse(raw) as Player[];

  if (!Array.isArray(players)) {
    throw new Error(
      "Файл игроков должен содержать массив"
    );
  }

  /*
   * Прибираємо можливі дублікати за cuid.
   */
  const uniquePlayers = Array.from(
    new Map(
      players
        .filter(
          (player) =>
            typeof player.cuid === "string" &&
            player.cuid.trim() !== ""
        )
        .map((player) => [player.cuid, player])
    ).values()
  );

  console.log(`Найдено игроков: ${uniquePlayers.length}`);
  console.log("Проверяем личные смайлики...");

  const playersWithSmiles = await runWithConcurrency(
    uniquePlayers,
    CONCURRENCY
  );

  /*
   * Основне сортування:
   * спочатку за кількістю смайликів,
   * при однаковій кількості — за ніком.
   */
  playersWithSmiles.sort((a, b) => {
    const countDifference =
      b.personalSmilesCount - a.personalSmilesCount;

    if (countDifference !== 0) {
      return countDifference;
    }

    return a.nick.localeCompare(b.nick, "ru");
  });

  await writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(playersWithSmiles, null, 2)}\n`,
    "utf8"
  );

  const totalSmiles = playersWithSmiles.reduce(
    (sum, player) =>
      sum + player.personalSmilesCount,
    0
  );

  console.log("");
  console.log("Готово.");
  console.log(
    `Игроков с личными смайликами: ${playersWithSmiles.length}`
  );
  console.log(
    `Всего найдено личных смайликов: ${totalSmiles}`
  );
  console.log(`Создан файл: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(
    "Ошибка обновления личных смайликов:",
    error
  );

  process.exitCode = 1;
});
