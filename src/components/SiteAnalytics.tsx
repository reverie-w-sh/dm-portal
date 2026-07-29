"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 30_000;

function shouldIgnore(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/");
}

function getSessionId(): string {
  const key = "wolfchen-analytics-session";
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

async function sendActivity(pathname: string, kind: "view" | "heartbeat") {
  if (shouldIgnore(pathname)) return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId: getSessionId(),
        pathname,
        kind,
        title: document.title,
      }),
    });
  } catch {
    // Аналитика не должна мешать работе сайта.
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || shouldIgnore(pathname)) return;

    if (lastTrackedPath.current !== pathname) {
      lastTrackedPath.current = pathname;
      void sendActivity(pathname, "view");
    }

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sendActivity(pathname, "heartbeat");
      }
    }, HEARTBEAT_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void sendActivity(pathname, "heartbeat");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (shouldIgnore(url.pathname)) return null;
        return event;
      }}
    />
  );
}
