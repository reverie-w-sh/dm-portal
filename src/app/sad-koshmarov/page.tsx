"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gardenMap from "../../../data/garden-map.json";
import officialLayers from "../../../data/garden-layers.json";

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
const OFFICIAL_ROUTE = "#f59e0b";
const PERSONAL_ROUTE = "#2563eb";
const PERSONAL_MARKER = "#14b8a6";

type HoveredCell = {
  row: number;
  col: number;
  coord: string;
} | null;

type PersonalMarker = {
  coord: string;
  label: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseCoord(coord: string, columns: string[]) {
  const col = columns.indexOf(coord.charAt(0));
  const row = Number(coord.slice(1)) - 1;

  if (
    col < 0 ||
    !Number.isInteger(row) ||
    row < 0 ||
    row >= gardenMap.height
  ) {
    return null;
  }

  return { col, row };
}

function getStraightSegment(
  from: string,
  to: string,
  columns: string[]
): string[] | null {
  const start = parseCoord(from, columns);
  const end = parseCoord(to, columns);

  if (!start || !end) return null;

  const sameRow = start.row === end.row;
  const sameCol = start.col === end.col;

  if (!sameRow && !sameCol) return null;

  const cells: string[] = [];

  if (sameRow) {
    const step = end.col > start.col ? 1 : -1;

    for (let col = start.col + step; ; col += step) {
      cells.push(`${columns[col]}${start.row + 1}`);
      if (col === end.col) break;
    }
  } else {
    const step = end.row > start.row ? 1 : -1;

    for (let row = start.row + step; ; row += step) {
      cells.push(`${columns[start.col]}${row + 1}`);
      if (row === end.row) break;
    }
  }

  return cells;
}

function findWalkablePath(
  from: string,
  to: string,
  columns: string[],
  grid: number[][]
): string[] | null {
  const start = parseCoord(from, columns);
  const end = parseCoord(to, columns);

  if (!start || !end || grid[end.row]?.[end.col] !== 0) return null;

  const key = (col: number, row: number) => `${col},${row}`;
  const queue: Array<{ col: number; row: number }> = [start];
  const previous = new Map<string, string | null>();

  previous.set(key(start.col, start.row), null);

  const directions = [
    { dc: 1, dr: 0 },
    { dc: -1, dr: 0 },
    { dc: 0, dr: 1 },
    { dc: 0, dr: -1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.col === end.col && current.row === end.row) {
      const reversed: string[] = [];
      let currentKey: string | null = key(end.col, end.row);

      while (currentKey) {
        const [colText, rowText] = currentKey.split(",");
        const col = Number(colText);
        const row = Number(rowText);

        reversed.push(`${columns[col]}${row + 1}`);
        currentKey = previous.get(currentKey) ?? null;
      }

      reversed.reverse();
      return reversed.slice(1);
    }

    for (const { dc, dr } of directions) {
      const col = current.col + dc;
      const row = current.row + dr;

      if (
        col < 0 ||
        row < 0 ||
        col >= columns.length ||
        row >= grid.length ||
        grid[row]?.[col] !== 0
      ) {
        continue;
      }

      const nextKey = key(col, row);

      if (previous.has(nextKey)) continue;

      previous.set(nextKey, key(current.col, current.row));
      queue.push({ col, row });
    }
  }

  return null;
}

export default function GardenPublicPage() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [cellSize, setCellSize] = useState(DEFAULT_CELL);
  const [hovered, setHovered] = useState<HoveredCell>(null);
  const [selectedCoord, setSelectedCoord] = useState("");
  const [copiedCoord, setCopiedCoord] = useState("");
  const [query, setQuery] = useState("");
  const [flashCoord, setFlashCoord] = useState("");
  const [message, setMessage] = useState("");

  const [showSavedRoute, setShowSavedRoute] = useState(false);
  const [showBosses, setShowBosses] = useState(false);
  const [showMyRoute, setShowMyRoute] = useState(true);
  const [showMyMarkers, setShowMyMarkers] = useState(true);

  const [routeEditMode, setRouteEditMode] = useState(false);
  const [myRoute, setMyRoute] = useState<string[]>([]);
  const [myMarkers, setMyMarkers] = useState<PersonalMarker[]>([]);
  const [markerLabel, setMarkerLabel] = useState("Моя метка");

  const [quickFrom, setQuickFrom] = useState("");
  const [quickTo, setQuickTo] = useState("");
  const [quickRoute, setQuickRoute] = useState<string[]>([]);
  const [showQuickRoute, setShowQuickRoute] = useState(true);
  const [quickClickMode, setQuickClickMode] = useState(false);
  const [quickClickStart, setQuickClickStart] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const touchState = useRef({
    startDistance: 0,
    startCellSize: DEFAULT_CELL,
  });

  const columns = gardenMap.columns;
  const rows = gardenMap.height;
  const cols = gardenMap.width;

  useEffect(() => {
    try {
      const storedRoute = localStorage.getItem("garden-player-route-v2");
      const storedMarkers = localStorage.getItem("garden-player-markers-v2");
      const storedQuickRoute = localStorage.getItem("garden-player-quick-route-v1");
      const storedQuickFrom = localStorage.getItem("garden-player-quick-from-v1");
      const storedQuickTo = localStorage.getItem("garden-player-quick-to-v1");

      if (storedRoute) setMyRoute(JSON.parse(storedRoute));
      if (storedMarkers) setMyMarkers(JSON.parse(storedMarkers));
      if (storedQuickRoute) setQuickRoute(JSON.parse(storedQuickRoute));
      if (storedQuickFrom) setQuickFrom(storedQuickFrom);
      if (storedQuickTo) setQuickTo(storedQuickTo);
    } catch {
      // Повреждённые данные браузера просто игнорируем.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("garden-player-route-v2", JSON.stringify(myRoute));
  }, [myRoute]);

  useEffect(() => {
    localStorage.setItem("garden-player-markers-v2", JSON.stringify(myMarkers));
  }, [myMarkers]);

  useEffect(() => {
    localStorage.setItem("garden-player-quick-route-v1", JSON.stringify(quickRoute));
    localStorage.setItem("garden-player-quick-from-v1", quickFrom);
    localStorage.setItem("garden-player-quick-to-v1", quickTo);
  }, [quickFrom, quickRoute, quickTo]);

  const coordinateSet = useMemo(() => {
    const result = new Set<string>();

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        result.add(`${columns[col]}${row + 1}`);
      }
    }

    return result;
  }, [columns, cols, rows]);

  const officialRouteSet = useMemo(
    () => new Set<string>(officialLayers.route ?? []),
    []
  );

  const officialDangerSet = useMemo(
    () => new Set<string>(officialLayers.dangerCells ?? []),
    []
  );

  const officialBossMap = useMemo(
    () =>
      new Map(
        (officialLayers.bosses ?? []).map((item) => [item.coord, item])
      ),
    []
  );

  const officialBattleMap = useMemo(
    () =>
      new Map(
        (officialLayers.battleMarkers ?? []).map((item) => [
          item.coord,
          item,
        ])
      ),
    []
  );

  const officialMobMap = useMemo(
    () =>
      new Map(
        (((officialLayers as { mobMarkers?: PersonalMarker[] }).mobMarkers ?? []) as PersonalMarker[]).map((item) => [
          item.coord,
          item,
        ])
      ),
    []
  );

  const officialMarkerMap = useMemo(
    () =>
      new Map(
        (officialLayers.customMarkers ?? []).map((item) => [
          item.coord,
          item,
        ])
      ),
    []
  );

  const adjutants = useMemo(
    () =>
      (officialLayers.bosses ?? []).filter(
        (boss) => boss.kind === "adjutant"
      ),
    []
  );

  const kings = useMemo(
    () =>
      (officialLayers.bosses ?? []).filter(
        (boss) => boss.kind === "king"
      ),
    []
  );

  const myRouteSet = useMemo(() => new Set(myRoute), [myRoute]);
  const quickRouteSet = useMemo(() => new Set(quickRoute), [quickRoute]);
  const myMarkerMap = useMemo(
    () => new Map(myMarkers.map((item) => [item.coord, item])),
    [myMarkers]
  );

  const getCoord = useCallback(
    (col: number, row: number) => `${columns[col]}${row + 1}`,
    [columns]
  );

  const notify = useCallback((text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage((current) => (current === text ? "" : current));
    }, 1600);
  }, []);

  const copyCoord = useCallback(
    async (coord: string) => {
      try {
        await navigator.clipboard.writeText(coord);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = coord;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setSelectedCoord(coord);
      setCopiedCoord(coord);
      notify(`✓ ${coord} скопировано`);

      window.setTimeout(() => {
        setCopiedCoord((current) => (current === coord ? "" : current));
      }, 1200);
    },
    [notify]
  );

  const zoomTo = useCallback(
    (nextSize: number) => {
      const viewport = viewportRef.current;
      const oldSize = cellSize;
      const newSize = clamp(nextSize, MIN_CELL, MAX_CELL);

      if (!viewport) {
        setCellSize(newSize);
        return;
      }

      if (newSize === oldSize) return;

      const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
      const centerY = viewport.scrollTop + viewport.clientHeight / 2;
      const ratio = newSize / oldSize;

      setCellSize(newSize);

      requestAnimationFrame(() => {
        viewport.scrollLeft = centerX * ratio - viewport.clientWidth / 2;
        viewport.scrollTop = centerY * ratio - viewport.clientHeight / 2;
      });
    },
    [cellSize]
  );

  const centerOnCoord = useCallback(
    (coord: string) => {
      const normalized = coord.trim();

      if (!coordinateSet.has(normalized)) return false;

      const point = parseCoord(normalized, columns);
      const viewport = viewportRef.current;

      if (!point || !viewport) return false;

      const labelSize = 34;
      const targetX = labelSize + point.col * cellSize + cellSize / 2;
      const targetY = labelSize + point.row * cellSize + cellSize / 2;

      viewport.scrollTo({
        left: Math.max(0, targetX - viewport.clientWidth / 2),
        top: Math.max(0, targetY - viewport.clientHeight / 2),
        behavior: "smooth",
      });

      setSelectedCoord(normalized);
      setFlashCoord(normalized);

      window.setTimeout(() => {
        setFlashCoord((current) => (current === normalized ? "" : current));
      }, 1400);

      return true;
    },
    [cellSize, columns, coordinateSet]
  );

  const handleSearch = useCallback(() => {
    if (!centerOnCoord(query)) {
      setFlashCoord("INVALID");
      notify("Такой координаты нет");

      window.setTimeout(() => {
        setFlashCoord("");
      }, 900);
    }
  }, [centerOnCoord, notify, query]);

  const addRouteTo = useCallback(
    (coord: string) => {
      setMyRoute((current) => {
        const target = parseCoord(coord, columns);

        if (!target || gardenMap.grid[target.row]?.[target.col] !== 0) {
          notify("Маршрут можно прокладывать только по проходам");
          return current;
        }

        if (current.length === 0) {
          notify(`Начало маршрута: ${coord}`);
          return [coord];
        }

        const last = current[current.length - 1];

        if (last === coord) {
          return current.slice(0, -1);
        }

        const straight = getStraightSegment(last, coord, columns);
        let segment = straight;

        if (segment) {
          const blocked = segment.some((item) => {
            const point = parseCoord(item, columns);
            return !point || gardenMap.grid[point.row]?.[point.col] !== 0;
          });

          if (blocked) segment = null;
        }

        if (!segment) {
          segment = findWalkablePath(
            last,
            coord,
            columns,
            gardenMap.grid as number[][]
          );
        }

        if (!segment?.length) {
          notify("До этой клетки нет прохода");
          return current;
        }

        notify(`Маршрут продолжен до ${coord}`);
        return [...current, ...segment];
      });
    },
    [columns, notify]
  );

  const buildQuickRoute = useCallback(
    (fromValue?: string, toValue?: string) => {
      const from = (fromValue ?? quickFrom).trim();
      const to = (toValue ?? quickTo).trim();

      if (!coordinateSet.has(from) || !coordinateSet.has(to)) {
        notify("Проверь координаты. Регистр букв важен");
        return false;
      }

      const start = parseCoord(from, columns);
      const finish = parseCoord(to, columns);

      if (
        !start ||
        !finish ||
        gardenMap.grid[start.row]?.[start.col] !== 0 ||
        gardenMap.grid[finish.row]?.[finish.col] !== 0
      ) {
        notify("Начальная и конечная точки должны быть проходами");
        return false;
      }

      if (from === to) {
        setQuickRoute([from]);
        setQuickFrom(from);
        setQuickTo(to);
        notify("Начальная и конечная точки совпадают");
        return true;
      }

      const segment = findWalkablePath(
        from,
        to,
        columns,
        gardenMap.grid as number[][]
      );

      if (!segment?.length) {
        notify("Между этими точками не найден проход");
        return false;
      }

      setQuickFrom(from);
      setQuickTo(to);
      setQuickRoute([from, ...segment]);
      setShowQuickRoute(true);
      notify(`Быстрый маршрут построен: ${segment.length + 1} клеток`);
      return true;
    },
    [columns, coordinateSet, notify, quickFrom, quickTo]
  );

  const handleCellClick = useCallback(
    (coord: string) => {
      setSelectedCoord(coord);

      if (quickClickMode) {
        if (!quickClickStart) {
          const point = parseCoord(coord, columns);

          if (!point || gardenMap.grid[point.row]?.[point.col] !== 0) {
            notify("Выбери проходную клетку");
            return;
          }

          setQuickClickStart(coord);
          setQuickFrom(coord);
          notify(`Начало быстрого маршрута: ${coord}. Выбери конечную точку`);
          return;
        }

        if (buildQuickRoute(quickClickStart, coord)) {
          setQuickClickMode(false);
          setQuickClickStart("");
        }
        return;
      }

      if (routeEditMode) {
        addRouteTo(coord);
        return;
      }

      void copyCoord(coord);
    },
    [
      addRouteTo,
      buildQuickRoute,
      columns,
      copyCoord,
      notify,
      quickClickMode,
      quickClickStart,
      routeEditMode,
    ]
  );

  const addMyMarker = useCallback(() => {
    if (!selectedCoord) {
      notify("Сначала выбери клетку");
      return;
    }

    const label = markerLabel.trim() || "Моя метка";

    setMyMarkers((current) => {
      const exists = current.some((item) => item.coord === selectedCoord);

      if (exists) {
        return current.map((item) =>
          item.coord === selectedCoord ? { ...item, label } : item
        );
      }

      return [...current, { coord: selectedCoord, label }];
    });

    notify(`Метка добавлена: ${selectedCoord}`);
  }, [markerLabel, notify, selectedCoord]);

  const removeMyMarker = useCallback(() => {
    if (!selectedCoord) return;

    setMyMarkers((current) =>
      current.filter((item) => item.coord !== selectedCoord)
    );

    notify(`Метка удалена: ${selectedCoord}`);
  }, [notify, selectedCoord]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      if (event.key === "0") {
        event.preventDefault();
        zoomTo(DEFAULT_CELL);
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomTo(cellSize + 2);
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomTo(cellSize - 2);
      }

      if (
        routeEditMode &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        event.preventDefault();
        setMyRoute((current) => current.slice(0, -1));
      }

      if (event.key === "Escape") {
        setRouteEditMode(false);
        setQuickClickMode(false);
        setQuickClickStart("");
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePressed(false);
        dragState.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [cellSize, copyCoord, hovered, routeEditMode, zoomTo]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const shouldDrag =
      spacePressed ||
      event.button === 1 ||
      (event.pointerType === "touch" && event.isPrimary);

    if (!shouldDrag) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };

    viewport.setPointerCapture(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (!viewport || !dragState.current.active) return;

    viewport.scrollLeft =
      dragState.current.scrollLeft - (event.clientX - dragState.current.startX);
    viewport.scrollTop =
      dragState.current.scrollTop - (event.clientY - dragState.current.startY);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    dragState.current.active = false;
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();
    zoomTo(cellSize + (event.deltaY < 0 ? 2 : -2));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    const [a, b] = [event.touches[0], event.touches[1]];

    touchState.current.startDistance = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY
    );
    touchState.current.startCellSize = cellSize;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !touchState.current.startDistance) return;

    const [a, b] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY
    );
    const ratio = distance / touchState.current.startDistance;

    setCellSize(
      clamp(
        Math.round(touchState.current.startCellSize * ratio),
        MIN_CELL,
        MAX_CELL
      )
    );
  };

  const hoveredRow = hovered?.row ?? -1;
  const hoveredCol = hovered?.col ?? -1;
  const displayCoord = hovered?.coord || selectedCoord;
  const selectedMyMarker = selectedCoord
    ? myMarkerMap.get(selectedCoord)
    : undefined;

  return (
    <main
      className="min-h-screen px-3 py-5 sm:px-6"
      style={{ background: PAGE_BG, color: TEXT }}
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-4">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Сад кошмаров
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Наведи на клетку, чтобы увидеть координату. Клик копирует её,
            а в режиме маршрута — добавляет клетку в твой личный путь.
          </p>
        </header>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <label className="block flex-1">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Найти координату
              </span>
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch();
                  }}
                  placeholder="Например: M27"
                  className={`min-w-0 flex-1 rounded-xl border bg-white px-4 py-2.5 text-center font-bold outline-none transition ${
                    flashCoord === "INVALID"
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-bold hover:bg-slate-50"
                >
                  Найти
                </button>
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => zoomTo(cellSize - 2)}
                className="h-11 min-w-11 rounded-xl border border-slate-300 bg-white font-black hover:bg-slate-50"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => zoomTo(DEFAULT_CELL)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-bold hover:bg-slate-50"
              >
                {Math.round((cellSize / DEFAULT_CELL) * 100)}%
              </button>
              <button
                type="button"
                onClick={() => zoomTo(cellSize + 2)}
                className="h-11 min-w-11 rounded-xl border border-slate-300 bg-white font-black hover:bg-slate-50"
              >
                +
              </button>
            </div>

            <div
              className="min-w-[220px] rounded-xl border px-4 py-2.5 text-center font-black"
              style={{
                borderColor: displayCoord ? ACCENT : "#cbd5e1",
                background: displayCoord ? "#edf7fd" : "#ffffff",
              }}
            >
              {message ||
                (copiedCoord
                  ? `✓ ${copiedCoord} скопировано`
                  : displayCoord || "Наведи на клетку")}
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <p><b>C</b> — скопировать координату.</p>
            <p><b>F</b> — перейти к поиску.</p>
            <p><b>+ / − / 0</b> — изменить масштаб.</p>
            <p><b>Пробел + мышь</b> — двигать карту.</p>
            <p className="sm:col-span-2"><b>Клик по клетке</b> — скопировать координату.</p>
            <p className="sm:col-span-2"><b>Ctrl + колесо</b> или два пальца — масштаб.</p>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <h2 className="text-lg font-black">Слои карты</h2>

              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                <span>
                  <span className="block font-black">
                    Показать сохранённый маршрут
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    Маршрут, бои, точки
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={showSavedRoute}
                  onChange={(event) => setShowSavedRoute(event.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="font-bold">Показать боссов</span>
                <input
                  type="checkbox"
                  checked={showBosses}
                  onChange={(event) => setShowBosses(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              {showBosses && (
                <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                  {adjutants.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-red-500" />
                      <span className="font-bold">Адъютанты:</span>
                      {adjutants.map((boss, index) => (
                        <span key={boss.coord}>
                          <button
                            type="button"
                            onClick={() => centerOnCoord(boss.coord)}
                            className="font-bold text-sky-700 underline decoration-dotted underline-offset-2 hover:text-sky-900"
                            title={`Показать ${boss.coord} на карте`}
                          >
                            {boss.coord}
                          </button>
                          {index < adjutants.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  {kings.map((boss) => (
                    <div
                      key={boss.coord}
                      className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full bg-blue-500" />
                      <span className="font-bold">{boss.label}:</span>
                      <button
                        type="button"
                        onClick={() => centerOnCoord(boss.coord)}
                        className="font-bold text-sky-700 underline decoration-dotted underline-offset-2 hover:text-sky-900"
                        title={`Показать ${boss.coord} на карте`}
                      >
                        {boss.coord}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="font-bold">Мой маршрут</span>
                <input
                  type="checkbox"
                  checked={showMyRoute}
                  onChange={(event) => setShowMyRoute(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="font-bold">Мои метки</span>
                <input
                  type="checkbox"
                  checked={showMyMarkers}
                  onChange={(event) => setShowMyMarkers(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <span className="font-bold">Быстрый маршрут</span>
                <input
                  type="checkbox"
                  checked={showQuickRoute}
                  onChange={(event) => setShowQuickRoute(event.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black">Мой маршрут</h2>
                <span className="text-xs font-bold text-slate-500">
                  {myRoute.length} клеток
                </span>
              </div>

              <button
                type="button"
                onClick={() => setRouteEditMode((current) => !current)}
                className={`mt-3 w-full rounded-xl px-3 py-2.5 font-black ${
                  routeEditMode
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                {routeEditMode
                  ? "Прокладывание включено"
                  : "Проложить свой маршрут"}
              </button>

              <p className="mt-2 text-xs text-slate-600">
                Нажми начальную клетку, затем следующую точку, следующую.. и так далее
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!myRoute.length}
                  onClick={() =>
                    setMyRoute((current) => current.slice(0, -1))
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Отменить шаг
                </button>

                <button
                  type="button"
                  disabled={!myRoute.length}
                  onClick={() => {
                    setMyRoute([]);
                    notify("Личный маршрут очищен");
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Очистить
                </button>
              </div>

              {!!myRoute.length && (
                <div className="mt-3 max-h-32 overflow-auto rounded-xl bg-slate-50 p-3 text-xs leading-5">
                  {myRoute.join(" → ")}
                </div>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Маршрут автоматически сохраняется в этом браузере.
              </p>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black">Быстрый маршрут A → B</h2>
                <span className="text-xs font-bold text-slate-500">
                  {quickRoute.length} клеток
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Построй отдельный путь между любыми двумя проходными
                клетками. Он не соединяется с основным маршрутом.
              </p>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  value={quickFrom}
                  onChange={(event) => setQuickFrom(event.target.value)}
                  placeholder="Откуда"
                  className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuickFrom(quickTo);
                    setQuickTo(quickFrom);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-black"
                  title="Поменять местами"
                >
                  ⇄
                </button>
                <input
                  value={quickTo}
                  onChange={(event) => setQuickTo(event.target.value)}
                  placeholder="Куда"
                  className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => buildQuickRoute()}
                className="mt-2 w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
              >
                Построить по координатам
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickClickMode((current) => !current);
                  setQuickClickStart("");
                  setRouteEditMode(false);
                }}
                className={`mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-black ${
                  quickClickMode
                    ? "bg-emerald-700 text-white"
                    : "border border-emerald-300 bg-white text-emerald-900"
                }`}
              >
                {quickClickMode
                  ? quickClickStart
                    ? `Начало ${quickClickStart} — выбери конец`
                    : "Выбери первую точку на карте"
                  : "Построить двумя кликами"}
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!quickRoute.length}
                  onClick={() => {
                    setMyRoute(quickRoute);
                    setShowMyRoute(true);
                    notify("Быстрый маршрут сохранён как мой маршрут");
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40"
                >
                  Сделать моим
                </button>
                <button
                  type="button"
                  disabled={!quickRoute.length}
                  onClick={() => {
                    setQuickRoute([]);
                    setQuickFrom("");
                    setQuickTo("");
                    setQuickClickStart("");
                    setQuickClickMode(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40"
                >
                  Очистить
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Быстрый маршрут и введённые точки сохраняются в этом браузере.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <h2 className="text-lg font-black">Моя метка</h2>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-black">
                  {selectedCoord || "—"}
                </div>
                {selectedMyMarker && (
                  <div className="mt-1 text-sm font-bold text-teal-700">
                    {selectedMyMarker.label}
                  </div>
                )}
              </div>

              <input
                value={markerLabel}
                onChange={(event) => setMarkerLabel(event.target.value)}
                placeholder="Название метки"
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
              />

              <button
                type="button"
                disabled={!selectedCoord}
                onClick={addMyMarker}
                className="mt-2 w-full rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-black text-white disabled:opacity-40"
              >
                Добавить мою метку
              </button>

              {selectedMyMarker && (
                <button
                  type="button"
                  onClick={removeMyMarker}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                >
                  Удалить мою метку
                </button>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Личные метки видны только тебе и остаются в этом браузере.
              </p>
            </section>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div
              ref={viewportRef}
              className={`relative max-h-[82vh] overflow-auto ${
                isDragging ? "cursor-grabbing" : spacePressed ? "cursor-grab" : ""
              }`}
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <div
                className="grid w-max select-none"
                style={{
                  gridTemplateColumns: `34px repeat(${cols}, ${cellSize}px) 34px`,
                  gridTemplateRows: `34px repeat(${rows}, ${cellSize}px) 34px`,
                  background: PAGE_BG,
                }}
              >
                <div className="sticky left-0 top-0 z-30 bg-[#f5f9ff]" />

                {columns.map((letter, col) => (
                  <div
                    key={`top-${letter}`}
                    className="sticky top-0 z-20 flex items-center justify-center border-b text-xs font-black"
                    style={{
                      height: 34,
                      borderColor: GRID,
                      background: hoveredCol === col ? "#dceefa" : PAGE_BG,
                      color: hoveredCol === col ? ACCENT_STRONG : TEXT,
                    }}
                  >
                    {letter}
                  </div>
                ))}

                <div className="sticky right-0 top-0 z-30 bg-[#f5f9ff]" />

                {gardenMap.grid.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="contents">
                    <div
                      className="sticky left-0 z-20 flex items-center justify-center border-r text-xs font-black"
                      style={{
                        width: 34,
                        borderColor: GRID,
                        background: hoveredRow === rowIndex ? "#dceefa" : PAGE_BG,
                        color: hoveredRow === rowIndex ? ACCENT_STRONG : TEXT,
                      }}
                    >
                      {rowIndex + 1}
                    </div>

                    {row.map((isWall, colIndex) => {
                      const coord = getCoord(colIndex, rowIndex);
                      const isHovered =
                        hoveredRow === rowIndex && hoveredCol === colIndex;
                      const isAxisHovered =
                        hoveredRow === rowIndex || hoveredCol === colIndex;
                      const isSelected = selectedCoord === coord;
                      const isFlashing = flashCoord === coord;
                      const boss = officialBossMap.get(coord);
                      const battle = officialBattleMap.get(coord);
                      const mob = officialMobMap.get(coord);
                      const officialMarker = officialMarkerMap.get(coord);
                      const myMarker = myMarkerMap.get(coord);

                      return (
                        <button
                          key={coord}
                          type="button"
                          aria-label={`Координата ${coord}`}
                          title={coord}
                          onMouseEnter={() =>
                            setHovered({ row: rowIndex, col: colIndex, coord })
                          }
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() =>
                            setHovered({ row: rowIndex, col: colIndex, coord })
                          }
                          onBlur={() => setHovered(null)}
                          onClick={() => handleCellClick(coord)}
                          className="relative m-0 block border-0 p-0 outline-none"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            background: isWall ? WALL : PASSAGE,
                            boxShadow: [
                              `inset -1px -1px 0 ${GRID}`,
                              isAxisHovered
                                ? "inset 0 0 0 1px rgba(127,180,216,.55)"
                                : "",
                              isHovered
                                ? `inset 0 0 0 3px ${ACCENT_STRONG}`
                                : "",
                              isSelected
                                ? `inset 0 0 0 2px ${ACCENT}`
                                : "",
                              isFlashing
                                ? "0 0 0 4px rgba(79,143,186,.55)"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(","),
                            zIndex: isHovered || isFlashing ? 10 : 1,
                          }}
                        >
                          {showSavedRoute && officialRouteSet.has(coord) && (
                            <span
                              className="absolute inset-[18%] rounded-sm"
                              style={{
                                background: "rgba(245,158,11,.82)",
                                boxShadow:
                                  "0 0 0 1px rgba(146,64,14,.55)",
                              }}
                            />
                          )}

                          {showMyRoute && myRouteSet.has(coord) && (
                            <span
                              className="absolute inset-[28%] z-10 rounded-full"
                              style={{
                                background: PERSONAL_ROUTE,
                                boxShadow: "0 0 0 1px rgba(255,255,255,.9)",
                              }}
                            />
                          )}

                          {showQuickRoute && quickRouteSet.has(coord) && (
                            <span
                              className="absolute inset-[36%] z-20 rounded-full bg-emerald-500"
                              style={{
                                boxShadow: "0 0 0 1px rgba(255,255,255,.95)",
                              }}
                            />
                          )}

                          {showSavedRoute &&
                            officialDangerSet.has(coord) && (
                              <svg
                                viewBox="0 0 24 24"
                                className="absolute inset-[10%] z-20"
                                aria-label="Опасное место"
                              >
                                <path
                                  d="M12 2.8 22 20.5H2Z"
                                  fill="#facc15"
                                  stroke="#854d0e"
                                  strokeWidth="1.7"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 8v6"
                                  stroke="#422006"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                />
                                <circle
                                  cx="12"
                                  cy="17.2"
                                  r="1.15"
                                  fill="#422006"
                                />
                              </svg>
                            )}

                          {showSavedRoute && battle && (
                            <span
                              className="absolute inset-[-8%] z-20 flex items-center justify-center text-[16px] font-black leading-none drop-shadow"
                              title={battle.label}
                            >
                              ⚔
                            </span>
                          )}

                          {showSavedRoute && mob && (
                            <svg
                              viewBox="0 0 24 24"
                              className="absolute inset-[8%] z-20"
                              aria-label={mob.label}
                            >
                              <title>{mob.label}</title>
                              <path
                                d="M8.7 7.1 7 2.8l3.1 2L12 2.4l1.9 2.4 3.1-2-1.7 4.3-1.5 1.6h-3.6Z"
                                fill="#090909"
                              />
                              <path
                                d="M5.2 10.3 9 8.4l1.5 1.3h3l1.5-1.3 3.8 1.9-3.3 1.1H8.5Z"
                                fill="#090909"
                              />
                              <path
                                d="M12 10.1v6.3M8.4 11.3 5.6 15M15.6 11.3l2.8 3.7M12 16.4l-2.8 4M12 16.4l2.8 4"
                                fill="none"
                                stroke="#090909"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}

                          {showBosses && boss && (
                            <span
                              className={`absolute inset-[20%] z-20 rounded-full ring-2 ring-white ${
                                boss.kind === "king"
                                  ? "bg-blue-600"
                                  : "bg-red-600"
                              }`}
                              title={boss.label}
                            />
                          )}

                          {showSavedRoute && officialMarker && (
                            <span
                              className="absolute left-[8%] top-[8%] z-20 h-[42%] w-[42%] rounded-full bg-violet-500 ring-1 ring-white"
                              title={officialMarker.label}
                            />
                          )}

                          {showMyMarkers && myMarker && (
                            <span
                              className="absolute bottom-[7%] right-[7%] z-30 h-[45%] w-[45%] rounded-full ring-1 ring-white"
                              style={{ background: PERSONAL_MARKER }}
                              title={myMarker.label}
                            />
                          )}

                          {isHovered && (
                            <span
                              className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black shadow"
                              style={{
                                background: "#ffffff",
                                color: TEXT,
                                border: `1px solid ${ACCENT}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {coord}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <div
                      className="sticky right-0 z-20 flex items-center justify-center border-l text-xs font-black"
                      style={{
                        width: 34,
                        borderColor: GRID,
                        background: hoveredRow === rowIndex ? "#dceefa" : PAGE_BG,
                        color: hoveredRow === rowIndex ? ACCENT_STRONG : TEXT,
                      }}
                    >
                      {rowIndex + 1}
                    </div>
                  </div>
                ))}

                <div className="sticky bottom-0 left-0 z-30 bg-[#f5f9ff]" />

                {columns.map((letter, col) => (
                  <div
                    key={`bottom-${letter}`}
                    className="sticky bottom-0 z-20 flex items-center justify-center border-t text-xs font-black"
                    style={{
                      height: 34,
                      borderColor: GRID,
                      background: hoveredCol === col ? "#dceefa" : PAGE_BG,
                      color: hoveredCol === col ? ACCENT_STRONG : TEXT,
                    }}
                  >
                    {letter}
                  </div>
                ))}

                <div className="sticky bottom-0 right-0 z-30 bg-[#f5f9ff]" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}