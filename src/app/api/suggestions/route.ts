import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAnalyticsRedis } from "@/lib/analytics-redis";
import { SUGGESTIONS_KEY } from "@/lib/suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SUGGESTIONS = 200;
const MAX_PER_HOUR = 5;

function cleanPage(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  return value.split("?")[0].slice(0, 180);
}

function visitorHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const source = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(source).digest("hex").slice(0, 24);
}

export async function POST(request: Request) {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json(
      { message: "Сохранение предложений пока не подключено" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Неверный запрос" }, { status: 400 });
  }

  // Невидимое поле заполняют только простые спам-боты.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 3 || text.length > 1000) {
    return NextResponse.json(
      { message: "Предложение должно содержать от 3 до 1000 символов" },
      { status: 400 },
    );
  }

  const rateKey = `wolfchen:suggestions:rate:${visitorHash(request)}`;
  const sent = await redis.incr(rateKey);
  if (sent === 1) await redis.expire(rateKey, 60 * 60);
  if (sent > MAX_PER_HOUR) {
    return NextResponse.json(
      { message: "Слишком много сообщений. Попробуй немного позже." },
      { status: 429 },
    );
  }

  const suggestion = JSON.stringify({
    id: randomUUID(),
    text,
    page: cleanPage(body.page),
    createdAt: new Date().toISOString(),
  });

  const pipeline = redis.pipeline();
  pipeline.lpush(SUGGESTIONS_KEY, suggestion);
  pipeline.ltrim(SUGGESTIONS_KEY, 0, MAX_SUGGESTIONS - 1);
  await pipeline.exec();

  return NextResponse.json({ ok: true });
}
