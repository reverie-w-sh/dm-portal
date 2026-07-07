/**
 * Записывает время последнего успешного запуска синхронизации в
 * data/last-sync.json. Вызывается из GitHub Actions последним шагом,
 * после того как все данные (clans.json, players.json) уже обновлены.
 *
 * Usage:
 *   npx tsx scripts/write-sync-timestamp.ts
 */

import * as fs from "node:fs";
import path from "node:path";

const OUT_PATH = path.resolve("data/last-sync.json");

function main(): void {
  const payload = { updatedAt: new Date().toISOString() };
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  console.log("Wrote", OUT_PATH, payload.updatedAt);
}

main();
