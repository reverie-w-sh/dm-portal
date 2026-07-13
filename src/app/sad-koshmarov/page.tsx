"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gardenMap from "../../../data/garden-map.json";
import officialLayers from "../../../data/garden-layers.json";

const WALL = "#343a40";
const PASSAGE = "#eef5fa";
const GRID = "#cfd8e3";
const PAGE_BG = "#f5f9ff";
const OFFICIAL_ROUTE = "#f59e0b";
const PERSONAL_ROUTE = "#3b82f6";
const PERSONAL_MARKER = "#14b8a6";

type Marker = { coord: string; label: string };

function parseCoord(coord: string, columns: string[]) {
  const col = columns.indexOf(coord.charAt(0));
  const row = Number(coord.slice(1)) - 1;
  return col >= 0 && row >= 0 ? { col, row } : null;
}

function findPath(
  from: string,
  to: string,
  columns: string[],
  grid: number[][]
): string[] | null {
  const start = parseCoord(from, columns);
  const end = parseCoord(to, columns);
  if (!start || !end || grid[end.row]?.[end.col] !== 0) return null;

  const key = (col: number, row: number) => `${col},${row}`;
  const queue = [start];
  const previous = new Map<string, string | null>([
    [key(start.col, start.row), null],
  ]);
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length) {
    const current = queue.shift()!;

    if (current.col === end.col && current.row === end.row) {
      const result: string[] = [];
      let currentKey: string | null = key(end.col, end.row);

      while (currentKey) {
        const [col, row] = currentKey.split(",").map(Number);
        result.push(`${columns[col]}${row + 1}`);
        currentKey = previous.get(currentKey) ?? null;
      }

      return result.reverse();
    }

    for (const [dc, dr] of directions) {
      const col = current.col + dc;
      const row = current.row + dr;
      const nextKey = key(col, row);

      if (
        col < 0 ||
        row < 0 ||
        col >= columns.length ||
        row >= grid.length ||
        grid[row]?.[col] !== 0 ||
        previous.has(nextKey)
      ) {
        continue;
      }

      previous.set(nextKey, key(current.col, current.row));
      queue.push({ col, row });
    }
  }

  return null;
}

