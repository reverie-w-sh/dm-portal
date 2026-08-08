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
const PERSONAL_ITEMS_PATH = path.join(DATA_DIR, "personal-items.json");
const LAST_SYNC_PATH = path.join(DATA_DIR, "last-sync.json");
const EVENTS_PATH = path.join(DATA_DIR, "events.json");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const LAST_STATE_PATH = path.join(HISTORY_DIR, "last-state.json");

const WEDDING_EVENTS_FROM = Date.UTC(2026, 7, 1);
const MAX_MARRIAGE_EVENTS_PER_SYNC = 20;

function parseGameDate(value: string): number | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return time;
}

interface Player {
  cuid: string;
  nick: string;
  clanId?: string;
  clanName?: string;
  position?: string;
  profileUrl?: string;
  marriagePartner?: string;
  marriageSince?: string;
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

interface PersonalItem {
  id: string;
  name: string;
  owner: string;
  itemUrl?: string;
}

interface PersonalItemsData {
  items?: PersonalItem[];
}

interface LastSync {
  updatedAt: string;
}

interface SnapshotPlayer {
  cuid: string;
  nick: string;
  level?: number | null;
  reincarnationLevel?: number | null;
  clanId: string;
  clanName: string;
  position: string;
  profileUrl: string;
  marriageKnown: boolean;
  marriagePartner: string;
  marriageSince: string;
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

interface SnapshotPersonalItemsOwner {
  owner: string;
  itemIds: string[];
  itemNames: string[];
}

interface Snapshot {
  createdAt: string;
  players: SnapshotPlayer[];
  clans: SnapshotClan[];
  personalSmiles: SnapshotPersonalSmilesPlayer[];
  personalItems: SnapshotPersonalItemsOwner[];
}

type SiteEvent =
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_level_up";
      characterId: string;
      characterName: string;
      profileUrl: string;
      clanId: string;
      clanName: string;
      oldLevel: number;
      newLevel: number;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_reincarnation_level_up";
      characterId: string;
      characterName: string;
      profileUrl: string;
      clanId: string;
      clanName: string;
      oldLevel: number | null;
      newLevel: number;
    }
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
      type: "player_married";
      characterId: string;
      characterName: string;
      profileUrl: string;
      partnerName: string;
      marriageSince: string;
    }
  | {
      id: string;
      syncId: string;
      createdAt: string;
      scope: "clans";
      type: "player_divorced";
      characterId: string;
      characterName: string;
      profileUrl: string;
      partnerName: string;
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

function cleanOptionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  personalItems: PersonalItem[],
): Snapshot {
  return {
    createdAt,
    players: players
      .filter((player) => cleanString(player.cuid) !== "")
      .map((player) => ({
        cuid: cleanString(player.cuid),
        nick: cleanString(player.nick),
        level: cleanOptionalNumber(player.level),
        reincarnationLevel: cleanOptionalNumber(player.reincarnationLevel),
        clanId: cleanString(player.clanId),
        clanName: cleanString(player.clanName),
        position: cleanString(player.position),
        profileUrl: cleanString(player.profileUrl),
        marriageKnown: true,
        marriagePartner: cleanString(player.marriagePartner),
        marriageSince: cleanString(player.marriageSince),
      })),
    clans: clans
      .filter((clan) => cleanString(clan.clanId) !== "")
      .map((clan) => ({
        clanId: cleanString(clan.clanId),
        name: cleanString(clan.name),
        smilesCount: cleanNumber(clan.smilesCount),
      })),
    personalItems: Array.from(
      personalItems.reduce((map, item) => {
        const owner = cleanString(item.owner);
        const id = cleanString(item.id);
        if (!owner || !id) return map;
        const current = map.get(owner) ?? { owner, itemIds: [], itemNames: [] };
        current.itemIds.push(id);
        current.itemNames.push(cleanString(item.name));
        map.set(owner, current);
        return map;
      }, new Map<string, SnapshotPersonalItemsOwner>()).values(),
    ),
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
  const marriageEvents: SiteEvent[] = [];
  const marriageEventKeys = new Set<string>();

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

    const oldLevel = previousPlayer.level;
    const newLevel = currentPlayer.level;

    /*
     * В старых снимках level/reincarnationLevel отсутствуют. Поэтому
     * первое обновление после внедрения летописи только запоминает уровни,
     * а события начинаются со следующего реального изменения.
     */
    if (
      typeof oldLevel === "number" &&
      typeof newLevel === "number" &&
      newLevel > oldLevel
    ) {
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_level_up",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: newClanId,
        clanName: newClanId
          ? clanNameFrom(newClanId, currentPlayer.clanName, currentClans)
          : currentPlayer.clanName,
        oldLevel,
        newLevel,
      });
    }

    const oldReincarnationLevel = previousPlayer.reincarnationLevel;
    const newReincarnationLevel = currentPlayer.reincarnationLevel;

    if (
      oldReincarnationLevel !== undefined &&
      typeof newReincarnationLevel === "number" &&
      newReincarnationLevel > (oldReincarnationLevel ?? 0)
    ) {
      events.push({
        id: randomUUID(),
        syncId,
        createdAt: syncId,
        scope: "clans",
        type: "player_reincarnation_level_up",
        characterId: cuid,
        characterName,
        profileUrl,
        clanId: newClanId,
        clanName: newClanId
          ? clanNameFrom(newClanId, currentPlayer.clanName, currentClans)
          : currentPlayer.clanName,
        oldLevel: oldReincarnationLevel ?? null,
        newLevel: newReincarnationLevel,
      });
    }

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

    /*
     * Старые снимки не содержат marriageKnown. На первом запуске после
     * обновления только сохраняем семейный статус, не создавая ложные свадьбы.
     */
    if (previousPlayer.marriageKnown === true) {
      const oldPartner = previousPlayer.marriagePartner;
      const newPartner = currentPlayer.marriagePartner;

      if (oldPartner !== newPartner) {
        if (oldPartner) {
          const divorceKey = `divorce:${[characterName, oldPartner]
            .sort((a, b) => a.localeCompare(b, "ru"))
            .join("|")}`;

          if (!marriageEventKeys.has(divorceKey)) {
            marriageEventKeys.add(divorceKey);
            marriageEvents.push({
              id: randomUUID(),
              syncId,
              createdAt: syncId,
              scope: "clans",
              type: "player_divorced",
              characterId: cuid,
              characterName,
              profileUrl,
              partnerName: oldPartner,
            });
          }
        }

        if (newPartner) {
          const marriageDate = parseGameDate(currentPlayer.marriageSince);

          /*
           * В ленту кланов попадают только свадьбы, состоявшиеся
           * 01.08.2026 или позже. Более старые браки являются базовыми
           * данными страницы «Семейные пары», а не новыми событиями.
           */
          if (marriageDate !== null && marriageDate >= WEDDING_EVENTS_FROM) {
            const weddingKey = `wedding:${[characterName, newPartner]
              .sort((a, b) => a.localeCompare(b, "ru"))
              .join("|")}`;

            if (!marriageEventKeys.has(weddingKey)) {
              marriageEventKeys.add(weddingKey);
              marriageEvents.push({
                id: randomUUID(),
                syncId,
                createdAt: syncId,
                scope: "clans",
                type: "player_married",
                characterId: cuid,
                characterName,
                profileUrl,
                partnerName: newPartner,
                marriageSince: currentPlayer.marriageSince,
              });
            }
          }
        }
      }
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

  /*
   * Именные вещи не являются редким событием: персонажи могут
   * заколдовывать много старых вещей за день. Поэтому изменения
   * personal-items.json намеренно не попадают в ленту кланов.
   */

  if (marriageEvents.length > MAX_MARRIAGE_EVENTS_PER_SYNC) {
    console.warn(
      `⚠️ За одну синхронизацию найдено ${marriageEvents.length} свадеб/разводов. ` +
        "Семейные события пропущены как подозрительные.",
    );
  } else {
    events.push(...marriageEvents);
  }

  return events;
}

