/**
 * Строит историю событий, не изменяя существующие скрипты синхронизации.
 *
 * Запускать ПОСЛЕ scripts/write-sync-timestamp.ts, когда уже обновлены:
 *   - data/players.json
 *   - data/clans.json
 *   - data/personal-smiles.json
 *   - data/last-sync.json
 *
 * Первый запуск только создаёт базовый снимок и НЕ генерирует ложные события.
 * События старше 90 дней автоматически удаляются.
 *
 * Usage:
 *   npx tsx scripts/build-events.ts
 */

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve("data");
const PLAYERS_PATH = path.join(DATA_DIR, "players.json");
const CLANS_PATH = path.join(DATA_DIR, "clans.json");
const PERSONAL_SMILES_PATH = path.join(DATA_DIR, "personal-smiles.json");
const LAST_SYNC_PATH = path.join(DATA_DIR, "last-sync.json");
const EVENTS_PATH = path.join(DATA_DIR, "events.json");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const LAST_STATE_PATH = path.join(HISTORY_DIR, "last-state.json");

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface Player {
  cuid: string;
  nick: string;
  clanId?: string;
  clanName?: string;
  position?: string;
  profileUrl?: string;
  [key: string]: unknown;
}

interface Clan {
  clanId: string;
  name: string;
  smilesCount?: number;
  [key: string]: unknown;
}

interface PersonalSmilesPlayer {
  cuid: string;
  nick: string;
  profileUrl?: string;
  personalSmilesCount?: number;
  personalSmiles?: string[];
  [key: string]: unknown;
}

interface LastSync {
  updatedAt: string;
}

interface SnapshotPlayer {
  cuid: string;
  nick: string;
  clanId: string;
  clanName: string;
  position: string;
  profileUrl: string;
}

interface SnapshotClan {
  clanId: string;
  name: string;
  smilesCount: number;
}

interface SnapshotPersonalSmilesPlayer {
  cuid: string;
  nick: string;
  profileUrl: string;
  personalSmilesCount: number;
  personalSmiles: string[];
}

interface Snapshot {
  createdAt: string;
  players: SnapshotPlayer[];
  clans: SnapshotClan[];
  personalSmiles: SnapshotPersonalSmilesPlayer[];
}

type SiteEvent =
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_joined_clan";
      characterId: string;
      characterName: string;
      profileUrl: string;
      clanId: string;
      clanName: string;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_left_clan";
      characterId: string;
      characterName: string;
      profileUrl: string;
      clanId: string;
      clanName: string;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_position_changed";
      characterId: string;
      characterName: string;
      profileUrl: string;
      clanId: string;
      clanName: string;
      oldPosition: string;
      newPosition: string;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "clan_smile_added";
      clanId: string;
      clanName: string;
      amount: number;
      oldCount: number;
      newCount: number;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "personal-smiles";
      type: "personal_smile_added";
      characterId: string;
      characterName: string;
      profileUrl: string;
      amount: number;
      oldCount: number;
      newCount: number;
      addedSmiles: string[];
    };

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function readJsonOr<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return await readJson<T>(filePath);
  } catch {
    return fallback;
  }
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== "",
      ),
    ),
  );
}

function makeSnapshot(
  createdAt: string,
  players: Player[],
  clans: Clan[],
  personalSmiles: PersonalSmilesPlayer[],
): Snapshot {
  return {
    createdAt,
    players: players
      .filter((player) => cleanString(player.cuid) !== "")
      .map((player) => ({
        cuid: cleanString(player.cuid),
        nick: cleanString(player.nick),
        clanId: cleanString(player.clanId),
        clanName: cleanString(player.clanName),
        position: cleanString(player.position),
        profileUrl: cleanString(player.profileUrl),
      })),
    clans: clans
      .filter((clan) => cleanString(clan.clanId) !== "")
      .map((clan) => ({
        clanId: cleanString(clan.clanId),
        name: cleanString(clan.name),
        smilesCount: cleanNumber(clan.smilesCount),
      })),
    personalSmiles: personalSmiles
      .filter((player) => cleanString(player.cuid) !== "")
      .map((player) => {
        const smiles = uniqueStrings(player.personalSmiles);

        return {
          cuid: cleanString(player.cuid),
          nick: cleanString(player.nick),
          profileUrl: cleanString(player.profileUrl),
          personalSmilesCount:
            typeof player.personalSmilesCount === "number"
              ? player.personalSmilesCount
              : smiles.length,
          personalSmiles: smiles,
        };
      }),
  };
}