export default function GardenPublicPage() {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [showOfficialRoute, setShowOfficialRoute] = useState(false);
  const [showBosses, setShowBosses] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [showBattles, setShowBattles] = useState(false);
  const [showOfficialMarkers, setShowOfficialMarkers] = useState(false);
  const [showMyRoute, setShowMyRoute] = useState(true);
  const [showMyMarkers, setShowMyMarkers] = useState(true);

  const [myRoute, setMyRoute] = useState<string[]>([]);
  const [myMarkers, setMyMarkers] = useState<Marker[]>([]);
  const [routeStart, setRouteStart] = useState("");
  const [routeFinish, setRouteFinish] = useState("");
  const [selectedCoord, setSelectedCoord] = useState("");
  const [markerLabel, setMarkerLabel] = useState("Моя метка");
  const [message, setMessage] = useState("");

  const columns = gardenMap.columns;

  useEffect(() => {
    try {
      const route = localStorage.getItem("garden-player-route");
      const markers = localStorage.getItem("garden-player-markers");
      if (route) setMyRoute(JSON.parse(route));
      if (markers) setMyMarkers(JSON.parse(markers));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("garden-player-route", JSON.stringify(myRoute));
  }, [myRoute]);

  useEffect(() => {
    localStorage.setItem("garden-player-markers", JSON.stringify(myMarkers));
  }, [myMarkers]);

  const officialRouteSet = useMemo(
    () => new Set<string>(officialLayers.route ?? []),
    []
  );
  const dangerSet = useMemo(
    () => new Set<string>(officialLayers.dangerCells ?? []),
    []
  );
  const bossMap = useMemo(
    () => new Map((officialLayers.bosses ?? []).map((x) => [x.coord, x])),
    []
  );
  const battleMap = useMemo(
    () => new Map((officialLayers.battleMarkers ?? []).map((x) => [x.coord, x])),
    []
  );
  const officialMarkerMap = useMemo(
    () => new Map((officialLayers.customMarkers ?? []).map((x) => [x.coord, x])),
    []
  );
  const myRouteSet = useMemo(() => new Set(myRoute), [myRoute]);
  const myMarkerMap = useMemo(
    () => new Map(myMarkers.map((x) => [x.coord, x])),
    [myMarkers]
  );

  const notify = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((x) => (x === text ? "" : x)), 1800);
  }, []);

  const buildMyRoute = useCallback(() => {
    const path = findPath(
      routeStart.trim(),
      routeFinish.trim(),
      columns,
      gardenMap.grid as number[][]
    );

    if (!path) {
      notify("Не удалось построить путь между этими точками");
      return;
    }

    setMyRoute(path);
    notify(`Путь построен: ${path.length} клеток`);
  }, [columns, notify, routeFinish, routeStart]);

  const addMyMarker = useCallback(() => {
    if (!selectedCoord) {
      notify("Сначала выберите клетку");
      return;
    }

    const label = markerLabel.trim() || "Моя метка";

    setMyMarkers((current) => {
      const exists = current.some((x) => x.coord === selectedCoord);
      return exists
        ? current.map((x) =>
            x.coord === selectedCoord ? { ...x, label } : x
          )
        : [...current, { coord: selectedCoord, label }];
    });

    notify(`Метка добавлена: ${selectedCoord}`);
  }, [markerLabel, notify, selectedCoord]);

  return (
    <main className="min-h-screen px-3 py-5 sm:px-6" style={{ background: PAGE_BG }}>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-4">
          <h1 className="text-2xl font-black sm:text-3xl">Сад кошмаров</h1>
          <p className="mt-1 text-sm text-slate-600">
            Официальные слои доступны только для просмотра. Свой маршрут и
            метки сохраняются только в вашем браузере.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Версия {officialLayers.version}
            {officialLayers.updatedAt
              ? ` · ${new Date(officialLayers.updatedAt).toLocaleString("ru-RU")}`
              : ""}
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="text-lg font-black">Показать на карте</h2>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  ["Маршрут капитана", showOfficialRoute, setShowOfficialRoute],
                  ["Боссы", showBosses, setShowBosses],
                  ["Опасные места", showDanger, setShowDanger],
                  ["Бои", showBattles, setShowBattles],
                  ["Метки автора", showOfficialMarkers, setShowOfficialMarkers],
                  ["Мой маршрут", showMyRoute, setShowMyRoute],
                  ["Мои метки", showMyMarkers, setShowMyMarkers],
                ].map(([label, checked, setter]) => (
                  <label
                    key={String(label)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <span className="font-bold">{String(label)}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(checked)}
                      onChange={(event) =>
                        (setter as (value: boolean) => void)(event.target.checked)
                      }
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="text-lg font-black">Проложить мой маршрут</h2>
              <input
                value={routeStart}
                onChange={(event) => setRouteStart(event.target.value)}
                placeholder="Я сейчас, например M27"
                className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-center font-bold"
              />
              <input
                value={routeFinish}
                onChange={(event) => setRouteFinish(event.target.value)}
                placeholder="Нужно дойти, например p32"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-center font-bold"
              />
              <button
                type="button"
                onClick={buildMyRoute}
                className="mt-2 w-full rounded-xl bg-blue-600 px-3 py-2.5 font-black text-white"
              >
                Проложить синим
              </button>
              <button
                type="button"
                onClick={() => setMyRoute([])}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
              >
                Очистить мой маршрут
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
              <h2 className="text-lg font-black">Моя метка</h2>
              <div className="mt-2 rounded-xl bg-slate-50 p-3 text-center text-xl font-black">
                {selectedCoord || "Выберите клетку"}
              </div>
              <input
                value={markerLabel}
                onChange={(event) => setMarkerLabel(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <button
                type="button"
                onClick={addMyMarker}
                className="mt-2 w-full rounded-xl bg-teal-600 px-3 py-2.5 font-black text-white"
              >
                Добавить мою метку
              </button>
            </section>

            {message && (
              <div className="rounded-xl bg-sky-100 p-3 text-center text-sm font-bold text-sky-900">
                {message}
              </div>
            )}
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div ref={viewportRef} className="max-h-[84vh] overflow-auto">
              <div
                className="grid w-max select-none"
                style={{
                  gridTemplateColumns: `34px repeat(${gardenMap.width}, 20px) 34px`,
                  gridTemplateRows: `34px repeat(${gardenMap.height}, 20px) 34px`,
                  background: PAGE_BG,
                }}
              >
                <div />
                {columns.map((x) => (
                  <div key={`t-${x}`} className="flex items-center justify-center text-xs font-black">
                    {x}
                  </div>
                ))}
                <div />

                {gardenMap.grid.map((row, rowIndex) => (
                  <div className="contents" key={rowIndex}>
                    <div className="flex items-center justify-center text-xs font-black">
                      {rowIndex + 1}
                    </div>

                    {row.map((isWall, colIndex) => {
                      const coord = `${columns[colIndex]}${rowIndex + 1}`;
                      const boss = bossMap.get(coord);
                      const battle = battleMap.get(coord);
                      const officialMarker = officialMarkerMap.get(coord);
                      const myMarker = myMarkerMap.get(coord);

                      return (
                        <button
                          key={coord}
                          type="button"
                          title={coord}
                          onClick={() => setSelectedCoord(coord)}
                          className="relative block p-0"
                          style={{
                            width: 20,
                            height: 20,
                            background: isWall ? WALL : PASSAGE,
                            boxShadow: `inset -1px -1px 0 ${GRID}`,
                          }}
                        >
                          {showOfficialRoute && officialRouteSet.has(coord) && (
                            <span
                              className="absolute inset-[18%] rounded-sm"
                              style={{ background: OFFICIAL_ROUTE }}
                            />
                          )}

                          {showMyRoute && myRouteSet.has(coord) && (
                            <span
                              className="absolute inset-[30%] rounded-full"
                              style={{ background: PERSONAL_ROUTE }}
                            />
                          )}

                          {showDanger && dangerSet.has(coord) && (
                            <span className="absolute inset-0 z-20 flex items-center justify-center text-[13px]">
                              ⚠
                            </span>
                          )}

                          {showBattles && battle && (
                            <span className="absolute inset-0 z-20 flex items-center justify-center text-[12px]">
                              ⚔
                            </span>
                          )}

                          {showBosses && boss && (
                            <span
                              className={`absolute inset-[20%] z-20 rounded-full ring-1 ring-white ${
                                boss.kind === "king" ? "bg-blue-600" : "bg-red-600"
                              }`}
                            />
                          )}

                          {showOfficialMarkers && officialMarker && (
                            <span className="absolute left-[8%] top-[8%] z-20 h-[42%] w-[42%] rounded-full bg-violet-500" />
                          )}

                          {showMyMarkers && myMarker && (
                            <span
                              className="absolute bottom-[8%] right-[8%] z-20 h-[45%] w-[45%] rounded-full"
                              style={{ background: PERSONAL_MARKER }}
                            />
                          )}
                        </button>
                      );
                    })}

                    <div className="flex items-center justify-center text-xs font-black">
                      {rowIndex + 1}
                    </div>
                  </div>
                ))}

                <div />
                {columns.map((x) => (
                  <div key={`b-${x}`} className="flex items-center justify-center text-xs font-black">
                    {x}
                  </div>
                ))}
                <div />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