async function main(): Promise<void> {
  const [players, clans, personalSmiles, personalItemsData, lastSync] = await Promise.all([
    readJson<Player[]>(PLAYERS_PATH),
    readJson<Clan[]>(CLANS_PATH),
    readJsonOr<PersonalSmilesPlayer[]>(PERSONAL_SMILES_PATH, []),
    readJsonOr<PersonalItemsData>(PERSONAL_ITEMS_PATH, { items: [] }),
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
    Array.isArray(personalItemsData.items) ? personalItemsData.items : [],
  );

  const previousSnapshot = await readJsonOr<Snapshot | null>(
    LAST_STATE_PATH,
    null,
  );

  const storedEvents = await readJsonOr<SiteEvent[]>(
    EVENTS_PATH,
    [],
  );

  /*
   * Именные вещи никогда не сохраняем в ленте событий. Летопись хранит
   * корректные события без временного ограничения; конкретные страницы
   * сами выбирают нужный им период (например, кланы показывают до 90 дней).
   */
  const recentStoredEvents = storedEvents.filter((event) => {
    if ((event as { type: string }).type === "personal_item_added") return false;

    const time = new Date(event.createdAt).getTime();
    return Number.isFinite(time);
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

      return Number.isFinite(time);
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
  console.log(`Событий в летописи: ${allEvents.length}`);
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
