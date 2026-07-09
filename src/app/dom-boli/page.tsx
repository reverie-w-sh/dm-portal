"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

const MAPS: Record<number, string[]> = {
  1: [
    "...#....##.#.#..",
    ".#....#....#.#..",
    ".####.#.####.##.",
    ".#....#.......#.",
    ".####...#..#.##.",
    "....###.##.#....",
    ".##.....#..#.###",
    "###.#.###..#....",
    ".##.#.....##.##.",
    "....#..#......#.",
    ".#.##.#########.",
    ".#.#.....#....#.",
    ".#.#.###.#.#..#.",
    "##.#.#...#.####.",
    ".....###.#.#....",
    "..#....#.....#..",
  ],
  2: [
    "...#...#.....#..",
    ".#.###.#.#.###..",
    "##...#.###...##.",
    ".#.#.#.....#....",
    ".###.###.#.#.##.",
    "......#..###..#.",
    "##.#.##.##.##.#.",
    "...#.#........##",
    "####...#..###...",
    ".#.##.#####...##",
    ".#........##....",
    "...#.#.#...#.##.",
    "####.###.#...#..",
    "...#..#..#.###.#",
    ".#...##.####.#..",
    ".#.#.........#..",
  ],
  3: [
    ".......#....#...",
    "..##.###.#..#.#.",
    "..#......#....#.",
    "###.########.##.",
    "..#.#......#.#..",
    "....#......#.#.#",
    "##.##..##..###..",
    ".......##......#",
    ".##.#..##..###..",
    ".#..#......#.#.#",
    ".##.#......#.#..",
    "....########....",
    ".##..#..#....###",
    ".#...#....#..#..",
    ".#.#####.#####..",
    ".#..............",
  ],
  4: [
    ".............#..",
    "##....#.####.#..",
    "#..####....#.#..",
    "#.##....####.##.",
    ".....##.........",
    ".###.####.#.#.#.",
    ".#........#.###.",
    "##.###.##.#...##",
    ".....#.##.###...",
    ".###.#........#.",
    ".#.....###.##.#.",
    "##.#####.####.#.",
    "...#...#........",
    ".#.#.#.###.#.###",
    ".#...#.....#.#..",
    ".#..##...###....",
  ],
  5: [
    "..............#.",
    "###.####.###....",
    ".............#..",
    ".####.####...#.#",
    "...........#.#..",
    "###.######.#....",
    "....#..#.#.###.#",
    ".####....#......",
    "....#.##.#.###..",
    "###.#..#.....##.",
    "....#..#.###.#..",
    "..#.####..#.....",
    "#.#.......#.####",
    "..####.##.#.....",
    "....#...#.#.#...",
    "###...#.....#...",
  ],
  6: [
    "...####.........",
    ".#.#........###.",
    ".#.#.#####.##.#.",
    ".#.#.#...#......",
    ".###.#.#.#.###..",
    ".#...#.#.#...##.",
    ".#.#.#.#.#.#.#..",
    ".#.#.......#.#.#",
    ".#.#########.#..",
    ".#...........##.",
    ".###..###..###..",
    "......###.......",
    ".#.#..###.#.#.#.",
    "................",
    ".#.#..#.#..#.#..",
    "......#.#.......",
  ],
};

const LETTERS = "ABCDEFGHIJKLMNOP".split("");

type Coord = {
  col: number;
  row: number;
  label: string;
};

function parseCoord(value: string): Coord | null {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-P])([1-9]|1[0-6])$/);

  if (!match) return null;

  const col = LETTERS.indexOf(match[1]);
  const row = Number(match[2]) - 1;

  return {
    col,
    row,
    label: `${match[1]}${match[2]}`,
  };
}

function isRoad(mapId: number, coord: Coord) {
  return MAPS[mapId][coord.row][coord.col] === ".";
}

