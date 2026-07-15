"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import shadowMap from "../../../../data/shadow-forest-map.json";
import officialLayers from "../../../../data/shadow-forest-layers.json";

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

type HoveredCell = {
  row: number;
  col: number;
  coord: string;
} | null;

type Boss = {
  coord: string;
  kind: "adjutant" | "king";
  label: string;
};

type CustomMarker = {
  coord: string;
  label: string;
};

type BattleMarker = {
  coord: string;
  label: string;
};

type MobMarker = {
  coord: string;
  label: string;
};

type EditorSnapshot = {
  route: string[];
  dangerCells: string[];
  customMarkers: CustomMarker[];
  battleMarkers: BattleMarker[];
  mobMarkers: MobMarker[];
  bosses: Boss[];
};

const EMPTY_ROUTE: string[] = [];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCoord(value: string) {
  return value.trim();
}

function parseCoord(coord: string, columns: string[]) {
  const col = columns.indexOf(coord.charAt(0));
  const row = Number(coord.slice(1)) - 1;

  if (col < 0 || !Number.isInteger(row) || row < 0) {
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

  if (!start || !end) return null;
  if (grid[end.row]?.[end.col] !== 0) return null;

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


function findWalkablePathAvoiding(
  from: string,
  to: string,
  columns: string[],
  grid: number[][],
  blockedCoord: string
): string[] | null {
  const start = parseCoord(from, columns);
  const end = parseCoord(to, columns);

  if (!start || !end) return null;

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
      return reversed.slice(1, -1);
    }

    for (const { dc, dr } of directions) {
      const col = current.col + dc;
      const row = current.row + dr;
      const coord = `${columns[col] ?? ""}${row + 1}`;

      if (
        col < 0 ||
        row < 0 ||
        col >= columns.length ||
        row >= grid.length ||
        grid[row]?.[col] !== 0 ||
        coord === blockedCoord
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

export default function ShadowForestEditorPage() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [cellSize, setCellSize] = useState(DEFAULT_CELL);
  const [hovered, setHovered] = useState<HoveredCell>(null);
  const [selectedCoord, setSelectedCoord] = useState("");
  const [copiedCoord, setCopiedCoord] = useState("");
  const [query, setQuery] = useState("");
  const [flashCoord, setFlashCoord] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);

  const [showBosses, setShowBosses] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showDanger, setShowDanger] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showBattles, setShowBattles] = useState(true);
  const [showMobs, setShowMobs] = useState(true);

  const [routeEditMode, setRouteEditMode] = useState(false);
  const [route, setRoute] = useState<string[]>(officialLayers.route ?? EMPTY_ROUTE);
  const [routeCursorIndex, setRouteCursorIndex] = useState<number | null>(null);
  const [dangerCells, setDangerCells] = useState<string[]>(officialLayers.dangerCells ?? []);
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(officialLayers.customMarkers ?? []);
  const [battleMarkers, setBattleMarkers] = useState<BattleMarker[]>(officialLayers.battleMarkers ?? []);
  const [mobMarkers, setMobMarkers] = useState<MobMarker[]>(officialLayers.mobMarkers ?? []);
  const [bosses, setBosses] = useState<Boss[]>((officialLayers.bosses ?? []) as Boss[]);
  const [markerLabel, setMarkerLabel] = useState("Метка");
  const [battleLabel, setBattleLabel] = useState("Бой");
  const [mobLabel, setMobLabel] = useState("Моб");
  const [message, setMessage] = useState("");
  const [publishKey, setPublishKey] = useState("");
  const [changeText, setChangeText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [timelineQuery, setTimelineQuery] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [historyPast, setHistoryPast] = useState<EditorSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorSnapshot[]>([]);
  const skipHistoryRef = useRef(false);

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

  const columns = shadowMap.columns;
  const rows = shadowMap.height;
  const cols = shadowMap.width;

  const notify = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => {
      setMessage((current) => (current === text ? "" : current));
    }, 1600);
  }, []);

  const currentSnapshot = useCallback(
    (): EditorSnapshot => ({
      route: [...route],
      dangerCells: [...dangerCells],
      customMarkers: customMarkers.map((item) => ({ ...item })),
      battleMarkers: battleMarkers.map((item) => ({ ...item })),
      mobMarkers: mobMarkers.map((item) => ({ ...item })),
      bosses: bosses.map((item) => ({ ...item })),
    }),
    [battleMarkers, bosses, customMarkers, dangerCells, mobMarkers, route]
  );

  const applySnapshot = useCallback((snapshot: EditorSnapshot) => {
    skipHistoryRef.current = true;
    setRoute([...snapshot.route]);
    setDangerCells([...snapshot.dangerCells]);
    setCustomMarkers(snapshot.customMarkers.map((item) => ({ ...item })));
    setBattleMarkers(snapshot.battleMarkers.map((item) => ({ ...item })));
    setMobMarkers(snapshot.mobMarkers.map((item) => ({ ...item })));
    setBosses(snapshot.bosses.map((item) => ({ ...item })));
    setRouteCursorIndex(
      snapshot.route.length > 0 ? snapshot.route.length - 1 : null
    );
  }, []);

  const rememberBeforeChange = useCallback(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }

    setHistoryPast((current) => {
      const next = [...current, currentSnapshot()];
      return next.length > 80 ? next.slice(next.length - 80) : next;
    });
    setHistoryFuture([]);
  }, [currentSnapshot]);

  const undo = useCallback(() => {
    setHistoryPast((past) => {
      if (!past.length) return past;

      const previous = past[past.length - 1];
      setHistoryFuture((future) => [currentSnapshot(), ...future].slice(0, 80));
      applySnapshot(previous);
      notify("Последнее изменение отменено");

      return past.slice(0, -1);
    });
  }, [applySnapshot, currentSnapshot, notify]);

  const redo = useCallback(() => {
    setHistoryFuture((future) => {
      if (!future.length) return future;

      const next = future[0];
      setHistoryPast((past) => [...past, currentSnapshot()].slice(-80));
      applySnapshot(next);
      notify("Изменение возвращено");

      return future.slice(1);
    });
  }, [applySnapshot, currentSnapshot, notify]);

  const coordinateSet = useMemo(() => {
    const set = new Set<string>();
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        set.add(`${columns[col]}${row + 1}`);
      }
    }
    return set;
  }, [columns, cols, rows]);

  const bossesByCoord = useMemo(
    () => new Map(bosses.map((boss) => [boss.coord, boss])),
    [bosses]
  );

  const routeStepsByCoord = useMemo(() => {
    const map = new Map<string, number[]>();

    route.forEach((coord, index) => {
      const steps = map.get(coord) ?? [];
      steps.push(index + 1);
      map.set(coord, steps);
    });

    return map;
  }, [route]);

  const dangerSet = useMemo(() => new Set(dangerCells), [dangerCells]);

  const markerMap = useMemo(
    () => new Map(customMarkers.map((marker) => [marker.coord, marker])),
    [customMarkers]
  );

  const battleMap = useMemo(
    () => new Map(battleMarkers.map((marker) => [marker.coord, marker])),
    [battleMarkers]
  );

  const mobMap = useMemo(
    () => new Map(mobMarkers.map((marker) => [marker.coord, marker])),
    [mobMarkers]
  );

  const getCoord = useCallback(
    (col: number, row: number) => `${columns[col]}${row + 1}`,
    [columns]
  );

  useEffect(() => {
    try {
      const storedRoute = localStorage.getItem("shadow-forest-route-case-v2");
      const storedDanger = localStorage.getItem("shadow-forest-danger-case-v2");
      const storedMarkers = localStorage.getItem("shadow-forest-markers-case-v2");
      const storedBattles = localStorage.getItem("shadow-forest-battles-case-v2");
      const storedMobs = localStorage.getItem("shadow-forest-mobs-case-v2");
      const storedBosses = localStorage.getItem("shadow-forest-bosses-case-v2");

      if (storedRoute) setRoute(JSON.parse(storedRoute));
      if (storedDanger) setDangerCells(JSON.parse(storedDanger));
      if (storedMarkers) setCustomMarkers(JSON.parse(storedMarkers));
      if (storedBattles) setBattleMarkers(JSON.parse(storedBattles));
      if (storedMobs) setMobMarkers(JSON.parse(storedMobs));
      if (storedBosses) setBosses(JSON.parse(storedBosses));
    } catch {
      // Повреждённые локальные данные просто игнорируем.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shadow-forest-route-case-v2", JSON.stringify(route));
  }, [route]);

  useEffect(() => {
    localStorage.setItem("shadow-forest-danger-case-v2", JSON.stringify(dangerCells));
  }, [dangerCells]);

  useEffect(() => {
    localStorage.setItem("shadow-forest-markers-case-v2", JSON.stringify(customMarkers));
  }, [customMarkers]);

  useEffect(() => {
    localStorage.setItem("shadow-forest-battles-case-v2", JSON.stringify(battleMarkers));
  }, [battleMarkers]);

  useEffect(() => {
    localStorage.setItem("shadow-forest-mobs-case-v2", JSON.stringify(mobMarkers));
  }, [mobMarkers]);

  useEffect(() => {
    localStorage.setItem("shadow-forest-bosses-case-v2", JSON.stringify(bosses));
  }, [bosses]);

  const copyCoord = useCallback(
    async (coord: string) => {
      if (!coord) return;

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
    [notify, rememberBeforeChange]
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
      const normalized = normalizeCoord(coord);
      if (!coordinateSet.has(normalized)) return false;

      const letter = normalized.charAt(0);
      const rowNumber = Number(normalized.slice(1));
      const col = columns.indexOf(letter);
      const row = rowNumber - 1;
      const viewport = viewportRef.current;

      if (!viewport || col < 0 || row < 0) return false;

      const labelSize = 34;
      const targetX = labelSize + col * cellSize + cellSize / 2;
      const targetY = labelSize + row * cellSize + cellSize / 2;

      viewport.scrollTo({
        left: Math.max(0, targetX - viewport.clientWidth / 2),
        top: Math.max(0, targetY - viewport.clientHeight / 2),
        behavior: "smooth",
      });

      setFlashCoord(normalized);
      setSelectedCoord(normalized);

      window.setTimeout(() => {
        setFlashCoord((current) => (current === normalized ? "" : current));
      }, 1500);

      return true;
    },
    [cellSize, columns, coordinateSet]
  );

  const handleSearch = useCallback(() => {
    const normalized = normalizeCoord(query);
    if (!centerOnCoord(normalized)) {
      setFlashCoord("INVALID");
      notify("Такой координаты нет");
      window.setTimeout(() => setFlashCoord(""), 900);
    }
  }, [centerOnCoord, notify, query]);

  const handleCellClick = useCallback(
    (coord: string) => {
      setSelectedCoord(coord);

      if (routeEditMode) {
        rememberBeforeChange();
        setRoute((current) => {
          const target = parseCoord(coord, columns);

          if (!target || shadowMap.grid[target.row]?.[target.col] !== 0) {
            notify("Маршрут можно прокладывать только по проходам");
            return current;
          }

          if (current.length === 0) {
            setRouteCursorIndex(0);
            return [coord];
          }

          const cursor =
            routeCursorIndex !== null &&
            routeCursorIndex >= 0 &&
            routeCursorIndex < current.length
              ? routeCursorIndex
              : current.length - 1;

          const startCoord = current[cursor];

          const straightSegment = getStraightSegment(
            startCoord,
            coord,
            columns
          );

          let segment = straightSegment;

          if (straightSegment) {
            const blocked = straightSegment.find((item) => {
              const point = parseCoord(item, columns);
              return (
                !point ||
                shadowMap.grid[point.row]?.[point.col] !== 0
              );
            });

            if (blocked) {
              segment = null;
            }
          }

          if (!segment) {
            segment = findWalkablePath(
              startCoord,
              coord,
              columns,
              shadowMap.grid as number[][]
            );
          }

          if (!segment || segment.length === 0) {
            notify("До этой клетки нет прохода");
            return current;
          }

          const insertAt = cursor + 1;
          const next = [
            ...current.slice(0, insertAt),
            ...segment,
            ...current.slice(insertAt),
          ];

          setRouteCursorIndex(cursor + segment.length);

          const isMiddleInsert = cursor < current.length - 1;

          notify(
            isMiddleInsert
              ? `Ответвление вставлено после шага №${cursor + 1}`
              : `Маршрут продолжен до ${coord}`
          );

          return next;
        });
        return;
      }

      void copyCoord(coord);
    },
    [
      columns,
      copyCoord,
      notify,
      rememberBeforeChange,
      routeCursorIndex,
      routeEditMode,
    ]
  );

  const toggleDanger = useCallback(
    (coord: string) => {
      rememberBeforeChange();
      setDangerCells((current) =>
        current.includes(coord)
          ? current.filter((item) => item !== coord)
          : [...current, coord]
      );
    },
    [rememberBeforeChange]
  );

  const addMarker = useCallback(
    (coord: string) => {
      const label = markerLabel.trim() || "Метка";
      rememberBeforeChange();

      setCustomMarkers((current) => {
        const exists = current.find((item) => item.coord === coord);
        if (exists) {
          return current.map((item) =>
            item.coord === coord ? { ...item, label } : item
          );
        }

        return [...current, { coord, label }];
      });

      notify(`Метка добавлена: ${coord}`);
    },
    [markerLabel, notify, rememberBeforeChange]
  );

  const removeMarker = useCallback(
    (coord: string) => {
      rememberBeforeChange();
      setCustomMarkers((current) =>
        current.filter((item) => item.coord !== coord)
      );
      notify(`Метка удалена: ${coord}`);
    },
    [notify, rememberBeforeChange]
  );

  const addBattle = useCallback(
    (coord: string) => {
      const label = battleLabel.trim() || "Бой";
      rememberBeforeChange();

      setBattleMarkers((current) => {
        const exists = current.find((item) => item.coord === coord);

        if (exists) {
          return current.map((item) =>
            item.coord === coord ? { ...item, label } : item
          );
        }

        return [...current, { coord, label }];
      });

      notify(`Бой добавлен: ${coord}`);
    },
    [battleLabel, notify, rememberBeforeChange]
  );

  const removeBattle = useCallback(
    (coord: string) => {
      rememberBeforeChange();
      setBattleMarkers((current) =>
        current.filter((item) => item.coord !== coord)
      );
      notify(`Бой удалён: ${coord}`);
    },
    [notify, rememberBeforeChange]
  );

  const addMob = useCallback(
    (coord: string) => {
      const label = mobLabel.trim() || "Моб";
      rememberBeforeChange();

      setMobMarkers((current) => {
        const exists = current.find((item) => item.coord === coord);
        if (exists) {
          return current.map((item) =>
            item.coord === coord ? { ...item, label } : item
          );
        }
        return [...current, { coord, label }];
      });

      notify(`Моб добавлен: ${coord}`);
    },
    [mobLabel, notify, rememberBeforeChange]
  );

  const removeMob = useCallback(
    (coord: string) => {
      rememberBeforeChange();
      setMobMarkers((current) => current.filter((item) => item.coord !== coord));
      notify(`Моб удалён: ${coord}`);
    },
    [notify, rememberBeforeChange]
  );

  const publishOfficialLayers = useCallback(async () => {
    const key = publishKey.trim();

    if (!key) {
      const text = "Введи ключ публикации";
      setPublishStatus({ type: "error", text });
      notify(text);
      return;
    }

    setPublishStatus({
      type: "info",
      text: "Публикую файл в GitHub…",
    });
    setIsPublishing(true);

    try {
      const changes = changeText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const nextVersion =
        Number(
          (officialLayers as { version?: number }).version ?? 0
        ) + 1;

      const response = await fetch("/api/les-teney/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-shadow-forest-publish-key": key,
        },
        body: JSON.stringify({
          version: nextVersion,
          updatedAt: new Date().toISOString(),
          changes,
          route,
          dangerCells,
          customMarkers,
          battleMarkers,
          bosses,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Не удалось опубликовать");
      }

      const text =
        `Версия ${nextVersion} опубликована. Vercel уже обновляет сайт`;
      setPublishStatus({ type: "success", text });
      notify(text);
      setChangeText("");
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Ошибка публикации";
      setPublishStatus({ type: "error", text });
      notify(text);
    } finally {
      setIsPublishing(false);
    }
  }, [
    battleMarkers,
    changeText,
    customMarkers,
    dangerCells,
    notify,
    publishKey,
    route,
  ]);

  const exportLayers = useCallback(() => {
    const payload = {
      route,
      dangerCells,
      customMarkers,
      battleMarkers,
      bosses,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shadow-forest-layers.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [battleMarkers, bosses, customMarkers, dangerCells, mobMarkers, route]);


  const setBoss = useCallback((coord: string, kind: "adjutant" | "king") => {
    if (!coord) { notify("Сначала выбери клетку"); return; }
    rememberBeforeChange();
    setBosses((current) => [
      ...current.filter((item) => item.coord !== coord),
      { coord, kind, label: kind === "king" ? "Царь" : "Адъютант" },
    ]);
    notify(kind === "king" ? "Царь добавлен" : "Адъютант добавлен");
  }, [notify, rememberBeforeChange]);

  const removeBoss = useCallback((coord: string) => {
    if (!coord) return;
    rememberBeforeChange();
    setBosses((current) => current.filter((item) => item.coord !== coord));
    notify("Босс удалён");
  }, [notify, rememberBeforeChange]);

  const removeRouteStep = useCallback(
    (stepNumber: number) => {
      const index = stepNumber - 1;

      if (index < 0 || index >= route.length) return;

    rememberBeforeChange();
      setRoute((current) => {
        if (index < 0 || index >= current.length) return current;

        if (current.length === 1) {
          setRouteCursorIndex(null);
          notify(`Шаг №${stepNumber} удалён`);
          return [];
        }

        if (index === 0) {
          setRouteCursorIndex(0);
          notify(`Шаг №${stepNumber} удалён`);
          return current.slice(1);
        }

        if (index === current.length - 1) {
          setRouteCursorIndex(current.length - 2);
          notify(`Шаг №${stepNumber} удалён`);
          return current.slice(0, -1);
        }

        const previousCoord = current[index - 1];
        const removedCoord = current[index];
        const nextCoord = current[index + 1];

        const previousPoint = parseCoord(previousCoord, columns);
        const nextPoint = parseCoord(nextCoord, columns);

        if (!previousPoint || !nextPoint) return current;

        const areNeighbours =
          Math.abs(previousPoint.col - nextPoint.col) +
            Math.abs(previousPoint.row - nextPoint.row) ===
          1;

        if (areNeighbours) {
          const next = [
            ...current.slice(0, index),
            ...current.slice(index + 1),
          ];
          setRouteCursorIndex(Math.max(0, index - 1));
          notify(`Шаг №${stepNumber} удалён`);
          return next;
        }

        const bridge = findWalkablePathAvoiding(
          previousCoord,
          nextCoord,
          columns,
          shadowMap.grid as number[][],
          removedCoord
        );

        if (bridge === null) {
          notify(
            `Точку ${removedCoord} нельзя удалить отдельно: без неё маршрут разрывается`
          );
          return current;
        }

        const next = [
          ...current.slice(0, index),
          ...bridge,
          ...current.slice(index + 1),
        ];

        setRouteCursorIndex(Math.max(0, index - 1 + bridge.length));
        notify(
          bridge.length > 0
            ? `Шаг №${stepNumber} удалён, обход добавлен автоматически`
            : `Шаг №${stepNumber} удалён`
        );

        return next;
      });
    },
    [columns, notify, rememberBeforeChange, route]
  );

  const continueRouteFromStep = useCallback(
    (stepNumber: number) => {
      const index = stepNumber - 1;

      if (index < 0 || index >= route.length) return;

      setRouteCursorIndex(index);
      setRouteEditMode(true);
      setSelectedCoord(route[index]);
      notify(`Продолжение маршрута после шага №${stepNumber}`);
    },
    [notify, route]
  );

  const continueRouteFromEnd = useCallback(() => {
    if (!route.length) return;

    setRouteCursorIndex(route.length - 1);
    setRouteEditMode(true);
    setSelectedCoord(route[route.length - 1]);
    notify("Продолжение маршрута с последней клетки");
  }, [notify, route]);

  const undoRouteStep = useCallback(() => {
    rememberBeforeChange();
    setRoute((current) => {
      if (!current.length) return current;

      const cursor =
        routeCursorIndex !== null &&
        routeCursorIndex >= 0 &&
        routeCursorIndex < current.length
          ? routeCursorIndex
          : current.length - 1;

      if (cursor <= 0) {
        setRouteCursorIndex(null);
        return current.slice(1);
      }

      const next = [
        ...current.slice(0, cursor),
        ...current.slice(cursor + 1),
      ];

      setRouteCursorIndex(cursor - 1);
      return next;
    });
  }, [rememberBeforeChange, routeCursorIndex]);

  const importLayers = useCallback(
    (file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          rememberBeforeChange();

          if (Array.isArray(parsed.route)) {
            setRoute(parsed.route);
            setRouteCursorIndex(
              parsed.route.length > 0 ? parsed.route.length - 1 : null
            );
          }
          if (Array.isArray(parsed.dangerCells)) {
            setDangerCells(parsed.dangerCells);
          }
          if (Array.isArray(parsed.customMarkers)) {
            setCustomMarkers(parsed.customMarkers);
          }
          if (Array.isArray(parsed.battleMarkers)) {
            setBattleMarkers(parsed.battleMarkers);
          }
          if (Array.isArray(parsed.mobMarkers)) {
            setMobMarkers(parsed.mobMarkers);
          }

          notify("Слои загружены");
        } catch {
          notify("Не удалось прочитать файл");
        }
      };

      reader.readAsText(file);
    },
    [notify]
  );

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

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "y" ||
          (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
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

      if (event.key === "Escape" && routeEditMode) {
        setRouteEditMode(false);
      }

      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        routeEditMode
      ) {
        event.preventDefault();
        undoRouteStep();
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
  }, [
    cellSize,
    copyCoord,
    hovered,
    redo,
    routeEditMode,
    undo,
    undoRouteStep,
    zoomTo,
  ]);

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
  const activeCoord = selectedCoord || hovered?.coord || "";
  const activeBoss = activeCoord ? bossesByCoord.get(activeCoord) : undefined;
  const activeMarker = activeCoord ? markerMap.get(activeCoord) : undefined;
  const activeBattle = activeCoord ? battleMap.get(activeCoord) : undefined;
  const activeMob = activeCoord ? mobMap.get(activeCoord) : undefined;
  const activeRouteSteps =
    activeCoord && routeStepsByCoord.has(activeCoord)
      ? routeStepsByCoord.get(activeCoord) ?? []
      : [];

  const filteredTimelineSteps = useMemo(() => {
    const query = timelineQuery.trim();

    return route
      .map((coord, index) => ({ coord, step: index + 1 }))
      .filter((item) => {
        if (!query) return true;

        if (/^\d+$/.test(query)) {
          return String(item.step).includes(query);
        }

        return item.coord === query || item.coord.includes(query);
      });
  }, [route, timelineQuery]);

  return (
    <main
      className="min-h-screen px-3 py-5 sm:px-6"
      style={{ background: PAGE_BG, color: TEXT }}
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Лес Теней — редактор
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Официальный маршрут, слои и временная шкала шагов.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!historyPast.length}
              onClick={undo}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
              title="Отменить (Ctrl+Z)"
            >
              ↶ Отменить
            </button>
            <button
              type="button"
              disabled={!historyFuture.length}
              onClick={redo}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
              title="Вернуть (Ctrl+Y или Ctrl+Shift+Z)"
            >
              ↷ Вернуть
            </button>
          </div>
        </header>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
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
                  : displayCoord || "Наведите на клетку")}
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <p><b>C</b> — скопировать координату под курсором.</p>
            <p><b>F</b> — перейти к поиску.</p>
            <p><b>+ / − / 0</b> — изменить масштаб.</p>
            <p><b>Пробел + мышь</b> — перетащить карту.</p>
            <p><b>Ctrl+Z</b> — отменить действие.</p>
            <p><b>Ctrl+Y</b> — вернуть действие.</p>
            <p className="sm:col-span-2"><b>Клик по клетке</b> — скопировать координату.</p>
            <p className="sm:col-span-2"><b>Ctrl + колесо</b> или два пальца — масштаб.</p>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-black">Слои карты</h2>

              <div className="space-y-2 text-sm">
                {[
                  ["Боссы", showBosses, setShowBosses],
                  ["Маршрут", showRoute, setShowRoute],
                  ["Опасные места", showDanger, setShowDanger],
                  ["Мои метки", showMarkers, setShowMarkers],
                  ["Бои", showBattles, setShowBattles],
                  ["Мобы", showMobs, setShowMobs],
                ].map(([label, checked, setter]) => (
                  <label
                    key={String(label)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                  >
                    <span className="font-bold">{String(label)}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(checked)}
                      onChange={(event) =>
                        (setter as (value: boolean) => void)(event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <p><span className="inline-block h-3 w-3 rounded-full bg-red-500" /> Адъютант</p>
                <p><span className="inline-block h-3 w-3 rounded-full bg-blue-500" /> Царь</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black">Маршрут</h2>
                <span className="text-xs font-bold text-slate-500">
                  {route.length} клеток
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRouteEditMode((current) => {
                    const next = !current;

                    if (next && route.length > 0 && routeCursorIndex === null) {
                      setRouteCursorIndex(route.length - 1);
                    }

                    return next;
                  });
                }}
                className={`mt-3 w-full rounded-xl px-3 py-2.5 font-black ${
                  routeEditMode
                    ? "bg-sky-600 text-white"
                    : "border border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                {routeEditMode ? "Редактор включён" : "Рисовать маршрут"}
              </button>

              <p className="mt-2 text-xs text-slate-600">
                Обычно маршрут продолжается с последней клетки. Чтобы вставить новый
                заход в середину старого маршрута, выключи редактор, выбери нужную
                клетку и нажми ниже «Вставить после шага №…». Затем нарисуй заход
                и возвращение: старая часть маршрута после точки вставки сохранится.
              </p>

              {route.length > 0 && (
                <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">
                  Точка продолжения:{" "}
                  <b>
                    {routeCursorIndex !== null && route[routeCursorIndex]
                      ? `${route[routeCursorIndex]} — шаг №${routeCursorIndex + 1}`
                      : `${route[route.length - 1]} — конец маршрута`}
                  </b>
                </div>
              )}

              {route.length > 0 && routeCursorIndex !== route.length - 1 && (
                <button
                  type="button"
                  onClick={continueRouteFromEnd}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50"
                >
                  Продолжать с конца маршрута
                </button>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={undoRouteStep}
                  disabled={!route.length}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Отменить шаг
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rememberBeforeChange();
                    setRoute([]);
                    setRouteCursorIndex(null);
                    notify("Маршрут очищен");
                  }}
                  disabled={!route.length}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  Очистить
                </button>
              </div>

              {!!route.length && (
                <div className="mt-3 max-h-36 overflow-auto rounded-xl bg-slate-50 p-3 text-xs leading-5">
                  {route.join(" → ")}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="text-lg font-black">Выбранная клетка</h2>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center">
                <div className="text-2xl font-black">
                  {activeCoord || "—"}
                </div>

                {activeBoss && (
                  <div className="mt-1 text-sm font-bold">
                    {activeBoss.label}
                  </div>
                )}

                {activeCoord && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setBoss(activeCoord, "adjutant")} className="rounded-lg bg-red-600 px-2 py-2 text-xs font-black text-white">Адъютант</button>
                    <button type="button" onClick={() => setBoss(activeCoord, "king")} className="rounded-lg bg-blue-600 px-2 py-2 text-xs font-black text-white">Царь</button>
                    {activeBoss && (
                      <button type="button" onClick={() => removeBoss(activeCoord)} className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-black text-red-700">Удалить босса</button>
                    )}
                  </div>
                )}

                {activeMarker && (
                  <div className="mt-1 text-sm font-bold">
                    {activeMarker.label}
                  </div>
                )}

                {activeBattle && (
                  <div className="mt-1 text-sm font-bold">
                    ⚔ {activeBattle.label}
                  </div>
                )}

                {activeMob && (
                  <div className="mt-1 text-sm font-bold">
                    ◼ {activeMob.label}
                  </div>
                )}

                {activeRouteSteps.length > 0 && (
                  <div className="mt-1 text-xs text-slate-600">
                    {activeRouteSteps.length === 1
                      ? `Шаг маршрута №${activeRouteSteps[0]}`
                      : `Шаги маршрута: ${activeRouteSteps.join(", ")}`}
                  </div>
                )}
              </div>

              {activeRouteSteps.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-bold text-slate-500">
                    Редактировать маршрут:
                  </div>

                  {activeRouteSteps.map((step) => (
                    <div
                      key={`route-step-${step}`}
                      className="grid grid-cols-[1fr_auto] gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => continueRouteFromStep(step)}
                        className="rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 hover:bg-sky-100"
                      >
                        Вставить после шага №{step}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeRouteStep(step)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                        title={`Удалить шаг №${step}`}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  disabled={!activeCoord}
                  onClick={() => activeCoord && toggleDanger(activeCoord)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  {activeCoord && dangerSet.has(activeCoord)
                    ? "Убрать опасную точку"
                    : "Отметить как опасную"}
                </button>

                <input
                  value={markerLabel}
                  onChange={(event) => setMarkerLabel(event.target.value)}
                  placeholder="Название метки"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                />

                <button
                  type="button"
                  disabled={!activeCoord}
                  onClick={() => activeCoord && addMarker(activeCoord)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  {activeCoord && markerMap.has(activeCoord)
                    ? "Изменить метку"
                    : "Добавить свою метку"}
                </button>

                {activeCoord && markerMap.has(activeCoord) && (
                  <button
                    type="button"
                    onClick={() => removeMarker(activeCoord)}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                  >
                    Удалить метку
                  </button>
                )}

                <div className="my-1 border-t border-slate-200" />

                <input
                  value={battleLabel}
                  onChange={(event) => setBattleLabel(event.target.value)}
                  placeholder="Название боя"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                />

                <button
                  type="button"
                  disabled={!activeCoord}
                  onClick={() =>
                    activeCoord &&
                    (battleMap.has(activeCoord)
                      ? removeBattle(activeCoord)
                      : addBattle(activeCoord))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  {activeCoord && battleMap.has(activeCoord)
                    ? "Убрать бой"
                    : "Добавить бой"}
                </button>

                <div className="my-1 border-t border-slate-200" />

                <input
                  value={mobLabel}
                  onChange={(event) => setMobLabel(event.target.value)}
                  placeholder="Название моба"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                />

                <button
                  type="button"
                  disabled={!activeCoord}
                  onClick={() =>
                    activeCoord &&
                    (mobMap.has(activeCoord)
                      ? removeMob(activeCoord)
                      : addMob(activeCoord))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40"
                >
                  {activeCoord && mobMap.has(activeCoord)
                    ? "Убрать моба"
                    : "Добавить моба"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setTimelineOpen((current) => !current)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-lg font-black">Шаги маршрута</span>
                <span className="text-sm font-bold text-slate-500">
                  {timelineOpen ? "Скрыть" : "Показать"} · {route.length}
                </span>
              </button>

              {timelineOpen && (
                <>
                  <input
                    value={timelineQuery}
                    onChange={(event) => setTimelineQuery(event.target.value)}
                    placeholder="Найти координату или номер шага"
                    className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Нажмите шаг — карта перейдёт к клетке. Кнопка «Вставить
                    после» делает этот шаг точкой продолжения маршрута.
                  </p>

                  <div className="mt-3 max-h-80 space-y-1 overflow-auto pr-1">
                    {filteredTimelineSteps.map(({ coord, step }) => (
                      <div
                        key={`${step}-${coord}`}
                        className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
                          routeCursorIndex === step - 1
                            ? "border-sky-400 bg-sky-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCoord(coord);
                            centerOnCoord(coord);
                          }}
                          className="min-w-0 flex-1 truncate text-left text-sm font-bold"
                        >
                          <span className="mr-2 text-slate-400">#{step}</span>
                          {coord}
                        </button>

                        <button
                          type="button"
                          onClick={() => continueRouteFromStep(step)}
                          className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-xs font-black text-sky-900 hover:bg-sky-200"
                        >
                          Вставить после
                        </button>

                        <button
                          type="button"
                          onClick={() => removeRouteStep(step)}
                          className="shrink-0 rounded-lg bg-red-50 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-100"
                          title={`Удалить шаг №${step}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {!filteredTimelineSteps.length && (
                      <div className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">
                        Ничего не найдено
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
              <h2 className="text-lg font-black">Опубликовать для игроков</h2>

              <p className="mt-2 text-xs text-slate-600">
                Кнопка обновит официальный файл в GitHub. После сборки Vercel
                игроки увидят новую версию, а их личные маршруты и метки
                останутся в браузере.
              </p>

              <textarea
                value={changeText}
                onChange={(event) => setChangeText(event.target.value)}
                placeholder={"Что изменилось?\nНапример: добавлен заход к J13"}
                rows={4}
                className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
              />

              <input
                type="password"
                value={publishKey}
                onChange={(event) => setPublishKey(event.target.value)}
                placeholder="Ключ публикации"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
              />

              <button
                type="button"
                disabled={isPublishing}
                onClick={() => void publishOfficialLayers()}
                className="mt-2 w-full rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-black text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {isPublishing ? "Публикуется…" : "Опубликовать маршрут"}
              </button>

              {publishStatus && (
                <div
                  className={`mt-2 rounded-xl border px-3 py-2 text-sm font-bold ${
                    publishStatus.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : publishStatus.type === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-sky-200 bg-white text-sky-800"
                  }`}
                >
                  {publishStatus.text}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="text-lg font-black">Сохранение</h2>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={exportLayers}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                >
                  Скачать слои JSON
                </button>

                <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold">
                  Загрузить слои JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) importLayers(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Маршрут, метки и бои автоматически сохраняются в этом браузере.
              </p>
            </section>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
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

                {shadowMap.grid.map((row, rowIndex) => (
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
                      const boss = bossesByCoord.get(coord);
                      const marker = markerMap.get(coord);
                      const battle = battleMap.get(coord);
                      const mob = mobMap.get(coord);
                      const routeSteps = routeStepsByCoord.get(coord);
                      const dangerous = dangerSet.has(coord);

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
                                ? `inset 0 0 0 1px rgba(127,180,216,.45)`
                                : "",
                              isHovered
                                ? `inset 0 0 0 3px ${ACCENT_STRONG}`
                                : "",
                              isSelected
                                ? `inset 0 0 0 2px ${ACCENT}`
                                : "",
                              isFlashing
                                ? `0 0 0 4px rgba(79,143,186,.55)`
                                : "",
                            ]
                              .filter(Boolean)
                              .join(","),
                            zIndex: isHovered || isFlashing ? 8 : 1,
                          }}
                        >
                          {showRoute && routeSteps && routeSteps.length > 0 && (
                            <span
                              className="absolute inset-[18%] rounded-sm"
                              style={{
                                background: "rgba(245, 158, 11, .75)",
                                boxShadow: "0 0 0 1px rgba(146, 64, 14, .55)",
                              }}
                            />
                          )}

                          {showDanger && dangerous && (
                            <svg
                              viewBox="0 0 24 24"
                              className="absolute inset-[12%] z-20"
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
                              <circle cx="12" cy="17.2" r="1.15" fill="#422006" />
                            </svg>
                          )}

                          {showMarkers && marker && (
                            <span className="absolute left-[12%] top-[12%] h-[42%] w-[42%] rounded-full bg-violet-500 ring-1 ring-white" />
                          )}

                          {showBattles && battle && (
                            <span
                              className="absolute inset-[-8%] z-20 flex items-center justify-center text-[15px] font-black leading-none drop-shadow"
                              title={battle.label}
                              aria-label={battle.label}
                            >
                              ⚔
                            </span>
                          )}

                          {showMobs && mob && (
                            <svg
                              viewBox="0 0 24 24"
                              className="absolute inset-[8%] z-20"
                              aria-label={mob.label}
                            >
                              <title>{mob.label}</title>
                              <path
                                d="M8.4 7.8 6.5 3.4l3.2 2.1L12 3l2.3 2.5 3.2-2.1-1.9 4.4-1.7 2.1h-3.8Z"
                                fill="#090909"
                              />
                              <path
                                d="M3.5 12.4 8.2 9.6l2.2 2h3.2l2.2-2 4.7 2.8-3.3 2.5-.9 6.1H7.7l-.9-6.1Z"
                                fill="#090909"
                              />
                              <path
                                d="M8.6 20.2 6.9 22.5M15.4 20.2l1.7 2.3"
                                stroke="#090909"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}

                          {showBosses && boss && (
                            <span
                              className={`absolute inset-[20%] rounded-full ring-2 ring-white ${
                                boss.kind === "king"
                                  ? "bg-blue-600"
                                  : "bg-red-600"
                              }`}
                            />
                          )}

                          {isHovered && (
                            <span
                              className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-black shadow"
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
