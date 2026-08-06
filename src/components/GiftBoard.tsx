"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GIFTS } from "@/data/gifts";
import styles from "./GiftBoard.module.css";

const STORAGE_KEY = "wolfchen-gift-board-v1";
const DEFAULT_COLUMNS = 11;
const DEFAULT_ROWS = 10;
const MIN_COLUMNS = 8;
const MAX_COLUMNS = 16;
const MIN_ROWS = 5;
const MAX_ROWS = 20;

type Cell = string | null;
type Tool = "paint" | "erase";

type SavedBoard = {
  columns: number;
  rows: number;
  cells: Cell[];
};

const HEART_MASK = [
  ".XXX...XXX.",
  "XXXXX.XXXXX",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  ".XXXXXXXXX.",
  "..XXXXXXX..",
  "...XXXXX...",
  "....XXX....",
  ".....X.....",
];

const PAW_MASK = [
  ".XX.....XX.",
  ".XX.....XX.",
  "...XX.XX...",
  "...XX.XX...",
  "...........",
  "...XXXXX...",
  "..XXXXXXX..",
  "..XXXXXXX..",
  "...XXXXX...",
  "....XXX....",
];

const LOVE_MASK = [
  "X......XXX.",
  "X.....X...X",
  "X.....X...X",
  "X.....X...X",
  "XXXXX..XXX.",
  "...........",
  "X...X.XXXXX",
  "X...X.X....",
  "X...X.XXXX.",
  ".X.X..X....",
  "..X...XXXXX",
];

const MIDDLE_FINGER_MASK = [
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  "....XXX....",
  ".XX.XXX.XX.",
  ".XXXXXXXXX.",
  ".XXXXXXXXX.",
  "..XXXXXXX..",
  "...XXXXX...",
];

const AW_MASK = [
  ".X......X.X",
  "X.X..X..X.X",
  "XXX.XXX.X.X",
  "X.X..X..XXX",
  "X.X......X.",
];

function emptyBoard(columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS): Cell[] {
  return Array.from({ length: columns * rows }, () => null);
}

function isValidDimension(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
}

function compressRow(row: Cell[], giftNames: Map<string, string>) {
  const parts: string[] = [];
  let current = row[0] ?? null;
  let count = 0;

  function pushRun() {
    if (!count) return;
    const label = current ? giftNames.get(current) ?? current : "пусто";
    parts.push(`${label} ×${count}`);
  }

  row.forEach((cell) => {
    if (cell === current) {
      count += 1;
      return;
    }
    pushRun();
    current = cell;
    count = 1;
  });
  pushRun();

  return parts.join(" → ");
}