function clanNameFrom(
  clanId: string,
  preferredName: string,
  clansById: Map<string, SnapshotClan>,
): string {
  return preferredName || clansById.get(clanId)?.name || `Клан ${clanId}`;
}

function buildEvents(
  previous: Snapshot,
  current: Snapshot,
  syncId: string,
): SiteEvent[] {
  const events: SiteEvent[] = [];

  const previousPlayers = new Map(
    previous.players.map((player) => [player.cuid, player]),
  );
  const currentPlayers = new Map(
    current.players.map((player) => [player.cuid, player]),
  );

  const previousClans = new Map(
    previous.clans.map((clan) => [clan.clanId, clan]),
  );
  const currentClans = new Map(
    current.clans.map((clan) => [clan.clanId, clan]),
  );

  /*
   * Для вступлений, выходов, переходов и должностей сравниваем только тех,
   * кто был и в предыдущем, и в текущем снимке. Так новый найденный сканером
   * персонаж не будет ошибочно показан как вступивший в клан.
   */
  for (const [cuid, currentPlayer] of currentPlayers) {
    const previousPlayer = previousPlayers.get(cuid);
    if (!previousPlayer) continue;

    const oldClanId = previousPlayer.clanId;
    const newClanId = currentPlayer.clanId;

    const characterName =
      currentPlayer.nick || previousPlayer.nick || `Персонаж ${cuid}`;

    const profileUrl =
      currentPlayer.profileUrl || previousPlayer.profileUrl;

    if (!oldClanId && newClanId) {
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_joined_clan",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: newClanId,
        clanName: clanNameFrom(
          newClanId,
          currentPlayer.clanName,
          currentClans,
        ),
      });
    } else if (oldClanId && !newClanId) {
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_left_clan",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: oldClanId,
        clanName: clanNameFrom(
          oldClanId,
          previousPlayer.clanName,
          previousClans,
        ),
      });
    } else if (oldClanId && newClanId && oldClanId !== newClanId) {
      /*
       * Между двумя синхронизациями персонаж оказался в другом клане.
       * В игре нельзя перейти напрямую, поэтому создаём две реальные
       * операции: выход из старого клана и вступление в новый.
       */
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_left_clan",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: oldClanId,
        clanName: clanNameFrom(
          oldClanId,
          previousPlayer.clanName,
          previousClans,
        ),
      });

      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_joined_clan",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: newClanId,
        clanName: clanNameFrom(
          newClanId,
          currentPlayer.clanName,
          currentClans,
        ),
      });
    }

    const oldPosition = previousPlayer.position;
    const newPosition = currentPlayer.position;

    /*
     * Должность имеет смысл только внутри одного и того же клана.
     * При переходе в другой клан отдельное событие о должности не создаём.
     */
    if (
      oldClanId &&
      newClanId &&
      oldClanId === newClanId &&
      oldPosition !== newPosition
    ) {
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_position_changed",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: newClanId,
        clanName: clanNameFrom(
          newClanId,
          currentPlayer.clanName,
          currentClans,
        ),
        oldPosition,
        newPosition,
      });
    }
  }

  for (const [clanId, currentClan] of currentClans) {
    const previousClan = previousClans.get(clanId);
    if (!previousClan) continue;

    const amount =
      currentClan.smilesCount - previousClan.smilesCount;

    if (amount <= 0) continue;

    events.push({
      id: randomUUID(),
      syncId,
      createdAt: syncId,
      scope: "clans",
      type: "clan_smile_added",
      clanId,
      clanName: currentClan.name || previousClan.name,
      amount,
      oldCount: previousClan.smilesCount,
      newCount: currentClan.smilesCount,
    });
  }

  const previousPersonalSmiles = new Map(
    previous.personalSmiles.map((player) => [player.cuid, player]),
  );

  for (const currentPlayer of current.personalSmiles) {
    const previousPlayer = previousPersonalSmiles.get(currentPlayer.cuid);

    /*
     * Новый персонаж в personal-smiles.json может быть просто впервые найден.
     * Чтобы не создавать ложное событие, нужен предыдущий снимок этого игрока.
     */
    if (!previousPlayer) continue;

    const previousUrls = new Set(previousPlayer.personalSmiles);
    const addedSmiles = currentPlayer.personalSmiles.filter(
      (url) => !previousUrls.has(url),
    );

    const countDifference =
      currentPlayer.personalSmilesCount -
      previousPlayer.personalSmilesCount;

    const amount =
      addedSmiles.length > 0
        ? addedSmiles.length
        : Math.max(0, countDifference);

    if (amount <= 0) continue;

    events.push({
      id: randomUUID(),
      syncId,
      createdAt: syncId,
      scope: "personal-smiles",
      type: "personal_smile_added",
      characterId: currentPlayer.cuid,
      characterName:
        currentPlayer.nick ||
        previousPlayer.nick ||
        `Персонаж ${currentPlayer.cuid}`,
      profileUrl:
        currentPlayer.profileUrl || previousPlayer.profileUrl,
      amount,
      oldCount: previousPlayer.personalSmilesCount,
      newCount: currentPlayer.personalSmilesCount,
      addedSmiles,
    });
  }

  return events;
}

