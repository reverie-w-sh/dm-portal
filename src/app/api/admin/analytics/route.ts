import { NextResponse } from "next/server";
import { ANALYTICS_PREFIX, getAnalyticsRedis } from "@/lib/analytics-redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 90_000;

type RecentVisit = {
  pathname: string;
  title: string;
  at: string;
  sessionId: string;
};

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function lastDays(count: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    result.push(dayKey(new Date(now.getTime() - i * 86_400_000)));
  }
  return result;
}

function sumMaps(maps: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const map of maps) {
    for (const [path, value] of Object.entries(map)) {
      result[path] = (result[path] ?? 0) + Number(value || 0);
    }
  }
  return result;
}

export async function GET() {
  const redis = getAnalyticsRedis();
  if (!redis) {
    return NextResponse.json({ configured: false });
  }

  const days = lastDays(30);
  const now = Date.now();
  const onlineKey = `${ANALYTICS_PREFIX}:online`;
  const onlinePagesKey = `${ANALYTICS_PREFIX}:online-pages`;
  const recentKey = `${ANALYTICS_PREFIX}:recent`;

  await redis.zremrangebyscore(onlineKey, 0, now - ONLINE_WINDOW_MS);

  const pipeline = redis.pipeline();
  pipeline.zrange<string[]>(onlineKey, 0, -1);
  pipeline.hgetall<Record<string, string>>(onlinePagesKey);
  pipeline.lrange<string[]>(recentKey, 0, 19);
  for (const day of days) {
    pipeline.hgetall<Record<string, number>>(`${ANALYTICS_PREFIX}:views:${day}`);
    pipeline.scard(`${ANALYTICS_PREFIX}:visitors:${day}`);
  }

  const raw = await pipeline.exec();
  const onlineSessions = (raw[0] ?? []) as string[];
  const onlinePageMap = (raw[1] ?? {}) as Record<string, string>;
  const recentRaw = (raw[2] ?? []) as string[];

  const dailyViews: Record<string, number>[] = [];
  const dailyVisitors: number[] = [];
  let offset = 3;
  for (let i = 0; i < days.length; i += 1) {
    dailyViews.push((raw[offset] ?? {}) as Record<string, number>);
    dailyVisitors.push(Number(raw[offset + 1] ?? 0));
    offset += 2;
  }

  const todayViews = sumMaps(dailyViews.slice(0, 1));
  const weekViews = sumMaps(dailyViews.slice(0, 7));
  const monthViews = sumMaps(dailyViews);

  const total = (map: Record<string, number>) =>
    Object.values(map).reduce((sum, value) => sum + Number(value || 0), 0);

  const topPages = Object.entries(monthViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([pathname, views]) => ({ pathname, views }));

  const onlinePages: Record<string, number> = {};
  for (const sessionId of onlineSessions) {
    const pathname = onlinePageMap[sessionId];
    if (pathname) onlinePages[pathname] = (onlinePages[pathname] ?? 0) + 1;
  }

  const recent: RecentVisit[] = recentRaw.flatMap((item) => {
    try {
      const parsed = JSON.parse(item) as RecentVisit;
      return parsed.pathname && parsed.at ? [parsed] : [];
    } catch {
      return [];
    }
  });

  const chart = days
    .slice(0, 14)
    .reverse()
    .map((day, index) => {
      const sourceIndex = 13 - index;
      return {
        day,
        views: total(dailyViews[sourceIndex] ?? {}),
        visitors: dailyVisitors[sourceIndex] ?? 0,
      };
    });

  return NextResponse.json({
    configured: true,
    generatedAt: new Date().toISOString(),
    online: {
      visitors: onlineSessions.length,
      pages: Object.entries(onlinePages)
        .sort((a, b) => b[1] - a[1])
        .map(([pathname, visitors]) => ({ pathname, visitors })),
    },
    periods: {
      today: { views: total(todayViews), visitors: dailyVisitors[0] ?? 0 },
      week: {
        views: total(weekViews),
        visitors: dailyVisitors.slice(0, 7).reduce((a, b) => a + b, 0),
      },
      month: {
        views: total(monthViews),
        visitors: dailyVisitors.reduce((a, b) => a + b, 0),
      },
    },
    topPages,
    recent,
    chart,
  });
}
