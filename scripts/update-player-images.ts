/**
 * Mirrors the current character image of every player into public/.
 *
 * The game profile exposes only the currently selected image. When that
 * source changes, the new file becomes the main portrait and the previous
 * local files remain in characterImages as the player's portrait gallery.
 */

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

const PLAYERS_PATH = path.resolve("data/players.json");
const PUBLIC_DIR = path.resolve("public");
const IMAGE_DIR = path.resolve("public/images/players/characters");
const PUBLIC_PREFIX = "/images/players/characters/";
const DELAY_MS = 100;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const HERO_IMAGE_URL = "https://dm-game.com/layout/all/Hero_obraz/";
const HERO_CLIENT_URL = `${HERO_IMAGE_URL}client/`;
const SEEDED_GALLERIES: Record<string, string[]> = {
  "4394": [
    `${HERO_CLIENT_URL}4394-0.jpg`,
    ...Array.from(
      { length: 19 },
      (_, index) => `${HERO_CLIENT_URL}4394v${index + 1}-0.gif`,
    ),
  ],
  "2171": Array.from(
    { length: 3 },
    (_, index) => `${HERO_CLIENT_URL}2171v${index + 1}-0.gif`,
  ),
  "3358": [
    `${HERO_CLIENT_URL}3358v6-0.gif`,
    `${HERO_CLIENT_URL}3358v5-0.gif`,
    `${HERO_CLIENT_URL}3358v7-0.gif`,
  ],
};

let hasRequestedImage = false;

type Player = {
  cuid: string;
  nick: string;
  profileUrl?: string;
  characterImage?: string;
  characterImageSource?: string;
  characterImageCacheSource?: string;
  characterImages?: string[];
  characterImageArchive?: Array<{ sourceUrl: string; path: string }>;
  [key: string]: unknown;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeRemoteImage(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "dm-game.com") {
      return undefined;
    }

    const heroPath = "/layout/all/Hero_obraz/";
    if (url.pathname.startsWith(heroPath)) return url.toString();

    // Старые players.json содержали сокращённые адреса /client/... и
    // /ork-0-0.gif. На сайте игры эти файлы лежат внутри Hero_obraz/.
    return new URL(url.pathname.replace(/^\/+/, ""), HERO_IMAGE_URL).toString();
  } catch {
    return undefined;
  }
}

function isLocalImage(value?: string): value is string {
  return Boolean(value?.startsWith(PUBLIC_PREFIX));
}

function localFileExists(publicPath?: string): boolean {
  if (!isLocalImage(publicPath)) return false;
  const filePath = path.resolve(PUBLIC_DIR, publicPath.slice(1));
  return filePath.startsWith(`${IMAGE_DIR}${path.sep}`) && fs.existsSync(filePath);
}

function imageExtension(sourceUrl: string, contentType: string): string {
  const urlExtension = path.extname(new URL(sourceUrl).pathname).toLocaleLowerCase("en-US");
  if ([".gif", ".png", ".webp", ".jpg", ".jpeg"].includes(urlExtension)) {
    return urlExtension === ".jpeg" ? ".jpg" : urlExtension;
  }

  const normalizedType = contentType.split(";", 1)[0].trim().toLocaleLowerCase("en-US");
  const byType: Record<string, string> = {
    "image/gif": ".gif",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
  };

  return byType[normalizedType] ?? ".img";
}

function galleryWithCurrent(player: Player, current: string): string[] {
  return Array.from(
    new Set([
      current,
      ...(player.characterImageArchive ?? []).toReversed().map((item) => item.path),
      ...(player.characterImages ?? []),
      ...(isLocalImage(player.characterImage) ? [player.characterImage] : []),
    ]),
  ).filter(localFileExists);
}

async function downloadImage(
  player: Player,
  sourceUrl: string,
): Promise<{ path: string; created: boolean }> {
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DM-Portal-Scanner/1.0)",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: player.profileUrl ?? `https://dm-game.com/index.php?file=infouser&cuid=${player.cuid}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLocaleLowerCase("en-US").startsWith("image/")) {
    throw new Error(`ожидалось изображение, получено ${contentType || "без типа"}`);
  }

  const image = Buffer.from(await response.arrayBuffer());
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) {
    throw new Error(`некорректный размер ${image.length} байт`);
  }

  const hash = createHash("sha256").update(image).digest("hex").slice(0, 20);
  const extension = imageExtension(sourceUrl, contentType);
  const fileName = `${hash}${extension}`;
  const filePath = path.join(IMAGE_DIR, fileName);
  const publicPath = `${PUBLIC_PREFIX}${fileName}`;
  const existed = fs.existsSync(filePath);

  if (!existed) {
    fs.writeFileSync(filePath, image);
  }

  return { path: publicPath, created: !existed };
}

