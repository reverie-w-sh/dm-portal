"use client";

import { useEffect, useMemo, useState } from "react";

type AnimalType =
  | "unknown"
  | "rabbit"
  | "wolf"
  | "boar"
  | "bear";

type SearchResult = "none" | "miss" | "plus1" | "plus3";

interface HunterCell {
  animal: AnimalType;
  searches: [SearchResult, SearchResult, SearchResult];
}

const STORAGE_KEY = "wolfchen-hunter-board-v1";
const BOARD_SIZE = 16;

const ANIMAL_ORDER: AnimalType[] = [
  "unknown",
  "rabbit",
  "wolf",
  "boar",
  "bear",
];

const SEARCH_ORDER: SearchResult[] = [
  "none",
  "miss",
  "plus1",
  "plus3",
];

const ANIMAL_LIMITS: Record<
  Exclude<AnimalType, "unknown">,
  number
> = {
  rabbit: 4,
  wolf: 2,
  boar: 2,
  bear: 1,
};

const ANIMALS: Record<
  AnimalType,
  {
    emoji: string;
    name: string;
    cellClass: string;
  }
> = {
  unknown: {
    emoji: "",
    name: "Ничего",
    cellClass: "bg-white/10",
  },
  rabbit: {
    emoji: "🐰",
    name: "Заяц",
    cellClass: "bg-amber-100/90",
  },
  wolf: {
    emoji: "🐺",
    name: "Волк",
    cellClass: "bg-slate-200/90",
  },
  boar: {
    emoji: "🐗",
    name: "Кабан",
    cellClass: "bg-orange-100/90",
  },
  bear: {
    emoji: "🐻",
    name: "Медведь",
    cellClass: "bg-yellow-100/90",
  },
};

const SEARCHES: Record<
  SearchResult,
  {
    label: string;
    title: string;
    className: string;
  }
> = {
  none: {
    label: "",
    title: "Не проверено",
    className: "bg-white/10 text-white/25",
  },
  miss: {
    label: "×",
    title: "Никого не нашли",
    className: "bg-rose-100 text-rose-700",
  },
  plus1: {
    label: "+1",
    title: "Зверь найден, шкурку взять не удалось",
    className: "bg-amber-100 text-amber-800",
  },
  plus3: {
    label: "+3",
    title: "Зверь найден, шкурка получена",
    className: "bg-emerald-100 text-emerald-800",
  },
};

function createEmptyBoard(): HunterCell[] {
  return Array.from({ length: BOARD_SIZE }, () => ({
    animal: "unknown",
    searches: ["none", "none", "none"],
  }));
}

function getNextValue<T>(values: T[], current: T): T {
  const currentIndex = values.indexOf(current);

  return values[(currentIndex + 1) % values.length];
}

function getSearchPoints(result: SearchResult): number {
  if (result === "plus1") return 1;
  if (result === "plus3") return 3;

  return 0;
}

function isPositiveResult(result: SearchResult): boolean {
  return result === "plus1" || result === "plus3";
}

function isHunterCell(value: unknown): value is HunterCell {
  if (!value || typeof value !== "object") return false;

  const cell = value as HunterCell;

  return (
    ANIMAL_ORDER.includes(cell.animal) &&
    Array.isArray(cell.searches) &&
    cell.searches.length === 3 &&
    cell.searches.every((result) =>
      SEARCH_ORDER.includes(result),
    )
  );
}

function getAnimalCounts(board: HunterCell[]) {
  return {
    rabbit: board.filter(
      (cell) => cell.animal === "rabbit",
    ).length,

    wolf: board.filter(
      (cell) => cell.animal === "wolf",
    ).length,

    boar: board.filter(
      (cell) => cell.animal === "boar",
    ).length,

    bear: board.filter(
      (cell) => cell.animal === "bear",
    ).length,
  };
}

function getNextAllowedAnimal(
  currentAnimal: AnimalType,
  board: HunterCell[],
): AnimalType {
  const counts = getAnimalCounts(board);
  const currentIndex = ANIMAL_ORDER.indexOf(currentAnimal);

  for (
    let step = 1;
    step <= ANIMAL_ORDER.length;
    step += 1
  ) {
    const candidate =
      ANIMAL_ORDER[
        (currentIndex + step) % ANIMAL_ORDER.length
      ];

    if (candidate === "unknown") {
      return candidate;
    }

    const limit = ANIMAL_LIMITS[candidate];
    const currentCount = counts[candidate];

    if (currentCount < limit) {
      return candidate;
    }
  }

  return "unknown";
}

