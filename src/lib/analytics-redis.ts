import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;

export function getAnalyticsRedis(): Redis | null {
  if (redisInstance) return redisInstance;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  redisInstance = new Redis({ url, token });
  return redisInstance;
}

export const ANALYTICS_PREFIX = "wolfchen:analytics";
