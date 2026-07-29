import { NextResponse } from "next/server";
import { ANALYTICS_PREFIX, getAnalyticsRedis } from "@/lib/analytics-redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 90_000;
const RETENTION_SECONDS = 60 * 60 * 24 * 35;
const MAX_RECENT = 100;

function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0].slice(0, 180);
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api/")) {
    return null;
  }
  return path;
}

function cleanSession(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[a-f0-9-]{20,64}$/i.test(value) ? value : null;
}

function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function POST(request: Request) {
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

  const pathname = cleanPath(body.pathname);
  const sessionId = cleanSession(body.sessionId);
  const kind = body.kind === "heartbeat" ? "heartbeat" : "view";
  const title = typeof body.title === "string" ? body.title.slice(0, 120) : "";

  if (!pathname || !sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  const day = dayKey();
  const onlineKey = `${ANALYTICS_PREFIX}:online`;
  const onlinePagesKey = `${ANALYTICS_PREFIX}:online-pages`;
  const dailyViewsKey = `${ANALYTICS_PREFIX}:views:${day}`;
  const dailyVisitorsKey = `${ANALYTICS_PREFIX}:visitors:${day}`;
  const recentKey = `${ANALYTICS_PREFIX}:recent`;

  const pipeline = redis.pipeline();
  pipeline.zadd(onlineKey, { score: now, member: sessionId });
  pipeline.hset(onlinePagesKey, { [sessionId]: pathname });
  pipeline.expire(onlineKey, RETENTION_SECONDS);
  pipeline.expire(onlinePagesKey, RETENTION_SECONDS);
  pipeline.zremrangebyscore(onlineKey, 0, now - ONLINE_WINDOW_MS);

  if (kind === "view") {
    pipeline.hincrby(dailyViewsKey, pathname, 1);
    pipeline.sadd(dailyVisitorsKey, sessionId);
    pipeline.expire(dailyViewsKey, RETENTION_SECONDS);
    pipeline.expire(dailyVisitorsKey, RETENTION_SECONDS);
    pipeline.lpush(
      recentKey,
      JSON.stringify({ pathname, title, at: new Date(now).toISOString(), sessionId })
    );
    pipeline.ltrim(recentKey, 0, MAX_RECENT - 1);
    pipeline.expire(recentKey, RETENTION_SECONDS);
  }

  await pipeline.exec();
  return NextResponse.json({ ok: true });
}
