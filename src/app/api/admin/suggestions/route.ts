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

function parseSuggestion(item: unknown): StoredSuggestion | null {
  try {
    const value =
      typeof item === "string"
        ? (JSON.parse(item) as StoredSuggestion)
        : (item as StoredSuggestion);

    if (
      !value ||
      typeof value !== "object" ||
      typeof value.id !== "string" ||
      typeof value.text !== "string" ||
      typeof value.createdAt !== "string"
    ) {
      return null;
    }

    return {
      id: value.id,
      text: value.text,
      page: typeof value.page === "string" ? value.page : "/",
      createdAt: value.createdAt,
    };
  } catch {
    return null;
  }
}

function parseSuggestions(items: unknown[]): StoredSuggestion[] {
  return items.flatMap((item) => {
    const suggestion = parseSuggestion(item);
    return suggestion ? [suggestion] : [];
  });
}

export async function GET() {
  const redis = getAnalyticsRedis();

  if (!redis) {
    return NextResponse.json(
      {
        suggestions: [],
        message: "Хранилище предложений не подключено",
      },
      { status: 503 },
    );
  }

  try {
/*
 * Upstash может автоматически превратить сохранённую JSON-строку
 * обратно в объект. Поэтому здесь специально используем unknown,
 * а parseSuggestion умеет работать с обоими вариантами.
 */
const raw = await redis.lrange<unknown>(SUGGESTIONS_KEY, 0, 199);

return NextResponse.json({
  configured: true,
  suggestions: parseSuggestions(raw),
});

} catch (error) {
  console.error("Не удалось загрузить предложения:", error);

  return NextResponse.json(
    {
      configured: true,
      suggestions: [],
      message: "Не удалось загрузить предложения",
    },
    { status: 500 },
  );
}

export async function DELETE(request: Request) {
  const redis = getAnalyticsRedis();

  if (!redis) {
    return NextResponse.json(
      { message: "Хранилище предложений не подключено" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Неверный запрос" },
      { status: 400 },
    );
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json(
      { message: "Не указан ID предложения" },
      { status: 400 },
    );
  }

  try {
    const raw = await redis.lrange<unknown>(SUGGESTIONS_KEY, 0, 199);

    const found = raw.find((item) => {
      const suggestion = parseSuggestion(item);
      return suggestion?.id === id;
    });

    if (found === undefined) {
      return NextResponse.json(
        { message: "Предложение уже удалено или не найдено" },
        { status: 404 },
      );
    }

    /*
     * В Redis запись хранится как JSON-строка.
     * Но Upstash при чтении может вернуть уже готовый объект.
     * Для LREM поэтому превращаем объект обратно в ту же JSON-строку.
     */
    const redisValue =
      typeof found === "string"
        ? found
        : JSON.stringify(found);

    await redis.lrem(SUGGESTIONS_KEY, 1, redisValue);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Не удалось удалить предложение:", error);

    return NextResponse.json(
      { message: "Не удалось удалить предложение" },
      { status: 500 },
    );
  }
}
