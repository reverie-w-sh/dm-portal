"use client";

import { useState, useEffect } from "react";
import type { SyncStatus } from "../api/admin/sync/route";

type SyncState = "idle" | "running" | "success" | "error";

type ApiPayload = SyncStatus & { ok: boolean; message: string; output: string };

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
  running: "Обновление данных...",
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
  const [output,        setOutput]        = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [durationMs,    setDurationMs]    = useState<number | null>(null);
  const [clansCount,    setClansCount]    = useState<number | null>(null);
  const [playersCount,  setPlayersCount]  = useState<number | null>(null);
  const [positionsFound,setPositionsFound]= useState<number | null>(null);
  const [emptyPositions,setEmptyPositions]= useState<number | null>(null);
  const [errorsCount,   setErrorsCount]   = useState<number | null>(null);

  function applyStatus(data: SyncStatus) {
    if (data.lastUpdatedAt)  setLastUpdatedAt(data.lastUpdatedAt);
    if (data.lastResult)     setSyncState(data.lastResult);
    if (data.durationMs     !== null) setDurationMs(data.durationMs);
    if (data.clansCount     !== null) setClansCount(data.clansCount);
    if (data.playersCount   !== null) setPlayersCount(data.playersCount);
    if (data.positionsFound !== null) setPositionsFound(data.positionsFound);
    if (data.emptyPositions !== null) setEmptyPositions(data.emptyPositions);
    if (data.errorsCount    !== null) setErrorsCount(data.errorsCount);
    if (data.lastOutputShort)         setOutput(data.lastOutputShort);
  }

  useEffect(() => {
    fetch("/api/admin/sync")
      .then((r) => r.json())
      .then(applyStatus)
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncState("running");
    setOutput("");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data: ApiPayload = await res.json();
      setSyncState(data.ok ? "success" : "error");
      setOutput(data.output ?? "");
      applyStatus(data);
    } catch (err) {
      setSyncState("error");
      setOutput(String(err));
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
              Шаги выполняются последовательно. Шаг 3 (обновление профилей) может занять несколько минут — не закрывайте страницу.
            </p>
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
                <p className="text-xs text-ink-muted mb-2">Последняя синхронизация</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: lastOk ? "#4ade80" : "#f87171" }}>
                    {lastOk ? "✓ Успешно" : "✗ Ошибка"}
                    {errorsCount !== null && errorsCount > 0 && (
                      <span className="ml-2 text-xs text-[#f87171]">({errorsCount} ошиб.)</span>
                    )}
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

        {/* ── Output log ───────────────────────────────── */}
        {output && (
          <div className="glass rounded-2xl p-5">
            <h3 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Вывод
            </h3>
            <pre
              className="text-[11px] text-ink-dim overflow-auto leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "monospace", maxHeight: "22rem" }}
            >
              {output}
            </pre>
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