async function main(): Promise<void> {
  const [players, clans, personalSmiles, lastSync] = await Promise.all([
    readJson<Player[]>(PLAYERS_PATH),
    readJson<Clan[]>(CLANS_PATH),
    readJsonOr<PersonalSmilesPlayer[]>(PERSONAL_SMILES_PATH, []),
    readJson<LastSync>(LAST_SYNC_PATH),
  ]);

  if (!Array.isArray(players)) {
    throw new Error("data/players.json должен содержать массив");
  }

  if (!Array.isArray(clans)) {
    throw new Error("data/clans.json должен содержать массив");
  }

  if (!Array.isArray(personalSmiles)) {
    throw new Error("data/personal-smiles.json должен содержать массив");
  }

  const syncId = cleanString(lastSync.updatedAt);

  if (!syncId || Number.isNaN(new Date(syncId).getTime())) {
    throw new Error(
      "В data/last-sync.json отсутствует корректный updatedAt",
    );
  }

  await mkdir(HISTORY_DIR, { recursive: true });

  const currentSnapshot = makeSnapshot(
    syncId,
    players,
    clans,
    personalSmiles,
  );

  const previousSnapshot = await readJsonOr<Snapshot | null>(
    LAST_STATE_PATH,
    null,
  );

  const storedEvents = await readJsonOr<SiteEvent[]>(
    EVENTS_PATH,
    [],
  );

  const cutoff = Date.now() - NINETY_DAYS_MS;

  const recentStoredEvents = storedEvents.filter((event) => {
    const time = new Date(event.createdAt).getTime();

    return Number.isFinite(time) && time >= cutoff;
  });

  if (!previousSnapshot) {
    await Promise.all([
      writeFile(
        LAST_STATE_PATH,
        `${JSON.stringify(currentSnapshot, null, 2)}\n`,
        "utf8",
      ),
      writeFile(
        EVENTS_PATH,
        `${JSON.stringify(recentStoredEvents, null, 2)}\n`,
        "utf8",
      ),
    ]);

    console.log(
      "Первый запуск: создан базовый снимок, события не генерировались.",
    );
    return;
  }

  /*
   * Защита от повторного запуска в рамках той же синхронизации.
   */
  if (previousSnapshot.createdAt === syncId) {
    console.log(
      `Снимок для синхронизации ${syncId} уже создан. Новых событий нет.`,
    );
    return;
  }

  const newEvents = buildEvents(
    previousSnapshot,
    currentSnapshot,
    syncId,
  );

  const allEvents = [...newEvents, ...recentStoredEvents]
    .filter((event) => {
      const time = new Date(event.createdAt).getTime();

      return Number.isFinite(time) && time >= cutoff;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );

  await Promise.all([
    writeFile(
      EVENTS_PATH,
      `${JSON.stringify(allEvents, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      LAST_STATE_PATH,
      `${JSON.stringify(currentSnapshot, null, 2)}\n`,
      "utf8",
    ),
  ]);

  console.log(`Синхронизация: ${syncId}`);
  console.log(`Новых событий: ${newEvents.length}`);
  console.log(`Событий за последние 90 дней: ${allEvents.length}`);
  console.log(`Обновлён файл: ${EVENTS_PATH}`);
  console.log(`Обновлён снимок: ${LAST_STATE_PATH}`);
}

main().catch((error) => {
  console.error(
    "Ошибка построения истории событий:",
    error instanceof Error ? error.message : error,
  );

  process.exitCode = 1;
});