function archivedPath(player: Player, sourceUrl: string): string | undefined {
  return player.characterImageArchive?.find(
    (item) => item.sourceUrl === sourceUrl && localFileExists(item.path),
  )?.path;
}

function rememberImage(player: Player, sourceUrl: string, publicPath: string): void {
  const archive = (player.characterImageArchive ?? []).filter(
    (item) => item.sourceUrl !== sourceUrl,
  );
  archive.push({ sourceUrl, path: publicPath });
  player.characterImageArchive = archive;
}

async function cacheSource(
  player: Player,
  sourceUrl: string,
): Promise<{ path: string; created: boolean }> {
  const knownPath = archivedPath(player, sourceUrl);
  if (knownPath) return { path: knownPath, created: false };

  if (hasRequestedImage) await sleep(DELAY_MS);
  hasRequestedImage = true;
  const downloaded = await downloadImage(player, sourceUrl);
  rememberImage(player, sourceUrl, downloaded.path);
  return downloaded;
}

async function cacheSeededImages(
  player: Player,
): Promise<{ downloaded: number; reused: number }> {
  let downloaded = 0;
  let reused = 0;

  for (const sourceUrl of SEEDED_GALLERIES[player.cuid] ?? []) {
    try {
      const result = await cacheSource(player, sourceUrl);
      if (result.created) downloaded += 1;
      else reused += 1;
    } catch (error) {
      console.warn(
        `FAIL gallery cuid=${player.cuid}: ${sourceUrl} — ${
          error instanceof Error ? error.message : "неизвестная ошибка"
        }`,
      );
    }
  }

  return { downloaded, reused };
}

async function mirrorPlayerImage(
  player: Player,
): Promise<{
  state: "downloaded" | "reused" | "unchanged" | "skipped";
  galleryDownloaded: number;
  galleryReused: number;
}> {
  const sourceUrl =
    normalizeRemoteImage(player.characterImageSource) ??
    normalizeRemoteImage(player.characterImage);

  if (!sourceUrl) {
    return { state: "skipped", galleryDownloaded: 0, galleryReused: 0 };
  }

  let state: "downloaded" | "reused" | "unchanged" = "unchanged";
  let currentPath = player.characterImage;

  if (
    player.characterImageCacheSource !== sourceUrl ||
    !localFileExists(currentPath)
  ) {
    const current = await cacheSource(player, sourceUrl);
    currentPath = current.path;
    state = current.created ? "downloaded" : "reused";
  }

  if (!currentPath || !isLocalImage(currentPath)) {
    throw new Error("не удалось определить локальный текущий образ");
  }

  player.characterImage = currentPath;
  player.characterImageSource = sourceUrl;
  player.characterImageCacheSource = sourceUrl;

  const gallery = await cacheSeededImages(player);

  player.characterImages = galleryWithCurrent(player, currentPath);

  return {
    state,
    galleryDownloaded: gallery.downloaded,
    galleryReused: gallery.reused,
  };
}

async function main(): Promise<void> {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf8")) as Player[];
  fs.mkdirSync(IMAGE_DIR, { recursive: true });

  let downloaded = 0;
  let reused = 0;
  let unchanged = 0;
  let skipped = 0;
  let failed = 0;
  let galleryDownloaded = 0;
  let galleryReused = 0;

  for (const player of players) {
    try {
      const result = await mirrorPlayerImage(player);
      galleryDownloaded += result.galleryDownloaded;
      galleryReused += result.galleryReused;

      if (result.state === "downloaded") downloaded += 1;
      else if (result.state === "reused") reused += 1;
      else if (result.state === "unchanged") unchanged += 1;
      else skipped += 1;
    } catch (error) {
      failed += 1;
      console.warn(
        `FAIL cuid=${player.cuid} (${player.nick}): ${
          error instanceof Error ? error.message : "неизвестная ошибка"
        }`,
      );
    }
  }

  fs.writeFileSync(PLAYERS_PATH, `${JSON.stringify(players, null, 2)}\n`, "utf8");

  console.log("\n─── Character images ─────────────────────────────────────────");
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Reused by content: ${reused}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  Historical images downloaded: ${galleryDownloaded}`);
  console.log(`  Historical images already cached: ${galleryReused}`);
  console.log(`  Without image: ${skipped}`);
  console.log(`  Failed (old image preserved): ${failed}`);
  console.log("──────────────────────────────────────────────────────────────");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
