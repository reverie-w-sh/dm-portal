import { NextResponse } from "next/server";
import { getAnalyticsRedis } from "@/lib/analytics-redis";
import { SUGGESTIONS_KEY } from "@/lib/suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredSuggestion = {
  id: string;
  text: string;
  page: string;
  createdAt: string;
};

function parseSuggestions(items: string[]): StoredSuggestion[] {
  return items.flatMap((item) => {
    try {
      const value = JSON.parse(item) as StoredSuggestion;
      return value.id && value.text && value.createdAt ? [value] : [];
    } catch {
      return [];
    }
  });
}

export async function GET() {
  const redis = getAnalyticsRedis();
  if (!redis) return NextResponse.json({ configured: false, suggestions: [] });

  const raw = await redis.lrange<string>(SUGGESTIONS_KEY, 0, 199);
  return NextResponse.json({
    configured: true,
    suggestions: parseSuggestions(raw),
  });
}

export async function DELETE(request: Request) {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json(
      { message: "Upstash Redis не подключён" },
      { status: 503 },
    );
  }

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Неверный запрос" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ message: "Не указан ID" }, { status: 400 });

  const raw = await redis.lrange<string>(SUGGESTIONS_KEY, 0, 199);
  const stored = raw.find((item) => {
    try {
      return (JSON.parse(item) as StoredSuggestion).id === id;
    } catch {
      return false;
    }
  });

  if (!stored) {
    return NextResponse.json({ message: "Предложение не найдено" }, { status: 404 });
  }

  await redis.lrem(SUGGESTIONS_KEY, 1, stored);
  return NextResponse.json({ ok: true });
}
