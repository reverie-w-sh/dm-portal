"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gardenMap from "../../../data/garden-map.json";

const MIN_CELL = 12;
const MAX_CELL = 34;
const DEFAULT_CELL = 20;
const WALL = "#343a40";
const PASSAGE = "#eef5fa";
const GRID = "#cfd8e3";
const PAGE_BG = "#f5f9ff";
const ACCENT = "#7fb4d8";
const ACCENT_STRONG = "#4f8fba";
const TEXT = "#25313b";

type HoveredCell = { row: number; col: number; coord: string } | null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function GardenNightmaresPage() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const drag = useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });
  const pinch = useRef({ distance: 0, size: DEFAULT_CELL });

  const [cellSize, setCellSize] = useState(DEFAULT_CELL);
  const [hovered, setHovered] = useState<HoveredCell>(null);
  const [selectedCoord, setSelectedCoord] = useState("");
  const [copiedCoord, setCopiedCoord] = useState("");
  const [query, setQuery] = useState("");
  const [flashCoord, setFlashCoord] = useState("");
  const [spacePressed, setSpacePressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const columns = gardenMap.columns;
  const rows = gardenMap.height;
  const cols = gardenMap.width;

  const coordinateSet = useMemo(() => {
    const set = new Set<string>();
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        set.add(`${columns[col]}${row + 1}`);
      }
    }
    return set;
  }, [columns, cols, rows]);

  const getCoord = useCallback(
    (col: number, row: number) => `${columns[col]}${row + 1}`,
    [columns]
  );

  const copyCoord = useCallback(async (coord: string) => {
    if (!coord) return;
    try {
      await navigator.clipboard.writeText(coord);
    } catch {
      const area = document.createElement("textarea");
      area.value = coord;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setSelectedCoord(coord);
    setCopiedCoord(coord);
    window.setTimeout(() => {
      setCopiedCoord((current) => (current === coord ? "" : current));
    }, 1200);
  }, []);

  const zoomTo = useCallback(
    (nextSize: number) => {
      const viewport = viewportRef.current;
      const newSize = clamp(nextSize, MIN_CELL, MAX_CELL);
      if (!viewport || newSize === cellSize) {
        setCellSize(newSize);
        return;
      }

      const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
      const centerY = viewport.scrollTop + viewport.clientHeight / 2;
      const ratio = newSize / cellSize;
      setCellSize(newSize);
      requestAnimationFrame(() => {
        viewport.scrollLeft = centerX * ratio - viewport.clientWidth / 2;
        viewport.scrollTop = centerY * ratio - viewport.clientHeight / 2;
      });
    },
    [cellSize]
  );

  const centerOnCoord = useCallback(
    (raw: string) => {
      const coord = raw.trim();
      if (!coordinateSet.has(coord)) return false;
      const col = columns.indexOf(coord.charAt(0));
      const row = Number(coord.slice(1)) - 1;
      const viewport = viewportRef.current;
      if (!viewport || col < 0 || row < 0) return false;

      const label = 34;
      viewport.scrollTo({
        left: Math.max(0, label + col * cellSize - viewport.clientWidth / 2),
        top: Math.max(0, label + row * cellSize - viewport.clientHeight / 2),
        behavior: "smooth",
      });
      setSelectedCoord(coord);
      setFlashCoord(coord);
      window.setTimeout(() => {
        setFlashCoord((current) => (current === coord ? "" : current));
      }, 1500);
      return true;
    },
    [cellSize, columns, coordinateSet]
  );

  const handleSearch = useCallback(() => {
    if (!centerOnCoord(query)) {
      setFlashCoord("INVALID");
      window.setTimeout(() => setFlashCoord(""), 900);
    }
  }, [centerOnCoord, query]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.code === "Space" && !typing) {
        event.preventDefault();
        setSpacePressed(true);
      }
      if (typing) return;

      if (event.key.toLowerCase() === "c" && hovered?.coord) {
        event.preventDefault();
        void copyCoord(hovered.coord);
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (event.key === "0") {
        event.preventDefault();
        zoomTo(DEFAULT_CELL);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomTo(cellSize + 2);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomTo(cellSize - 2);
      }
    };

    const keyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePressed(false);
        drag.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [cellSize, copyCoord, hovered, zoomTo]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const allowed =
      spacePressed || event.button === 1 || (event.pointerType === "touch" && event.isPrimary);
    if (!allowed) return;

    drag.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || !drag.current.active) return;
    viewport.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
    viewport.scrollTop = drag.current.top - (event.clientY - drag.current.y);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    drag.current.active = false;
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoomTo(cellSize + (event.deltaY < 0 ? 2 : -2));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;
    const a = event.touches[0];
    const b = event.touches[1];
    pinch.current.distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    pinch.current.size = cellSize;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinch.current.distance) return;
    const a = event.touches[0];
    const b = event.touches[1];
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    setCellSize(clamp(Math.round(pinch.current.size * (distance / pinch.current.distance)), MIN_CELL, MAX_CELL));
  };

  const hoveredRow = hovered?.row ?? -1;
  const hoveredCol = hovered?.col ?? -1;

  return (
    <main className="min-h-screen px-3 py-5 sm:px-6" style={{ background: PAGE_BG, color: TEXT }}>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-4">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Сад кошмаров</h1>
          <p className="mt-1 text-sm text-slate-600">Карта для проверки координат. Маршруты добавим следующим этапом.</p>
        </header>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Найти координату</span>
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                  placeholder="Например: M27"
                  className={`min-w-0 flex-1 rounded-xl border bg-white px-4 py-2.5 text-center font-bold outline-none transition ${flashCoord === "INVALID" ? "border-red-400 ring-2 ring-red-100" : "border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"}`}
                />
                <button type="button" onClick={handleSearch} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-bold transition hover:bg-slate-50">Найти</button>
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => zoomTo(cellSize - 2)} className="h-11 min-w-11 rounded-xl border border-slate-300 bg-white font-black hover:bg-slate-50" title="Уменьшить масштаб (−)">−</button>
              <button type="button" onClick={() => zoomTo(DEFAULT_CELL)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-bold hover:bg-slate-50" title="Вернуть масштаб 100% (0)">{Math.round((cellSize / DEFAULT_CELL) * 100)}%</button>
              <button type="button" onClick={() => zoomTo(cellSize + 2)} className="h-11 min-w-11 rounded-xl border border-slate-300 bg-white font-black hover:bg-slate-50" title="Увеличить масштаб (+)">+</button>
            </div>

            <div className="min-w-[190px] rounded-xl border px-4 py-2.5 text-center font-black" style={{ borderColor: hovered?.coord || selectedCoord ? ACCENT : "#cbd5e1", background: hovered?.coord || selectedCoord ? "#edf7fd" : "#fff" }}>
              {copiedCoord ? `✓ ${copiedCoord} скопировано` : hovered?.coord || selectedCoord || "Наведите на клетку"}
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <p><b>C</b> — скопировать координату под курсором.</p>
            <p><b>F</b> — перейти к поиску координаты.</p>
            <p><b>+ / − / 0</b> — изменить или сбросить масштаб.</p>
            <p><b>Пробел + мышь</b> — перетащить карту.</p>
            <p className="sm:col-span-2"><b>Клик по клетке</b> — скопировать её координату в буфер обмена.</p>
            <p className="sm:col-span-2"><b>Ctrl + колесо</b> или жест двумя пальцами — изменить масштаб.</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
          <div
            ref={viewportRef}
            className={`relative max-h-[78vh] overflow-auto ${isDragging ? "cursor-grabbing" : spacePressed ? "cursor-grab" : ""}`}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div className="grid w-max select-none" style={{ gridTemplateColumns: `34px repeat(${cols}, ${cellSize}px) 34px`, gridTemplateRows: `34px repeat(${rows}, ${cellSize}px) 34px`, background: PAGE_BG }}>
              <div className="sticky left-0 top-0 z-30 bg-[#f5f9ff]" />
              {columns.map((letter, col) => (
                <div key={`top-${letter}`} className="sticky top-0 z-20 flex items-center justify-center border-b text-xs font-black" style={{ height: 34, borderColor: GRID, background: hoveredCol === col ? "#dceefa" : PAGE_BG, color: hoveredCol === col ? ACCENT_STRONG : TEXT }}>{letter}</div>
              ))}
              <div className="sticky right-0 top-0 z-30 bg-[#f5f9ff]" />

              {gardenMap.grid.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="contents">
                  <div className="sticky left-0 z-20 flex items-center justify-center border-r text-xs font-black" style={{ width: 34, borderColor: GRID, background: hoveredRow === rowIndex ? "#dceefa" : PAGE_BG, color: hoveredRow === rowIndex ? ACCENT_STRONG : TEXT }}>{rowIndex + 1}</div>

                  {row.map((isWall, colIndex) => {
                    const coord = getCoord(colIndex, rowIndex);
                    const isHovered = hoveredRow === rowIndex && hoveredCol === colIndex;
                    const isAxisHovered = hoveredRow === rowIndex || hoveredCol === colIndex;
                    const isSelected = selectedCoord === coord;
                    const isFlashing = flashCoord === coord;
                    const shadows = [
                      `inset -1px -1px 0 ${GRID}`,
                      isAxisHovered ? "inset 0 0 0 1px rgba(127,180,216,.45)" : "",
                      isHovered ? `inset 0 0 0 3px ${ACCENT_STRONG}` : "",
                      isSelected ? `inset 0 0 0 2px ${ACCENT}` : "",
                      isFlashing ? "0 0 0 4px rgba(79,143,186,.55)" : "",
                    ].filter(Boolean).join(",");

                    return (
                      <button
                        key={coord}
                        type="button"
                        aria-label={`Координата ${coord}`}
                        title={coord}
                        onMouseEnter={() => setHovered({ row: rowIndex, col: colIndex, coord })}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered({ row: rowIndex, col: colIndex, coord })}
                        onBlur={() => setHovered(null)}
                        onClick={() => void copyCoord(coord)}
                        className="relative m-0 block border-0 p-0 outline-none"
                        style={{ width: cellSize, height: cellSize, background: isWall ? WALL : PASSAGE, boxShadow: shadows, zIndex: isHovered || isFlashing ? 5 : 1 }}
                      >
                        {isHovered && (
                          <span className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black shadow" style={{ background: "#fff", color: TEXT, border: `1px solid ${ACCENT}`, whiteSpace: "nowrap" }}>{coord}</span>
                        )}
                      </button>
                    );
                  })}

                  <div className="sticky right-0 z-20 flex items-center justify-center border-l text-xs font-black" style={{ width: 34, borderColor: GRID, background: hoveredRow === rowIndex ? "#dceefa" : PAGE_BG, color: hoveredRow === rowIndex ? ACCENT_STRONG : TEXT }}>{rowIndex + 1}</div>
                </div>
              ))}

              <div className="sticky bottom-0 left-0 z-30 bg-[#f5f9ff]" />
              {columns.map((letter, col) => (
                <div key={`bottom-${letter}`} className="sticky bottom-0 z-20 flex items-center justify-center border-t text-xs font-black" style={{ height: 34, borderColor: GRID, background: hoveredCol === col ? "#dceefa" : PAGE_BG, color: hoveredCol === col ? ACCENT_STRONG : TEXT }}>{letter}</div>
              ))}
              <div className="sticky bottom-0 right-0 z-30 bg-[#f5f9ff]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
