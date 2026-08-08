import { NextRequest, NextResponse } from "next/server";
import { GIFTS } from "@/data/gifts";
import { getAnalyticsRedis } from "@/lib/analytics-redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEMES_INDEX = "wolfchen:gift-board:schemes";
const SCHEME_PREFIX = "wolfchen:gift-board:scheme";
const LIKES_PREFIX = "wolfchen:gift-board:likes";
const MAX_VISIBLE_SCHEMES = 40;
const MAX_OWN_SCHEMES = 200;

type Cell = string | null;

type StoredScheme = {
  id: string;
  nick: string;
  title: string;
  columns: number;
  rows: number;
  cells: Cell[];
  createdAt: string;
};

function schemeKey(id: string) {
  return `${SCHEME_PREFIX}:${id}`;
}

function likesKey(id: string) {
  return `${LIKES_PREFIX}:${id}`;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isDimension(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function isSchemeId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

export async function GET(request: NextRequest) {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json(
      { configured: false, schemes: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const sort = request.nextUrl.searchParams.get("sort") === "popular" ? "popular" : "new";
    const nickFilter = cleanText(request.nextUrl.searchParams.get("nick"), 30).toLocaleLowerCase("ru-RU");
    const limit = nickFilter ? MAX_OWN_SCHEMES : MAX_VISIBLE_SCHEMES;
    const ids = await redis.zrange<string[]>(SCHEMES_INDEX, 0, limit - 1, { rev: true });

    if (!ids.length) {
      return NextResponse.json(
        { configured: true, schemes: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const [stored, likes] = await Promise.all([
      redis.mget<Array<StoredScheme | null>>(...ids.map(schemeKey)),
      redis.mget<Array<number | null>>(...ids.map(likesKey)),
    ]);

    const schemes = ids
      .map((id, index) => {
        const scheme = stored[index];
        if (!scheme) return null;
        return { ...scheme, likes: Number(likes[index] ?? 0) };
      })
      .filter((scheme): scheme is StoredScheme & { likes: number } => Boolean(scheme))
      .filter(
        (scheme) =>
          !nickFilter || scheme.nick.trim().toLocaleLowerCase("ru-RU") === nickFilter,
      );

    if (sort === "popular") {
      schemes.sort(
        (a, b) => b.likes - a.likes || Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    }

    return NextResponse.json(
      { configured: true, schemes },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Не удалось загрузить схемы подарков:", error);
    return NextResponse.json(
      { configured: true, schemes: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: NextRequest) {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректные данные" }, { status: 400 });
  }

  const nick = cleanText(body.nick, 30);
  const title = cleanText(body.title, 60);
  const columns = body.columns;
  const rows = body.rows;
  const rawCells = body.cells;

  if (nick.length < 2 || !title) {
    return NextResponse.json({ ok: false, error: "Укажи ник и название схемы" }, { status: 400 });
  }

  if (
    !isDimension(columns, 8, 16) ||
    !isDimension(rows, 5, 20) ||
    !Array.isArray(rawCells) ||
    rawCells.length !== columns * rows
  ) {
    return NextResponse.json({ ok: false, error: "Некорректный размер схемы" }, { status: 400 });
  }

  const allowedGifts = new Set(GIFTS.filter((gift) => !gift.personal).map((gift) => gift.file));
  if (
    rawCells.some(
      (cell) => cell !== null && (typeof cell !== "string" || !allowedGifts.has(cell)),
    )
  ) {
    return NextResponse.json({ ok: false, error: "В схеме есть неизвестный подарок" }, { status: 400 });
  }

  if (!rawCells.some((cell) => typeof cell === "string")) {
    return NextResponse.json({ ok: false, error: "Пустую схему сохранять незачем :)" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const scheme: StoredScheme = {
    id,
    nick,
    title,
    columns,
    rows,
    cells: rawCells as Cell[],
    createdAt,
  };

  try {
    const pipeline = redis.pipeline();
    pipeline.set(schemeKey(id), scheme);
    pipeline.set(likesKey(id), 0);
    pipeline.zadd(SCHEMES_INDEX, { score: Date.now(), member: id });
    await pipeline.exec();

    return NextResponse.json({ ok: true, scheme: { ...scheme, likes: 0 } });
  } catch (error) {
    console.error("Не удалось сохранить схему подарков:", error);
    return NextResponse.json({ ok: false, error: "Не получилось сохранить схему" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json({ ok: false, configured: false }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSchemeId(body.id)) {
    return NextResponse.json({ ok: false, error: "Некорректная схема" }, { status: 400 });
  }

  const id = body.id;
  const exists = await redis.exists(schemeKey(id));
  if (!exists) {
    return NextResponse.json({ ok: false, error: "Схема не найдена" }, { status: 404 });
  }

  const likes = await redis.incr(likesKey(id));
  return NextResponse.json({ ok: true, likes });
}
