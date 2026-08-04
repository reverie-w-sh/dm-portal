import "server-only";

import { getAnalyticsRedis } from "@/lib/analytics-redis";
import { isNavHref, type NavHref } from "@/lib/navigation-links";

const NAV_NEW_KEY = "wolfchen:navigation-new";

export type NavigationNewItems = Partial<Record<NavHref, string>>;

export type NavigationNewState = {
  configured: boolean;
  items: NavigationNewItems;
};

function normalizeItems(value: unknown): NavigationNewItems {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const items: NavigationNewItems = {};

  for (const [href, version] of Object.entries(value)) {
    if (isNavHref(href) && typeof version === "string" && version) {
      items[href] = version;
    }
  }

  return items;
}

export async function getNavigationNewState(): Promise<NavigationNewState> {
  const redis = getAnalyticsRedis();

  if (!redis) {
    return { configured: false, items: {} };
  }

  const stored = await redis.get<unknown>(NAV_NEW_KEY);

  return {
    configured: true,
    items: normalizeItems(stored),
  };
}

export async function setNavigationNewItems(
  hrefs: NavHref[],
): Promise<NavigationNewState> {
  const redis = getAnalyticsRedis();

  if (!redis) {
    return { configured: false, items: {} };
  }

  const stored = normalizeItems(await redis.get<unknown>(NAV_NEW_KEY));
  const nextItems: NavigationNewItems = {};

  for (const href of new Set(hrefs)) {
    nextItems[href] = stored[href] ?? crypto.randomUUID();
  }

  await redis.set(NAV_NEW_KEY, nextItems);

  return {
    configured: true,
    items: nextItems,
  };
}