export default function DimBoliPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const [searchMode, setSearchMode] = useState(false);
  const [coordInput, setCoordInput] = useState("");
  const [coords, setCoords] = useState<Coord[]>([]);

  const close = () => {
    setSelected(null);
    setZoomed(false);
  };

  const nextMap = () => {
    setSelected((current) => {
      if (current === null) return current;
      return current === 6 ? 1 : current + 1;
    });
    setZoomed(false);
  };

  const prevMap = () => {
    setSelected((current) => {
      if (current === null) return current;
      return current === 1 ? 6 : current - 1;
    });
    setZoomed(false);
  };

  const addCoord = (value: string) => {
    const parsed = parseCoord(value);
    if (!parsed) return;

    setCoords((current) => {
      const exists = current.some((c) => c.label === parsed.label);
      if (exists) return current;
      return [...current, parsed];
    });

    setCoordInput("");
  };

  const matchingMaps = useMemo(() => {
    if (coords.length === 0) return [1, 2, 3, 4, 5, 6];

    return [1, 2, 3, 4, 5, 6].filter((mapId) =>
      coords.every((coord) => isRoad(mapId, coord))
    );
  }, [coords]);

  const sortedMapIds = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].sort((a, b) => {
      if (!searchMode || coords.length === 0) return a - b;

      const aMatch = matchingMaps.includes(a);
      const bMatch = matchingMaps.includes(b);

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      return a - b;
    });
  }, [searchMode, coords.length, matchingMaps]);

  const isSolved = coords.length > 0 && matchingMaps.length === 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();

      if (selected === null) return;

      if (e.key === "ArrowRight") nextMap();
      if (e.key === "ArrowLeft") prevMap();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  return (
    <>
      <div className="max-w-[1180px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-ink tracking-tight mb-2 text-center">
          Карты Дома Боли (Кровавого Подземелья)
        </h1>

        <div className="divider-accent mb-8" />

        <div className="flex justify-center mb-8">
          <button
            className="btn-primary"
            onClick={() => setSearchMode((v) => !v)}
          >
            {searchMode ? "Скрыть поиск" : "В КП? Найди свою карту"}
          </button>
        </div>

        {searchMode && (
          <div className="glass rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-black text-ink mb-2 text-center">
              Поиск карты по известным координатам
            </h2>

            <p className="text-ink-muted text-sm text-center mb-6">
              Впиши координату, где точно есть дорога. Например, H11. Или выбери
              клетку на пустой карте. Добавляй координаты до тех пор, пока не останется одна подходящая карта. Удачи! :)
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <input
                value={coordInput}
                onChange={(e) => setCoordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCoord(coordInput);
                }}
                placeholder="Где ты? пиши сюда :)"
                className="px-4 py-3 rounded-xl bg-white/80 text-ink outline-none border border-black/10 text-center normal-case text-sm"
              />

              <button
                className="btn-primary"
                onClick={() => addCoord(coordInput)}
              >
                Добавить
              </button>

              <button
                className="btn-secondary bg-dark-card"
                onClick={() => setCoords([])}
              >
                Очистить
              </button>
            </div>

            <div className="kp-picker mx-auto mb-6">
              <div className="kp-picker-corner" />

              {LETTERS.map((letter) => (
                <div key={`top-${letter}`} className="kp-picker-label">
                  {letter}
                </div>
              ))}

              {Array.from({ length: 16 }).map((_, row) => (
                <Fragment key={`row-${row}`}>
                  <div className="kp-picker-label">{row + 1}</div>

                  {Array.from({ length: 16 }).map((_, col) => {
                    const label = `${LETTERS[col]}${row + 1}`;
                    const selectedCoord = coords.some(
                      (c) => c.label === label
                    );

                    return (
                      <button
                        key={label}
                        className={`kp-empty-cell ${
                          selectedCoord ? "kp-empty-cell-selected" : ""
                        }`}
                        title={label}
                        onClick={() => addCoord(label)}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>

            {coords.length > 0 && (
              <div className="text-center">
                <div className="text-ink font-bold mb-2">
                  Известные координаты:
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {coords.map((coord) => (
                    <button
                      key={coord.label}
                      className="px-3 py-1 rounded-full bg-dark text-white text-sm"
                      onClick={() =>
                        setCoords((current) =>
                          current.filter((c) => c.label !== coord.label)
                        )
                      }
                    >
                      {coord.label} ×
                    </button>
                  ))}
                </div>

                <div className="text-ink-muted text-sm">
                  Подходящие карты:{" "}
                  <b className="text-ink">
                    {matchingMaps.length > 0
                      ? matchingMaps.map((id) => `Карта ${id}`).join(", ")
                      : "нет совпадений"}
                  </b>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`kp-grid ${searchMode ? "kp-search-active" : ""}`}>
          {sortedMapIds.map((id) => {
            const matches = matchingMaps.includes(id);
            const hiddenBySearch = searchMode && coords.length > 0 && !matches;
            const revealAll = isSolved && matches;

            return (
              <div
                key={id}
                className={`kp-card cursor-pointer ${
                  hiddenBySearch ? "kp-card-hidden" : ""
                }`}
                onClick={() => {
                  if (hiddenBySearch) return;
                  setSelected(id);
                  setZoomed(false);
                }}
              >
                <div className="kp-map-wrap">
                  <img src={`/kp-maps/kp-map${id}.png`} alt={`Карта ${id}`} />

                  {searchMode && coords.length > 0 && matches && (
                    <svg
                      className="kp-grid-overlay"
                      viewBox="0 0 16 16"
                      preserveAspectRatio="none"
                    >
                      {!revealAll && (
                        <>
                          <defs>
                            <mask id={`kp-mask-${id}`}>
                              <rect
                                x="0"
                                y="0"
                                width="16"
                                height="16"
                                fill="white"
                              />

                              {coords.map((coord) => {
                                const x = Math.max(coord.col - 1, 0);
                                const y = Math.max(coord.row - 1, 0);
                                const w = Math.min(3, 16 - x);
                                const h = Math.min(3, 16 - y);

                                return (
                                  <rect
                                    key={`hole-${coord.label}`}
                                    x={x}
                                    y={y}
                                    width={w}
                                    height={h}
                                    fill="black"
                                  />
                                );
                              })}
                            </mask>
                          </defs>

                          <rect
                            x="0"
                            y="0"
                            width="16"
                            height="16"
                            fill="black"
                            opacity="0.72"
                            mask={`url(#kp-mask-${id})`}
                          />
                        </>
                      )}

                      {coords.map((coord) => {
                        const x = Math.max(coord.col - 1, 0);
                        const y = Math.max(coord.row - 1, 0);
                        const w = Math.min(3, 16 - x);
                        const h = Math.min(3, 16 - y);

                        return (
                          <rect
                            key={`zone-${coord.label}`}
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            fill="none"
                            stroke="#ff2b2b"
                            strokeWidth="0.12"
                          />
                        );
                      })}

                      {coords.map((coord) => (
                        <rect
                          key={`marker-${coord.label}`}
                          x={coord.col}
                          y={coord.row}
                          width="1"
                          height="1"
                          fill="none"
                          stroke="#ff2b2b"
                          strokeWidth="0.16"
                        />
                      ))}
                    </svg>
                  )}
                </div>

                <div className="kp-title">Карта {id}</div>
              </div>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={close}
          onWheel={(e) => {
            e.stopPropagation();
            if (e.deltaY > 0) nextMap();
            if (e.deltaY < 0) prevMap();
          }}
          onTouchStart={(e) => {
            setTouchStart(e.touches[0].clientX);
          }}
          onTouchEnd={(e) => {
            if (touchStart === null) return;

            const diff = touchStart - e.changedTouches[0].clientX;

            if (Math.abs(diff) > 60) {
              if (diff > 0) nextMap();
              else prevMap();
            }

            setTouchStart(null);
          }}
        >
          <button
            className="absolute top-6 right-8 text-white text-5xl hover:text-red-400 transition"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
          >
            ×
          </button>

          <button
            className="absolute left-5 text-5xl text-white hover:text-red-400 transition select-none"
            onClick={(e) => {
              e.stopPropagation();
              prevMap();
            }}
            aria-label="Предыдущая карта"
          >
            ❮
          </button>

          <img
            src={`/kp-maps/kp-map${selected}.png`}
            alt={`Карта ${selected}`}
            className={`rounded-xl shadow-2xl transition-transform duration-300 ${
              zoomed
                ? "max-w-none max-h-none scale-[1.8] cursor-zoom-out"
                : "max-w-[95vw] max-h-[95vh] cursor-zoom-in"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((v) => !v);
            }}
          />

          <button
            className="absolute right-5 text-5xl text-white hover:text-red-400 transition select-none"
            onClick={(e) => {
              e.stopPropagation();
              nextMap();
            }}
            aria-label="Следующая карта"
          >
            ❯
          </button>

          <div className="absolute bottom-6 text-white/80 text-lg font-semibold">
            Карта {selected} / 6
          </div>
        </div>
      )}
    </>
  );
}
