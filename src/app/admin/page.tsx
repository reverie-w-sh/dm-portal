"use client";

import { useState, useEffect, useRef } from "react";
import type { SyncStatus } from "../api/admin/sync/route";
import {
  NAV_LINKS,
  NAV_NEW_UPDATED_EVENT,
  type NavHref,
} from "@/lib/navigation-links";

type SyncState = "idle" | "running" | "success" | "error";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} сек`;
  return `${min} мин ${sec} сек`;
}

const STATE_LABEL: Record<SyncState, string> = {
  idle:    "Готово к обновлению",
  running: "Обновление данных на GitHub Actions...",
  success: "Данные успешно обновлены",
  error:   "Ошибка обновления",
};

const STATE_COLOR: Record<SyncState, string> = {
  idle:    "#3d4f68",
  running: "#3d9bff",
  success: "#4ade80",
  error:   "#f87171",
};

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}


type AnalyticsPeriod = { views: number; visitors: number };
type AnalyticsData = {
  configured: boolean;
  generatedAt?: string;
  online?: {
    visitors: number;
    pages: { pathname: string; visitors: number }[];
  };
  periods?: {
    today: AnalyticsPeriod;
    week: AnalyticsPeriod;
    month: AnalyticsPeriod;
  };
  topPages?: { pathname: string; views: number }[];
  recent?: { pathname: string; title: string; at: string }[];
  chart?: { day: string; views: number; visitors: number }[];
};

type NavigationNewData = {
  configured: boolean;
  items?: Partial<Record<NavHref, string>>;
  message?: string;
};

function NavigationNewPanel() {
  const [selected, setSelected] = useState<NavHref[]>([]);
  const [saved, setSaved] = useState<NavHref[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/navigation-new", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as NavigationNewData;

        if (!response.ok) {
          throw new Error(data.message ?? "Не удалось загрузить настройки");
        }

        const active = NAV_LINKS.flatMap((item) =>
          data.items?.[item.href] ? [item.href] : [],
        );

        setConfigured(data.configured);
        setSelected(active);
        setSaved(active);
      })
      .catch((error) => {
        setIsError(true);
        setMessage(String(error));
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleLink(href: NavHref) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }

      return NAV_LINKS.flatMap((item) =>
        next.has(item.href) ? [item.href] : [],
      );
    });
    setMessage("");
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/admin/navigation-new", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrefs: selected }),
      });
      const data = (await response.json()) as NavigationNewData;

      if (!response.ok) {
        throw new Error(data.message ?? "Не удалось сохранить настройки");
      }

      const active = NAV_LINKS.flatMap((item) =>
        data.items?.[item.href] ? [item.href] : [],
      );

      setSelected(active);
      setSaved(active);
      window.dispatchEvent(
        new CustomEvent(NAV_NEW_UPDATED_EVENT, {
          detail: data.items ?? {},
        }),
      );
      setMessage("Сохранено. Метки New уже появились в навигаторе.");
    } catch (error) {
      setIsError(true);
      setMessage(String(error));
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = selected.join("|") !== saved.join("|");

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-2">
        Метки New в навигаторе
      </h2>

      <p className="text-xs leading-relaxed text-ink-muted mb-5">
        Выбери ссылки, над которыми нужно показать New. У каждого посетителя
        метка исчезнет после открытия этой страницы.
      </p>

      {loading ? (
        <p className="text-sm text-ink-muted">Загружаю настройки…</p>
      ) : !configured ? (
        <p className="text-sm text-[#b42318]">
          Upstash Redis не подключён в Vercel, поэтому настройки пока нельзя сохранить.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {NAV_LINKS.map((item) => {
              const checked = selected.includes(item.href);

              return (
                <label
                  key={item.href}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#aaa095] bg-white/25 px-4 py-3 transition hover:border-[#b47722]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLink(item.href)}
                    className="h-4 w-4 accent-[#a96b1d]"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-ink-muted">
                      {item.href}
                    </span>
                  </span>

                  {checked && (
                    <span className="text-[10px] font-black text-[#a96b1d]">
                      New
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="btn-primary mt-5"
            style={{
              opacity: !hasChanges || saving ? 0.55 : 1,
              cursor: !hasChanges || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Сохраняю…" : "Сохранить метки New"}
          </button>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
            Если выключить метку, сохранить, а потом включить снова — она снова
            появится у всех посетителей.
          </p>
        </>
      )}

      {message && (
        <p
          className="mt-4 text-xs font-medium"
          style={{ color: isError ? "#b42318" : "#2f7a46" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

type Suggestion = {
  id: string;
  text: string;
  page: string;
  createdAt: string;
};

type SuggestionsData = {
  configured: boolean;
  suggestions: Suggestion[];
};

function SuggestionsPanel() {
  const [data, setData] = useState<SuggestionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadSuggestions() {
  setLoading(true);
  setMessage("");
    try {
      const response = await fetch("/api/admin/suggestions", { cache: "no-store" });
      const next = (await response.json()) as SuggestionsData;
      setData(next);
    } catch {
      setMessage("Не удалось загрузить предложения.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSuggestions();
  }, []);

  async function removeSuggestion(id: string) {
    setDeleting(id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/suggestions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Не удалось удалить предложение");
      }

      setData((current) =>
        current
          ? {
              ...current,
              suggestions: current.suggestions.filter((item) => item.id !== id),
            }
          : current,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось удалить предложение");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
          Предложения с сайта
        </h2>
<button
  type="button"
  onClick={loadSuggestions}
  disabled={loading}
  className="rounded-lg border border-[#b47722] px-3 py-1.5 text-xs font-semibold text-[#8b5a18] transition hover:bg-[#b47722]/10 disabled:cursor-wait disabled:opacity-50"
  style={{ cursor: loading ? "wait" : "pointer" }}
>
  {loading ? "Обновляю…" : "Обновить"}
</button>
      </div>

      <p className="text-xs leading-relaxed text-ink-muted mb-5">
        Сообщения, которые посетители оставили через навигатор.
      </p>

      {loading ? (
        <p className="text-sm text-ink-muted">Загружаю предложения…</p>
      ) : !data?.configured ? (
        <p className="text-sm text-[#b42318]">
          Upstash Redis не подключён, поэтому предложения пока не сохраняются.
        </p>
      ) : data.suggestions.length === 0 ? (
        <p className="text-sm text-ink-muted">Новых предложений пока нет.</p>
      ) : (
        <div className="space-y-3">
          {data.suggestions.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#aaa095] bg-white/25 p-4"
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                {item.text}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                  <span>{formatDate(item.createdAt)}</span>
                  <a href={item.page} className="underline hover:text-[#8b5a18]">
                    Страница: {item.page}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => removeSuggestion(item.id)}
                  disabled={deleting === item.id}
                  className="text-xs font-semibold text-[#9f2d24] underline disabled:opacity-50"
                >
                  {deleting === item.id ? "Удаляю…" : "Удалить"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {message && <p className="mt-4 text-xs font-medium text-[#b42318]">{message}</p>}
    </div>
  );
}

const PAGE_NAMES: Record<string, string> = {
  "/": "Главная",
  "/members": "Волчата",
  "/clans": "Кланы",
  "/alliances": "Альянсы",
  "/ratings": "Рейтинги",
  "/dungeons": "Карты подземелий",
  "/hunter-board": "Планшет охотника",
  "/personal-smiles": "Личные смайлики",
  "/gifts": "Подарочки",
  "/links": "Что-то полезное",
  "/gallery": "Галерея",
};

function pageName(pathname: string): string {
  return PAGE_NAMES[pathname] ?? pathname;
}

function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
    const timer = window.setInterval(loadAnalytics, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return <div className="glass rounded-2xl p-6 text-sm text-ink-muted">Загружаю статистику…</div>;
  }

  if (!data?.configured) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
          Статистика сайта
        </h2>
        <p className="text-sm text-ink-muted">
          Код уже установлен. Осталось подключить Upstash Redis в Vercel и сделать новый Deploy.
        </p>
      </div>
    );
  }

  const periods = data.periods!;
  const maxChart = Math.max(1, ...(data.chart ?? []).map((item) => item.views));

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
          Статистика сайта
        </h2>
        <button onClick={loadAnalytics} className="text-xs text-[#3d9bff] underline">
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          ["Сегодня", periods.today],
          ["7 дней", periods.week],
          ["30 дней", periods.month],
        ].map(([label, value]) => {
          const period = value as AnalyticsPeriod;
          return (
            <div key={label as string} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
              <p className="text-xs text-ink-muted mb-2">{label as string}</p>
              <p className="text-xl font-black text-ink tabular-nums">{period.visitors}</p>
              <p className="text-xs text-ink-muted">посещений</p>
              <p className="text-sm font-semibold text-ink mt-2 tabular-nums">{period.views} просмотров</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-ink">Сейчас на сайте</p>
          <span className="text-lg font-black text-[#4ade80] tabular-nums">
            {data.online?.visitors ?? 0}
          </span>
        </div>
        {(data.online?.pages.length ?? 0) > 0 ? (
          <div className="divide-y divide-white/[0.05]">
            {data.online!.pages.map((item) => (
              <StatRow key={item.pathname} label={pageName(item.pathname)} value={item.visitors} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">Сейчас никого нет.</p>
        )}
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-ink mb-3">Посещения за 14 дней</p>
        <div className="flex items-end gap-1.5 h-28">
          {(data.chart ?? []).map((item) => (
            <div key={item.day} className="flex-1 min-w-0 flex flex-col justify-end items-center gap-1 h-full" title={`${item.day}: ${item.views} просмотров`}>
              <div
                className="w-full rounded-t bg-[#3d9bff]/70 min-h-[2px]"
                style={{ height: `${Math.max(2, (item.views / maxChart) * 88)}px` }}
              />
              <span className="text-[9px] text-ink-muted">{item.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-ink mb-3">Популярные страницы за 30 дней</p>
        {(data.topPages?.length ?? 0) > 0 ? (
          <div className="divide-y divide-white/[0.05]">
            {data.topPages!.map((item) => (
              <StatRow key={item.pathname} label={pageName(item.pathname)} value={item.views} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">Данных пока нет.</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-3">Последние открытия страниц</p>
        {(data.recent?.length ?? 0) > 0 ? (
          <div className="space-y-2">
            {data.recent!.slice(0, 12).map((item, index) => (
              <div key={`${item.at}-${index}`} className="flex items-center justify-between gap-4 text-xs">
                <span className="text-ink truncate">{pageName(item.pathname)}</span>
                <span className="text-ink-muted shrink-0">{formatDate(item.at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">Данных пока нет.</p>
        )}
      </div>

      <p className="text-[11px] text-ink-muted mt-5">
        Посетители считаются без IP и без рекламных cookies. Одна открытая вкладка — одно посещение за день.
      </p>
    </div>
  );
}

const IMAGE_STATE_LABEL: Record<SyncState, string> = {
  idle: "Готово к сбору образов",
  running: "Сбор образов на GitHub Actions...",
  success: "Образы успешно обновлены",
  error: "Ошибка обновления образов",
};

function PlayerImagesSyncPanel() {
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState("");
  const [runUrl, setRunUrl] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function applyStatus(data: SyncStatus) {
    if (data.lastUpdatedAt) setLastUpdatedAt(data.lastUpdatedAt);
    if (data.lastResult) setState(data.lastResult);
    setDurationMs(data.durationMs);
    if (data.runUrl) setRunUrl(data.runUrl);
    return data.lastResult;
  }

  function stopPolling() {
    if (!pollRef.current) return;
    clearInterval(pollRef.current);
    pollRef.current = null;
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/sync?workflow=images", {
          cache: "no-store",
        });
        const data = (await response.json()) as SyncStatus;
        const result = applyStatus(data);
        if (result === "success" || result === "error") stopPolling();
      } catch {
        /* пробуем ещё раз на следующем тике */
      }
    }, 8000);
  }

  useEffect(() => {
    fetch("/api/admin/sync?workflow=images", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: SyncStatus) => {
        const result = applyStatus(data);
        if (result === "running") startPolling();
      })
      .catch(() => {});

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImagesSync() {
    setState("running");
    setMessage("");

    try {
      const response = await fetch("/api/admin/sync?workflow=images", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setState("error");
        setMessage(data.message ?? "Неизвестная ошибка");
        return;
      }

      setMessage(data.message ?? "");
      startPolling();
    } catch (error) {
      setState("error");
      setMessage(String(error));
    }
  }

  const isRunning = state === "running";

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-2">
        Образы игроков
      </h2>

      <p className="text-xs leading-relaxed text-ink-muted mb-5">
        Отдельный сбор текущих образов. При смене прежний образ останется в галерее игрока.
      </p>

      <button
        type="button"
        onClick={handleImagesSync}
        disabled={isRunning}
        className="btn-primary"
        style={{
          opacity: isRunning ? 0.55 : 1,
          cursor: isRunning ? "not-allowed" : "pointer",
        }}
      >
        🖼️ Собрать образы игроков
      </button>

      <div className="flex items-center gap-2 mt-5">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{
            background: STATE_COLOR[state],
            boxShadow: isRunning ? `0 0 6px ${STATE_COLOR.running}` : "none",
            animation: isRunning ? "pulse 1.2s ease-in-out infinite" : "none",
          }}
        />
        <span className="text-sm font-medium" style={{ color: STATE_COLOR[state] }}>
          {IMAGE_STATE_LABEL[state]}
        </span>
      </div>

      {isRunning && (
        <p className="text-xs text-ink-muted mt-2">
          Можно закрыть страницу — сбор продолжится на GitHub Actions. Первый запуск
          может быть долгим, потому что нужно сохранить стартовые галереи.
        </p>
      )}

      {message && !isRunning && (
        <p className="text-xs text-ink-muted mt-2">{message}</p>
      )}

      {lastUpdatedAt && (
        <p className="text-xs text-ink-muted mt-3">
          Последний запуск: {formatDate(lastUpdatedAt)}
          {durationMs !== null ? ` · ${formatDuration(durationMs)}` : ""}
        </p>
      )}

      {runUrl && (
        <a
          href={runUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#3d9bff] underline mt-2 inline-block"
        >
          Открыть запуск на GitHub →
        </a>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [syncState,     setSyncState]     = useState<SyncState>("idle");
  const [message,       setMessage]       = useState<string>("");
  const [runUrl,        setRunUrl]        = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [durationMs,    setDurationMs]    = useState<number | null>(null);
  const [clansCount,    setClansCount]    = useState<number | null>(null);
  const [playersCount,  setPlayersCount]  = useState<number | null>(null);
  const [positionsFound,setPositionsFound]= useState<number | null>(null);
  const [emptyPositions,setEmptyPositions]= useState<number | null>(null);
  const [errorsCount,   setErrorsCount]   = useState<number | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function applyStatus(data: SyncStatus) {
    if (data.lastUpdatedAt)  setLastUpdatedAt(data.lastUpdatedAt);
    if (data.lastResult)     setSyncState(data.lastResult);
    setDurationMs(data.durationMs);
    if (data.clansCount     !== null) setClansCount(data.clansCount);
    if (data.playersCount   !== null) setPlayersCount(data.playersCount);
    if (data.positionsFound !== null) setPositionsFound(data.positionsFound);
    if (data.emptyPositions !== null) setEmptyPositions(data.emptyPositions);
    if (data.errorsCount    !== null) setErrorsCount(data.errorsCount);
    if (data.runUrl)         setRunUrl(data.runUrl);
    return data.lastResult;
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/sync");
        const data: SyncStatus = await res.json();
        const result = applyStatus(data);
        if (result === "success" || result === "error") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        /* пробуем ещё раз на следующем тике */
      }
    }, 8000);
  }

  useEffect(() => {
    fetch("/api/admin/sync")
      .then((r) => r.json())
      .then((data: SyncStatus) => {
        const result = applyStatus(data);
        if (result === "running") startPolling();
      })
      .catch(() => {});

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncState("running");
    setMessage("");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setSyncState("error");
        setMessage(data.message ?? "Неизвестная ошибка");
        return;
      }
      setMessage(data.message ?? "");
      startPolling();
    } catch (err) {
      setSyncState("error");
      setMessage(String(err));
    }
  };

  const isRunning   = syncState === "running";
  const hasSummary  = lastUpdatedAt !== null;
  const lastOk      = syncState === "success";

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-ink tracking-tight mb-2">
        Администрирование
      </h1>
      <div className="divider-accent mb-10" />

      <div className="space-y-5 max-w-2xl">

        <SuggestionsPanel />

        <NavigationNewPanel />

        <AnalyticsPanel />

        {/* ── Sync control ─────────────────────────────── */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-5">
            Обновление данных
          </h2>

          <button
            onClick={handleSync}
            disabled={isRunning}
            className="btn-primary"
            style={{ opacity: isRunning ? 0.55 : 1, cursor: isRunning ? "not-allowed" : "pointer" }}
          >
            🔄 Обновить данные ДМ
          </button>

          <div className="flex items-center gap-2 mt-5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{
                background: STATE_COLOR[syncState],
                boxShadow:  isRunning ? `0 0 6px ${STATE_COLOR.running}` : "none",
                animation:  isRunning ? "pulse 1.2s ease-in-out infinite" : "none",
              }}
            />
            <span className="text-sm font-medium" style={{ color: STATE_COLOR[syncState] }}>
              {STATE_LABEL[syncState]}
            </span>
          </div>

          {isRunning && (
            <p className="text-xs text-ink-muted mt-2">
              Запущено на GitHub Actions — обычно занимает 3–4 минуты. Страницу можно закрыть,
              обновление продолжится само по себе.
            </p>
          )}

          {message && !isRunning && (
            <p className="text-xs text-ink-muted mt-2">{message}</p>
          )}

          {runUrl && (
            
             <a href={runUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#3d9bff] underline mt-2 inline-block"
            >
              Открыть запуск на GitHub →
            </a>
          )}
        </div>

        <PlayerImagesSyncPanel />

        {/* ── Summary ──────────────────────────────────── */}
        {hasSummary && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
              Последнее обновление
            </h2>

            <p className="text-base font-semibold text-ink mb-4">
              {formatDate(lastUpdatedAt!)}
            </p>

            <div className="divide-y divide-white/[0.05]">
              {clansCount     !== null && <StatRow label="Кланов"              value={clansCount} />}
              {playersCount   !== null && <StatRow label="Персонажей"          value={playersCount} />}
              {positionsFound !== null && <StatRow label="Должностей найдено"  value={positionsFound} />}
              {emptyPositions !== null && <StatRow label="Пустых должностей"   value={emptyPositions} />}
            </div>

            {(errorsCount !== null || durationMs !== null) && (
              <>
                <div className="divider my-4" />
                <p className="text-xs text-ink-muted mb-2">Последний запуск</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: lastOk ? "#4ade80" : "#f87171" }}>
                    {lastOk ? "✓ Успешно" : "✗ Ошибка"}
                  </p>
                  {durationMs !== null && (
                    <p className="text-sm text-ink-muted">
                      ⏱ Время выполнения: {formatDuration(durationMs)}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
