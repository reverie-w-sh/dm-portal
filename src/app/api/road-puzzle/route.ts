import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAnalyticsRedis } from "@/lib/analytics-redis";
import { dimensions, NEW_PUZZLES, type PuzzleDifficulty, type PuzzleScore } from "@/lib/road-puzzle-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREFIX = "wolfchen:road-puzzle:v1";
const scoreKey = (difficulty: PuzzleDifficulty) => `${PREFIX}:top:${difficulty}`;
const roundKey = (id: string) => `${PREFIX}:round:${id}`;
const claimKey = (id: string) => `${PREFIX}:claim:${id}`;
const validDifficulty = (value: unknown): value is PuzzleDifficulty => value === "5x7" || value === "7x10";
const validId = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9-]{36}$/.test(value);

type StoredRound = { difficulty: PuzzleDifficulty; imageIndex: number; tiles: number[]; startedAt: number };
type PendingClaim = { difficulty: PuzzleDifficulty; imageIndex: number; elapsedMs: number };

function shuffle(size: number): number[] {
  const items = Array.from({ length: size }, (_, index) => index);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  if (items.every((item, index) => item === index)) [items[0], items[1]] = [items[1], items[0]];
  return items;
}

function sorted(scores: PuzzleScore[]): PuzzleScore[] {
  return scores.filter((score) => score && typeof score.nick === "string" && Number.isFinite(score.elapsedMs))
    .sort((a, b) => a.elapsedMs - b.elapsedMs).slice(0, 10);
}

export async function GET() {
  const redis = getAnalyticsRedis();
  if (!redis) return NextResponse.json({ message: "Таблица результатов пока недоступна" }, { status: 503 });
  const [easy, hard] = await Promise.all([
    redis.get<PuzzleScore[]>(scoreKey("5x7")),
    redis.get<PuzzleScore[]>(scoreKey("7x10")),
  ]);
  return NextResponse.json({ scores: { "5x7": sorted(easy ?? []), "7x10": sorted(hard ?? []) } });
}

export async function POST(request: Request) {
  const redis = getAnalyticsRedis();
  if (!redis) return NextResponse.json({ message: "Таблица результатов пока недоступна" }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 60000) throw Error("too large");
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Error("invalid body");
  } catch {
    return NextResponse.json({ message: "Неверный запрос" }, { status: 400 });
  }

  if (body.action === "start" && validDifficulty(body.difficulty)) {
    const difficulty = body.difficulty;
    const { cols, rows } = dimensions(difficulty);
    const id = randomUUID();
    const round: StoredRound = {
      difficulty, imageIndex: Math.floor(Math.random() * NEW_PUZZLES.length),
      tiles: shuffle(cols * rows), startedAt: Date.now(),
    };
    await redis.set(roundKey(id), round, { ex: 7 * 24 * 60 * 60 });
    return NextResponse.json({ id, ...round });
  }

  if (body.action === "finish" && validId(body.id) && Array.isArray(body.moves)) {
    const round = await redis.get<StoredRound>(roundKey(body.id));
    if (!round) return NextResponse.json({ message: "Эта партия уже закончилась. Начни новую." }, { status: 400 });
    const { cols, rows } = dimensions(round.difficulty);
    const size = cols * rows;
    if (body.moves.length > 5000 || !Array.isArray(round.tiles) || round.tiles.length !== size) {
      return NextResponse.json({ message: "Неверные ходы" }, { status: 400 });
    }
    const replay = [...round.tiles];
    for (const move of body.moves) {
      if (!Array.isArray(move) || move.length !== 2 || !move.every((index) => Number.isInteger(index) && index >= 0 && index < size)) {
        return NextResponse.json({ message: "Неверные ходы" }, { status: 400 });
      }
      [replay[move[0]], replay[move[1]]] = [replay[move[1]], replay[move[0]]];
    }
    if (!replay.every((tile, index) => tile === index)) {
      return NextResponse.json({ message: "Пазл ещё не собран" }, { status: 400 });
    }
    const elapsedMs = Math.max(1000, Date.now() - round.startedAt);
    await redis.del(roundKey(body.id));
    const scores = sorted((await redis.get<PuzzleScore[]>(scoreKey(round.difficulty))) ?? []);
    const qualifies = scores.length < 10 || elapsedMs < scores[scores.length - 1].elapsedMs;
    const claimId = qualifies ? randomUUID() : null;
    if (claimId) {
      const pending: PendingClaim = { difficulty: round.difficulty, imageIndex: round.imageIndex, elapsedMs };
      await redis.set(claimKey(claimId), pending, { ex: 10 * 60 });
    }
    return NextResponse.json({ elapsedMs, qualifies, claimId, scores });
  }

  if (body.action === "claim" && validId(body.claimId) && typeof body.nick === "string") {
    const nick = body.nick.trim().replace(/[\u0000-\u001f\u007f<>]/g, "");
    if (nick.length < 2 || nick.length > 24) return NextResponse.json({ message: "Ник должен содержать от 2 до 24 символов" }, { status: 400 });
    const pending = await redis.get<PendingClaim>(claimKey(body.claimId));
    if (!pending) return NextResponse.json({ message: "Время для записи результата истекло" }, { status: 400 });
    const current = sorted((await redis.get<PuzzleScore[]>(scoreKey(pending.difficulty))) ?? []);
    if (current.length >= 10 && pending.elapsedMs >= current[current.length - 1].elapsedMs) {
      return NextResponse.json({ message: "Топ уже обновился. Попробуй ещё раз!", scores: current }, { status: 409 });
    }
    const score: PuzzleScore = { id: randomUUID(), nick, elapsedMs: pending.elapsedMs, imageIndex: pending.imageIndex };
    const next = sorted([...current, score]);
    await redis.set(scoreKey(pending.difficulty), next);
    await redis.del(claimKey(body.claimId));
    return NextResponse.json({ scores: next });
  }

  return NextResponse.json({ message: "Неверный запрос" }, { status: 400 });
}