export default function HunterBoard() {
  const [board, setBoard] = useState<HunterCell[]>(
    createEmptyBoard,
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const [showResetConfirm, setShowResetConfirm] =
    useState(false);

  useEffect(() => {
    try {
      const savedBoard =
        localStorage.getItem(STORAGE_KEY);

      if (savedBoard) {
        const parsed: unknown =
          JSON.parse(savedBoard);

        if (
          Array.isArray(parsed) &&
          parsed.length === BOARD_SIZE &&
          parsed.every(isHunterCell)
        ) {
          setBoard(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Не удалось загрузить планшет охотника:",
        error,
      );
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(board),
      );
    } catch (error) {
      console.error(
        "Не удалось сохранить планшет охотника:",
        error,
      );
    }
  }, [board, isLoaded]);

  const statistics = useMemo(() => {
    const animalCounts = getAnimalCounts(board);

    let totalPoints = 0;
    let checkedSearches = 0;

    board.forEach((cell) => {
      cell.searches.forEach((result) => {
        totalPoints += getSearchPoints(result);

        if (result !== "none") {
          checkedSearches += 1;
        }
      });
    });

    return {
      ...animalCounts,
      totalPoints,
      checkedSearches,
    };
  }, [board]);

  function changeAnimal(cellIndex: number) {
    setBoard((currentBoard) =>
      currentBoard.map((cell, index) => {
        if (index !== cellIndex) return cell;

        return {
          ...cell,
          animal: getNextAllowedAnimal(
            cell.animal,
            currentBoard,
          ),
        };
      }),
    );
  }

  function changeSearchResult(
    cellIndex: number,
    searchIndex: 0 | 1 | 2,
  ) {
    setBoard((currentBoard) =>
      currentBoard.map((cell, index) => {
        if (index !== cellIndex) return cell;

        const positiveSearchIndex =
          cell.searches.findIndex(isPositiveResult);

        if (
          positiveSearchIndex !== -1 &&
          positiveSearchIndex !== searchIndex
        ) {
          return cell;
        }

        const newSearches: HunterCell["searches"] = [
          ...cell.searches,
        ];

        newSearches[searchIndex] = getNextValue(
          SEARCH_ORDER,
          newSearches[searchIndex],
        );

        if (
          isPositiveResult(
            newSearches[searchIndex],
          )
        ) {
          newSearches.forEach(
            (result, indexInCell) => {
              if (
                indexInCell !== searchIndex &&
                isPositiveResult(result)
              ) {
                newSearches[indexInCell] = "none";
              }
            },
          );
        }

        return {
          ...cell,
          searches: newSearches,
        };
      }),
    );
  }

  function resetBoard() {
    setBoard(createEmptyBoard());
    setShowResetConfirm(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Не удалось очистить планшет охотника:",
        error,
      );
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-5">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Планшет охотника
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Нажимай на верхнюю часть клетки,
          чтобы отметить найденного зверя.
          Нижние три поля — поиск слева,
          по центру и справа. Подсказка: выбор происходит посредством многократного нажатия на одну клеточку :) 
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="glass rounded-3xl p-2.5 shadow-sm sm:p-4">
          <div className="mb-2 grid grid-cols-4 gap-1.5 pl-7 text-center text-xs font-bold text-white/50 sm:gap-2 sm:pl-9">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <div className="grid w-6 shrink-0 grid-rows-4 gap-1.5 py-0.5 text-center text-xs font-bold text-white/50 sm:w-7 sm:gap-2">
              <span className="flex items-center justify-center">
                A
              </span>

              <span className="flex items-center justify-center">
                B
              </span>

              <span className="flex items-center justify-center">
                C
              </span>

              <span className="flex items-center justify-center">
                D
              </span>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5 sm:gap-2">
              {board.map((cell, cellIndex) => {
                const animal =
                  ANIMALS[cell.animal];

                const missCount =
                  cell.searches.filter(
                    (result) =>
                      result === "miss",
                  ).length;

                const positiveSearchIndex =
                  cell.searches.findIndex(
                    isPositiveResult,
                  );

                return (
                  <div
                    key={cellIndex}
                    className={[
                      "min-w-0 overflow-hidden rounded-xl border border-white/15 shadow-sm",
                      animal.cellClass,
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        changeAnimal(cellIndex)
                      }
                      title={`${animal.name}. Нажми, чтобы изменить`}
                      aria-label={`Клетка ${
                        cellIndex + 1
                      }: ${animal.name}`}
                      className="relative flex aspect-[1.12/1] w-full items-center justify-center border-b border-black/10 transition hover:brightness-[0.98] active:scale-[0.98] sm:aspect-[1.3/1]"
                    >
                      {cell.animal ===
                      "unknown" ? (
                        <span className="text-xl font-light text-black/20 sm:text-3xl">
                          ·
                        </span>
                      ) : (
                        <span className="text-2xl sm:text-4xl">
                          {animal.emoji}
                        </span>
                      )}

                      {missCount === 2 &&
                        positiveSearchIndex ===
                          -1 && (
                          <span
                            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 shadow-sm"
                            title="Два направления пустые — проверь оставшееся"
                          />
                        )}
                    </button>

                    <div className="grid grid-cols-3 divide-x divide-black/10">
                      {cell.searches.map(
                        (
                          result,
                          searchIndex,
                        ) => {
                          const search =
                            SEARCHES[result];

                          const directionNames = [
                            "слева",
                            "по центру",
                            "справа",
                          ];

                          const isDisabled =
                            positiveSearchIndex !==
                              -1 &&
                            positiveSearchIndex !==
                              searchIndex &&
                            result === "none";

                          return (
                            <button
                              key={searchIndex}
                              type="button"
                              disabled={isDisabled}
                              onClick={() =>
                                changeSearchResult(
                                  cellIndex,
                                  searchIndex as
                                    | 0
                                    | 1
                                    | 2,
                                )
                              }
                              title={
                                isDisabled
                                  ? "Зверь уже найден в другом направлении"
                                  : `${directionNames[searchIndex]}: ${search.title}`
                              }
                              aria-label={
                                isDisabled
                                  ? `${directionNames[searchIndex]}: недоступно`
                                  : `${directionNames[searchIndex]}: ${search.title}`
                              }
                              className={[
                                "flex h-8 min-w-0 items-center justify-center text-[11px] font-black transition sm:h-10 sm:text-sm",

                                isDisabled
                                  ? "cursor-not-allowed bg-black/20 text-white/20"
                                  : `${search.className} active:scale-95`,
                              ].join(" ")}
                            >
                              {isDisabled
                                ? ""
                                : search.label ||
                                  "·"}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-white/60">
            <span>
              <b className="text-rose-300">
                ×
              </b>{" "}
              — никого
            </span>

            <span>
              <b className="text-amber-300">
                +1
              </b>{" "}
              — без шкурки
            </span>

            <span>
              <b className="text-emerald-300">
                +3
              </b>{" "}
              — шкурка
            </span>
          </div>
        </div>

        <aside className="glass h-fit rounded-3xl p-4 text-white shadow-sm sm:p-5">
          <h2 className="text-lg font-black text-white">
            Статистика
          </h2>

          <div className="mt-4 space-y-2">
            <StatRow
              emoji="🐰"
              name="Зайцы"
              value={statistics.rabbit}
              total={4}
            />

            <StatRow
              emoji="🐺"
              name="Волки"
              value={statistics.wolf}
              total={2}
            />

            <StatRow
              emoji="🐗"
              name="Кабаны"
              value={statistics.boar}
              total={2}
            />

            <StatRow
              emoji="🐻"
              name="Медведи"
              value={statistics.bear}
              total={1}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-white/10 p-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-white/50">
              Очки
            </div>

            <div className="mt-1 text-4xl font-black text-white">
              {statistics.totalPoints}
            </div>
          </div>

          <div className="mt-3 text-center text-xs text-white/50">
            Отмечено поисков:{" "}
            {statistics.checkedSearches}
          </div>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() =>
                setShowResetConfirm(true)
              }
              className="mt-5 w-full rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm font-bold text-rose-200 transition hover:bg-rose-500/25 active:scale-[0.98]"
            >
              Очистить планшет
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-500/15 p-3">
              <p className="text-center text-xs font-semibold text-rose-100">
                Очистить все клетки и очки?
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowResetConfirm(false)
                  }
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white/70"
                >
                  Отмена
                </button>

                <button
                  type="button"
                  onClick={resetBoard}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Очистить
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/40">
            Планшет автоматически сохраняется
            в этом браузере, на случай если случайно обновишь страницу или закроешь.
          </p>
        </aside>
      </div>
    </section>
  );
}

function StatRow({
  emoji,
  name,
  value,
  total,
}: {
  emoji: string;
  name: string;
  value: number;
  total: number;
}) {
  const completed = value >= total;

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <span>{emoji}</span>

        <span className="text-sm font-semibold text-white/70">
          {name}
        </span>
      </div>

      <span
        className={[
          "text-sm font-black",
          completed
            ? "text-emerald-300"
            : "text-white",
        ].join(" ")}
      >
        {value} / {total}
      </span>
    </div>
  );
}
