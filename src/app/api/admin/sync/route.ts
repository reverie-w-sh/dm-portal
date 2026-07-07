import { NextResponse } from "next/server";
import * as fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// На Vercel файловая система только для чтения и нет браузера для Playwright,
// поэтому сами скрипты синхронизации тут не выполняются (см. AGENTS.md).
// Вместо этого кнопка запускает тот же workflow на GitHub Actions через API,
// а этот роут просто триггерит запуск и опрашивает его статус.

const OWNER = "reverie-w-sh";
const REPO = "dm-portal";
const WORKFLOW_FILE = "sync-data.yml";

const CLANS_PATH   = path.join(process.cwd(), "data", "clans.json");
const PLAYERS_PATH = path.join(process.cwd(), "data", "players.json");

export interface SyncStatus {
  lastUpdatedAt:  string | null;
  lastResult:     "success" | "error" | "running" | null;
  durationMs:     number | null;
  clansCount:     number | null;
  playersCount:   number | null;
  positionsFound: number | null;
  emptyPositions: number | null;
  errorsCount:    number | null;
  lastOutputShort: string | null;
  runUrl: string | null;
}

interface Player {
  position?: string;
}

function readDataStats() {
  let clansCount: number | null = null;
  let playersCount: number | null = null;
  let positionsFound: number | null = null;
  let emptyPositions: number | null = null;

  try {
    const clans = JSON.parse(fs.readFileSync(CLANS_PATH, "utf-8"));
    clansCount = Array.isArray(clans) ? clans.length : null;
  } catch { /* оставляем null */ }

  try {
    const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));
    if (Array.isArray(players)) {
      playersCount = players.length;
      positionsFound = players.filter((p) => p.position).length;
      emptyPositions = playersCount - positionsFound;
    }
  } catch { /* оставляем null */ }

  return { clansCount, playersCount, positionsFound, emptyPositions };
}

async function fetchLatestRun(token?: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`,
    { headers, cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.workflow_runs?.[0] ?? null;
}

export async function GET() {
  const token = process.env.GH_DISPATCH_TOKEN;
  const stats = readDataStats();
  const run = await fetchLatestRun(token);

  if (!run) {
    return NextResponse.json({
      lastUpdatedAt: null, lastResult: null, durationMs: null,
      errorsCount: null, lastOutputShort: null, runUrl: null,
      ...stats,
    } satisfies SyncStatus);
  }

  const isRunning = run.status !== "completed";
  const lastResult: SyncStatus["lastResult"] = isRunning
    ? "running"
    : run.conclusion === "success" ? "success" : "error";

  const durationMs = !isRunning && run.run_started_at && run.updated_at
    ? new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()
    : null;

  return NextResponse.json({
    lastUpdatedAt: run.updated_at,
    lastResult,
    durationMs,
    errorsCount: lastResult === "error" ? 1 : 0,
    lastOutputShort: null,
    runUrl: run.html_url ?? null,
    ...stats,
  } satisfies SyncStatus);
}

export async function POST() {
  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Переменная GH_DISPATCH_TOKEN не настроена в Vercel" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    },
  );

  if (res.status !== 204) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, message: `Ошибка запуска GitHub Actions: ${res.status} ${text}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Синхронизация запущена на GitHub Actions. Обычно занимает 3–4 минуты.",
  });
}
