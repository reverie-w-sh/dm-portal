"use client";

import { useState, useEffect, useRef } from "react";
import type { SyncStatus } from "../api/admin/sync/route";

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