export default function GiftBoard() {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cells, setCells] = useState<Cell[]>(() => emptyBoard());
  const [selectedGift, setSelectedGift] = useState(GIFTS[0].file);
  const [tool, setTool] = useState<Tool>("paint");
  const [search, setSearch] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyState, setCopyState] = useState("Скопировать схему");
  const paintingRef = useRef(false);

  const giftByFile = useMemo(
    () => new Map(GIFTS.map((gift) => [gift.file, gift])),
    [],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw) as Partial<SavedBoard>;
        if (
          !isValidDimension(saved.columns, MIN_COLUMNS, MAX_COLUMNS) ||
          !isValidDimension(saved.rows, MIN_ROWS, MAX_ROWS) ||
          !Array.isArray(saved.cells) ||
          saved.cells.length !== saved.columns * saved.rows
        ) {
          return;
        }

        const knownFiles = new Set(GIFTS.map((gift) => gift.file));
        const safeCells = saved.cells.map((cell) =>
          typeof cell === "string" && knownFiles.has(cell) ? cell : null,
        );

        setColumns(saved.columns);
        setRows(saved.rows);
        setCells(safeCells);
      } catch (error) {
        console.error("Не удалось загрузить планшет подарков:", error);
      } finally {
        setIsLoaded(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ columns, rows, cells } satisfies SavedBoard),
      );
    } catch (error) {
      console.error("Не удалось сохранить планшет подарков:", error);
    }
  }, [cells, columns, rows, isLoaded]);

  useEffect(() => {
    const stopPainting = () => {
      paintingRef.current = false;
    };
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    return () => {
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
    };
  }, []);

  const selected = giftByFile.get(selectedGift) ?? GIFTS[0];

  const filteredGifts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    if (!query) return GIFTS;
    return GIFTS.filter((gift) =>
      gift.title.toLocaleLowerCase("ru").includes(query),
    );
  }, [search]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    cells.forEach((cell) => {
      if (cell) map.set(cell, (map.get(cell) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([file, count]) => ({ gift: giftByFile.get(file), count }))
      .filter((item) => item.gift)
      .sort((a, b) => b.count - a.count);
  }, [cells, giftByFile]);

  const totalPlaced = useMemo(
    () => counts.reduce((sum, item) => sum + item.count, 0),
    [counts],
  );

  function paintCell(index: number) {
    setCells((current) => {
      const next = [...current];
      next[index] = tool === "erase" ? null : selectedGift;
      return next;
    });
  }

  function resizeColumns(nextColumns: number) {
    if (nextColumns < MIN_COLUMNS || nextColumns > MAX_COLUMNS) return;
    if (nextColumns < columns) {
      const removedColumnHasGifts = cells.some(
        (cell, index) => cell && index % columns >= nextColumns,
      );
      if (
        removedColumnHasGifts &&
        !window.confirm("В крайнем столбце есть подарки. Всё равно убрать его?")
      ) {
        return;
      }
    }
    setCells((current) => {
      const next = emptyBoard(nextColumns, rows);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < Math.min(columns, nextColumns); column += 1) {
          next[row * nextColumns + column] = current[row * columns + column];
        }
      }
      return next;
    });
    setColumns(nextColumns);
  }

  function resizeRows(nextRows: number) {
    if (nextRows < MIN_ROWS || nextRows > MAX_ROWS) return;
    if (nextRows < rows) {
      const removed = cells.slice(nextRows * columns);
      if (removed.some(Boolean) && !window.confirm("В нижней строке есть подарки. Всё равно убрать её?")) {
        return;
      }
    }
    setCells((current) => {
      const next = emptyBoard(columns, nextRows);
      current.slice(0, next.length).forEach((cell, index) => {
        next[index] = cell;
      });
      return next;
    });
    setRows(nextRows);
  }

  function fillBoard() {
    setCells(Array.from({ length: columns * rows }, () => selectedGift));
    setTool("paint");
  }

  function drawPattern(pattern: string[]) {
    const patternWidth = Math.max(...pattern.map((row) => row.length));
    const targetRows = Math.max(rows, pattern.length);
    const rowOffset = Math.max(0, Math.floor((targetRows - pattern.length) / 2));
    const columnOffset = Math.floor((columns - patternWidth) / 2);

    setRows(targetRows);
    setCells((current) => {
      const next = emptyBoard(columns, targetRows);
      current.slice(0, next.length).forEach((cell, index) => {
        next[index] = cell;
      });

      pattern.forEach((maskRow, maskRowIndex) => {
        Array.from(maskRow).forEach((mark, maskColumnIndex) => {
          if (mark !== "X") return;
          const column = maskColumnIndex + columnOffset;
          const row = maskRowIndex + rowOffset;
          if (column >= 0 && column < columns && row < targetRows) {
            next[row * columns + column] = selectedGift;
          }
        });
      });
      return next;
    });
    setTool("paint");
  }

  function drawFrame() {
    setCells((current) =>
      current.map((cell, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const isEdge = row === 0 || row === rows - 1 || column === 0 || column === columns - 1;
        return isEdge ? selectedGift : cell;
      }),
    );
    setTool("paint");
  }

  function clearBoard() {
    if (totalPlaced && !window.confirm("Очистить весь рисунок?")) return;
    setCells(emptyBoard(columns, rows));
  }

  async function copyScheme() {
    const giftNames = new Map(GIFTS.map((gift) => [gift.file, gift.title]));
    const lines = Array.from({ length: rows }, (_, row) => {
      const start = row * columns;
      return `${row + 1}. ${compressRow(cells.slice(start, start + columns), giftNames)}`;
    });
    const summary = counts.map((item) => `${item.gift?.title}: ${item.count}`).join("\n");
    const text = [
      `Планшет подарков — ${columns}×${rows}`,
      `Всего подарков: ${totalPlaced}`,
      "",
      "Сколько нужно:",
      summary || "Пока ничего :) ",
      "",
      "Схема по строкам:",
      ...lines,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyState("Скопировано ✓");
      window.setTimeout(() => setCopyState("Скопировать схему"), 1800);
    } catch {
      setCopyState("Не получилось скопировать");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Полезное и очень даже нужное :)</p>
          <h1>Планшет подарков</h1>
          <p>
            Собери рисунок так, как он должен выглядеть в инфе. Выбери подарок —
            и рисуй им по клеткам. Планшет сам посчитает, сколько каких подарков понадобится.
          </p>
          <div className={styles.heroLinks}>
            <Link href="/gifts">Все подарочки →</Link>
          </div>
        </header>

        <section className={styles.tip}>
          <span className={styles.tipIcon}>✦</span>
          <p>
            <strong>Чтобы рисунок не «съехал»:</strong> пустые места между подарками в инфе
            не сохраняются. Для пробелов выбери другой подарок, нажми «Заполнить фон»,
            а поверх нарисуй сердце, буквы или что-нибудь своё.
          </p>
        </section>

        <section className={styles.workspace}>
          <div className={styles.canvasPanel}>
            <div className={styles.toolbar}>
              <div className={styles.toolGroup}>
                <button
                  type="button"
                  className={tool === "paint" ? styles.activeTool : ""}
                  onClick={() => setTool("paint")}
                >
                  Кисть
                </button>
                <button
                  type="button"
                  className={tool === "erase" ? styles.activeTool : ""}
                  onClick={() => setTool("erase")}
                >
                  Ластик
                </button>
              </div>

              <div className={styles.sizeControls}>
                <span>Столбцы</span>
                <button type="button" onClick={() => resizeColumns(columns - 1)} disabled={columns <= MIN_COLUMNS}>−</button>
                <b>{columns}</b>
                <button type="button" onClick={() => resizeColumns(columns + 1)} disabled={columns >= MAX_COLUMNS}>+</button>
                <span>Строки</span>
                <button type="button" onClick={() => resizeRows(rows - 1)} disabled={rows <= MIN_ROWS}>−</button>
                <b>{rows}</b>
                <button type="button" onClick={() => resizeRows(rows + 1)} disabled={rows >= MAX_ROWS}>+</button>
              </div>
            </div>

            <div className={styles.boardScroller}>
              <div
                className={styles.board}
                style={{ "--gift-columns": columns } as React.CSSProperties}
                onPointerLeave={() => {
                  paintingRef.current = false;
                }}
              >
                {cells.map((file, index) => {
                  const gift = file ? giftByFile.get(file) : null;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={styles.cell}
                      aria-label={gift ? `Клетка: ${gift.title}` : "Пустая клетка"}
                      title={gift?.title ?? "Пустая клетка"}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        event.preventDefault();
                        paintingRef.current = true;
                        paintCell(index);
                      }}
                      onPointerEnter={() => {
                        if (paintingRef.current) paintCell(index);
                      }}
                    >
                      {gift ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={gift.file} alt="" draggable={false} />
                      ) : (
                        <span>·</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.patternActions}>
              <button type="button" onClick={fillBoard}>Заполнить фон</button>
              <button type="button" onClick={() => drawPattern(HEART_MASK)}>♥ Сердце</button>
              <button type="button" onClick={() => drawPattern(PAW_MASK)}>🐾 Лапка</button>
              <button type="button" onClick={() => drawPattern(LOVE_MASK)}>LOVE</button>
              <button type="button" onClick={() => drawPattern(MIDDLE_FINGER_MASK)}>Средний палец</button>
              <button type="button" onClick={() => drawPattern(AW_MASK)}>A+W</button>
              <button type="button" onClick={drawFrame}>Рамка</button>
              <button type="button" onClick={clearBoard} className={styles.dangerButton}>Очистить</button>
            </div>
          </div>

          <aside className={styles.summary}>
            <p className={styles.miniLabel}>В рисунке</p>
            <strong className={styles.total}>{totalPlaced}</strong>
            <span className={styles.totalLabel}>подарков</span>
            <div className={styles.countList}>
              {counts.length ? counts.map((item) => (
                <div key={item.gift?.file} className={styles.countItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.gift?.file} alt="" />
                  <span>{item.gift?.title}</span>
                  <b>×{item.count}</b>
                </div>
              )) : <p className={styles.emptySummary}>Пока пусто. Выбери подарок ниже и начинай рисовать :)</p>}
            </div>
            <button type="button" className={styles.copyButton} onClick={copyScheme}>
              {copyState}
            </button>
          </aside>
        </section>

        <section className={styles.paletteSection}>
          <div className={styles.paletteHead}>
            <div>
              <p className={styles.miniLabel}>Палитра</p>
              <h2>Чем рисуем?</h2>
            </div>
            <div className={styles.selectedGift}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.file} alt="" />
              <span>{selected.title}</span>
            </div>
          </div>

          <div className={styles.searchWrap}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Найти подарок…"
              aria-label="Найти подарок"
            />
          </div>

          <div className={styles.palette}>
            {filteredGifts.map((gift) => (
              <button
                key={gift.file}
                type="button"
                className={gift.file === selectedGift ? styles.selectedPaletteGift : ""}
                title={gift.title}
                aria-label={`Выбрать: ${gift.title}`}
                disabled={gift.personal}
                onClick={() => {
                  setSelectedGift(gift.file);
                  setTool("paint");
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gift.file} alt="" loading="lazy" />
                {gift.personal ? <span className={styles.personalBadge}>личный · нельзя дарить</span> : null}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
