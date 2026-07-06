import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const execAsync = promisify(exec);
const STATUS_PATH = path.join(process.cwd(), "data", "sync-status.json");
const CLANS_PATH  = path.join(process.cwd(), "data", "clans.json");

export interface SyncStatus {
  lastUpdatedAt:  string | null;
  lastResult:     "success" | "error" | null;
  durationMs:     number | null;
  clansCount:     number | null;
  playersCount:   number | null;
  positionsFound: number | null;
  emptyPositions: number | null;
  errorsCount:    number | null;
  lastOutputShort: string | null;
}

function readStatus(): SyncStatus {
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, "utf-8"));
  } catch {
    return {
      lastUpdatedAt: null, lastResult: null, durationMs: null,
      clansCount: null, playersCount: null, positionsFound: null,
      emptyPositions: null, errorsCount: null, lastOutputShort: null,
    };
  }
}

function writeStatus(data: SyncStatus): void {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function extractNumber(output: string, label: string): number | null {
  const m = new RegExp(`${label}\\s+(\\d+)`).exec(output);
  return m ? parseInt(m[1], 10) : null;
}

function parseProfileSummary(output: string) {
  return {
    playersCount:   extractNumber(output, "Total in file:"),
    positionsFound: extractNumber(output, "Positions found:"),
    emptyPositions: extractNumber(output, "Empty positions:"),
    errorsCount:    extractNumber(output, "Errors:"),
  };
}

function countClans(): number | null {
  try {
    const clans = JSON.parse(fs.readFileSync(CLANS_PATH, "utf-8"));
    return Array.isArray(clans) ? clans.length : null;
  } catch {
    return null;
  }
}

export async function GET() {
  return NextResponse.json(readStatus());
}

export async function POST() {
  const cwd = process.cwd();
  let allOutput = "";
  const startTime = Date.now();

  try {
    // ── Шаг 1: Сканирование рейтинга ──────────────────────────────────
    const { stdout: o1, stderr: e1 } = await execAsync(
      "npx tsx scripts/scan-ratings.ts",
      { cwd, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );
    allOutput += `=== Шаг 1: Сканирование рейтинга ===\n${o1}${e1}\n`;

    // ── Шаг 2: Импорт состава ─────────────────────────────────────────
    const { stdout: o2, stderr: e2 } = await execAsync(
      "npx tsx scripts/import-rating-scan.ts data/rating-scan.md",
      { cwd, timeout: 60_000, maxBuffer: 10 * 1024 * 1024 },
    );
    allOutput += `=== Шаг 2: Импорт состава ===\n${o2}${e2}\n`;

    // ── Шаг 3: Обновление профилей ────────────────────────────────────
    const { stdout: o3, stderr: e3 } = await execAsync(
      "npx tsx scripts/update-players-from-profiles.ts",
      { cwd, timeout: 600_000, maxBuffer: 10 * 1024 * 1024 },
    );
    const profileOutput = o3 + e3;
    allOutput += `=== Шаг 3: Обновление профилей ===\n${profileOutput}`;

    const durationMs  = Date.now() - startTime;
    const updatedAt   = new Date().toISOString();
    const clansCount  = countClans();
    const parsed      = parseProfileSummary(profileOutput);

    const status: SyncStatus = {
      lastUpdatedAt:  updatedAt,
      lastResult:     "success",
      durationMs,
      clansCount,
      playersCount:   parsed.playersCount,
      positionsFound: parsed.positionsFound,
      emptyPositions: parsed.emptyPositions,
      errorsCount:    parsed.errorsCount,
      lastOutputShort: allOutput.slice(-2000),
    };
    writeStatus(status);

    return NextResponse.json({ ok: true, message: "Данные успешно обновлены", output: allOutput, ...status });
  } catch (err) {
    const e = err as Error & { stdout?: string; stderr?: string };
    allOutput += (e.stdout ?? "") + (e.stderr ?? "") + "\nОшибка: " + e.message;

    const durationMs = Date.now() - startTime;
    const updatedAt  = new Date().toISOString();

    const status: SyncStatus = {
      lastUpdatedAt:  updatedAt,
      lastResult:     "error",
      durationMs,
      clansCount:     countClans(),
      playersCount:   null,
      positionsFound: null,
      emptyPositions: null,
      errorsCount:    null,
      lastOutputShort: allOutput.slice(-2000),
    };
    try { writeStatus(status); } catch { /* ignore */ }

    return NextResponse.json(
      { ok: false, message: "Ошибка обновления", output: allOutput, ...status },
      { status: 500 },
    );
  }
}
