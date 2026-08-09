"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GIFTS } from "@/data/gifts";
import styles from "./GiftBoard.module.css";

const STORAGE_KEY = "wolfchen-gift-board-v1";
const NICK_STORAGE_KEY = "wolfchen-gift-board-nick-v1";
const LIKES_STORAGE_KEY = "wolfchen-gift-board-liked-v1";
const DEFAULT_COLUMNS = 11;
const DEFAULT_ROWS = 10;
const MIN_COLUMNS = 8;
const MAX_COLUMNS = 16;
const MIN_ROWS = 5;
const MAX_ROWS = 20;
const INFO_PREVIEW_EXISTING_GIFTS = GIFTS.slice(8, 41).map((gift) => gift.file);

type Cell = string | null;
type Tool = "paint" | "erase";
type SchemeSort = "new" | "popular" | "mine";

type SavedBoard = {
  columns: number;
  rows: number;
  cells: Cell[];
};

type PublicScheme = SavedBoard & {
  id: string;
  nick: string;
  title: string;
  createdAt: string;
  likes: number;
};

const HEART_MASK = [
  ".XX...XX.",
  "XXXX.XXXX",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
  "...XXX...",
  "....X....",
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
  const [nick, setNick] = useState("");
  const [schemeTitle, setSchemeTitle] = useState("");
  const [schemeSort, setSchemeSort] = useState<SchemeSort>("new");
  const [publicSchemes, setPublicSchemes] = useState<PublicScheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [schemesConfigured, setSchemesConfigured] = useState(true);
  const [schemesRefresh, setSchemesRefresh] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [transformMessage, setTransformMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [likedSchemes, setLikedSchemes] = useState<Set<string>>(() => new Set());
  const paintingRef = useRef(false);

  const giftByFile = useMemo(
    () => new Map(GIFTS.map((gift) => [gift.file, gift])),
    [],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setNick(localStorage.getItem(NICK_STORAGE_KEY) ?? "");
        try {
          const savedLikes = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) ?? "[]") as unknown;
          if (Array.isArray(savedLikes)) {
            setLikedSchemes(new Set(savedLikes.filter((id): id is string => typeof id === "string")));
          }
        } catch {
          setLikedSchemes(new Set());
        }

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

  useEffect(() => {
    let cancelled = false;

    async function loadSchemes() {
      setSchemesLoading(true);
      try {
        const cleanNick = nick.trim();
        if (schemeSort === "mine" && cleanNick.length < 2) {
          setPublicSchemes([]);
          setSchemesLoading(false);
          return;
        }

        const params = new URLSearchParams({
          sort: schemeSort === "popular" ? "popular" : "new",
        });
        if (schemeSort === "mine") params.set("nick", cleanNick);

        const response = await fetch(`/api/gift-board/schemes?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          configured?: boolean;
          schemes?: PublicScheme[];
        };

        if (cancelled) return;
        setSchemesConfigured(data.configured !== false);
        setPublicSchemes(Array.isArray(data.schemes) ? data.schemes : []);
      } catch (error) {
        if (!cancelled) {
          console.error("Не удалось загрузить сохранённые схемы:", error);
          setPublicSchemes([]);
        }
      } finally {
        if (!cancelled) setSchemesLoading(false);
      }
    }

    void loadSchemes();
    return () => {
      cancelled = true;
    };
  }, [nick, schemeSort, schemesRefresh]);

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

  const previewCells = useMemo(() => {
    // В DM подарки дарятся от правого нижнего к левому верхнему.
    // В инфе более поздние подарки оказываются раньше, поэтому для
    // предпросмотра сначала собираем реальную очередь дарения, убирая
    // пустые клетки, а затем разворачиваем её в порядок отображения.
    const givingOrder: string[] = [];
    for (let row = rows - 1; row >= 0; row -= 1) {
      for (let column = columns - 1; column >= 0; column -= 1) {
        const cell = cells[row * columns + column];
        if (cell) givingOrder.push(cell);
      }
    }
    return givingOrder.reverse();
  }, [cells, columns, rows]);

  function paintCell(index: number, toggle = false) {
    setCells((current) => {
      const next = [...current];
      next[index] =
        tool === "erase" || (toggle && current[index] === selectedGift)
          ? null
          : selectedGift;
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

  function addRow(position: "top" | "bottom") {
    if (rows >= MAX_ROWS) return;
    const emptyRow = emptyBoard(columns, 1);
    setCells((current) =>
      position === "top" ? [...emptyRow, ...current] : [...current, ...emptyRow],
    );
    setRows(rows + 1);
  }

  function fillBoard() {
    setCells((current) =>
      current.map((cell) => cell ?? selectedGift),
    );
    setTool("paint");
  }

  function mirrorBoard() {
    setCells((current) => {
      const next: Cell[] = [];
      for (let row = 0; row < rows; row += 1) {
        const start = row * columns;
        next.push(...current.slice(start, start + columns).reverse());
      }
      return next;
    });
    setTransformMessage("Отразила зеркально ✓");
  }

  function rotateBoard() {
    const nextColumns = rows;
    const nextRows = columns;
    if (
      nextColumns < MIN_COLUMNS ||
      nextColumns > MAX_COLUMNS ||
      nextRows < MIN_ROWS ||
      nextRows > MAX_ROWS
    ) {
      setTransformMessage(`Для поворота нужно от ${MIN_COLUMNS} до ${MAX_COLUMNS} строк.`);
      return;
    }

    setCells((current) => {
      const next = emptyBoard(nextColumns, nextRows);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const nextRow = column;
          const nextColumn = rows - 1 - row;
          next[nextRow * nextColumns + nextColumn] = current[row * columns + column];
        }
      }
      return next;
    });
    setColumns(nextColumns);
    setRows(nextRows);
    setTransformMessage("Повернула на 90° ✓");
  }

  function shiftBoard(deltaColumn: number, deltaRow: number) {
    const wouldLoseGift = cells.some((cell, index) => {
      if (!cell) return false;
      const row = Math.floor(index / columns);
      const column = index % columns;
      const nextRow = row + deltaRow;
      const nextColumn = column + deltaColumn;
      return nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns;
    });

    if (
      wouldLoseGift &&
      !window.confirm("На краю есть подарки — при сдвиге они выйдут за планшет. Продолжить?")
    ) {
      return;
    }

    setCells((current) => {
      const next = emptyBoard(columns, rows);
      current.forEach((cell, index) => {
        if (!cell) return;
        const row = Math.floor(index / columns) + deltaRow;
        const column = (index % columns) + deltaColumn;
        if (row >= 0 && row < rows && column >= 0 && column < columns) {
          next[row * columns + column] = cell;
        }
      });
      return next;
    });
    setTransformMessage("Сдвинула ✓");
  }

  function pickRandomBackground() {
    const candidates = GIFTS.filter((gift) => !gift.personal && gift.file !== selectedGift);
    const gift = candidates[Math.floor(Math.random() * candidates.length)] ?? GIFTS[0];
    setSelectedGift(gift.file);
    setTool("paint");
    setTransformMessage(`Фон: ${gift.title}. Нажми «Заполнить фон», если подходит.`);
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
    const lines = Array.from({ length: rows }, (_, step) => {
      const row = rows - 1 - step;
      const start = row * columns;
      const giftsInGivingOrder = cells.slice(start, start + columns).reverse();
      return `${step + 1}. ${compressRow(giftsInGivingOrder, giftNames)}`;
    });
    const summary = counts.map((item) => `${item.gift?.title}: ${item.count}`).join("\n");
    const text = [
      `Планшет подарков — ${columns}×${rows}`,
      `Всего подарков: ${totalPlaced}`,
      "",
      "Сколько нужно:",
      summary || "Пока ничего :) ",
      "",
      "Порядок дарения — снизу вверх, справа налево:",
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

  async function publishScheme() {
    const cleanNick = nick.trim();
    const cleanTitle = schemeTitle.trim();

    if (cleanNick.length < 2 || !cleanTitle) {
      setPublishMessage("Напиши ник и название схемы.");
      return;
    }
    if (!totalPlaced) {
      setPublishMessage("Сначала нарисуй что-нибудь :) ");
      return;
    }

    setIsPublishing(true);
    setPublishMessage("");
    try {
      const response = await fetch("/api/gift-board/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: cleanNick,
          title: cleanTitle,
          columns,
          rows,
          cells,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        configured?: boolean;
        error?: string;
      };

      if (data.configured === false) {
        setSchemesConfigured(false);
        throw new Error("Хранилище пока не подключено");
      }
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Не получилось сохранить схему");
      }

      localStorage.setItem(NICK_STORAGE_KEY, cleanNick);
      setSchemeTitle("");
      setSchemeSort("new");
      setSchemesRefresh((value) => value + 1);
      setPublishMessage("Опубликовано ✓");
    } catch (error) {
      setPublishMessage(error instanceof Error ? error.message : "Не получилось сохранить схему");
    } finally {
      setIsPublishing(false);
    }
  }

  function openPublicScheme(scheme: PublicScheme) {
    if (totalPlaced && !window.confirm("Загрузить эту схему? Текущий рисунок заменится.")) {
      return;
    }
    setColumns(scheme.columns);
    setRows(scheme.rows);
    setCells(scheme.cells);
    setTool("paint");
    document.getElementById("gift-board-canvas")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  async function likeScheme(id: string) {
    if (likedSchemes.has(id)) return;

    try {
      const response = await fetch("/api/gift-board/schemes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as { ok?: boolean; likes?: number };
      if (!response.ok || !data.ok || typeof data.likes !== "number") return;

      const nextLiked = new Set(likedSchemes);
      nextLiked.add(id);
      setLikedSchemes(nextLiked);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(nextLiked)));
      setPublicSchemes((current) => {
        const updated = current.map((scheme) =>
          scheme.id === id ? { ...scheme, likes: data.likes as number } : scheme,
        );
        return schemeSort === "popular"
          ? updated.sort(
              (a, b) => b.likes - a.likes || Date.parse(b.createdAt) - Date.parse(a.createdAt),
            )
          : updated;
      });
    } catch (error) {
      console.error("Не удалось поставить сердечко схеме:", error);
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
                <button type="button" className={styles.clearTool} onClick={clearBoard}>
                  Очистить
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
                <button type="button" onClick={() => addRow("top")} disabled={rows >= MAX_ROWS}>+ сверху</button>
                <button type="button" onClick={() => addRow("bottom")} disabled={rows >= MAX_ROWS}>+ снизу</button>
              </div>
            </div>

            <div className={styles.transformBar}>
              <span className={styles.transformLabel}>Рисунок</span>
              <div className={styles.transformButtons}>
                <button type="button" onClick={mirrorBoard}>⇆ Зеркально</button>
                <button type="button" onClick={rotateBoard}>↻ 90°</button>
                <button type="button" title="Сдвинуть вверх" aria-label="Сдвинуть вверх" onClick={() => shiftBoard(0, -1)}>↑</button>
                <button type="button" title="Сдвинуть вниз" aria-label="Сдвинуть вниз" onClick={() => shiftBoard(0, 1)}>↓</button>
                <button type="button" title="Сдвинуть влево" aria-label="Сдвинуть влево" onClick={() => shiftBoard(-1, 0)}>←</button>
                <button type="button" title="Сдвинуть вправо" aria-label="Сдвинуть вправо" onClick={() => shiftBoard(1, 0)}>→</button>
                <button type="button" onClick={pickRandomBackground}>🎲 Подобрать фон</button>
                <button type="button" onClick={() => setPreviewOpen(true)}>Предпросмотр в инфе</button>
              </div>
              {transformMessage ? <span className={styles.transformMessage}>{transformMessage}</span> : null}
            </div>

            <div className={styles.boardScroller} id="gift-board-canvas">
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
                        paintCell(index, true);
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
              <button type="button" onClick={() => drawPattern(LOVE_MASK)}>LOVE</button>
              <button type="button" onClick={drawFrame}>Рамка</button>
              <button type="button" className={styles.clearPattern} onClick={clearBoard}>Очистить</button>
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

            <div className={styles.publishArea}>
              <p className={styles.miniLabel}>Опубликовать схему</p>
              <input
                type="text"
                value={nick}
                maxLength={30}
                onChange={(event) => setNick(event.target.value)}
                placeholder="Твой ник"
                aria-label="Твой ник"
              />
              <input
                type="text"
                value={schemeTitle}
                maxLength={60}
                onChange={(event) => setSchemeTitle(event.target.value)}
                placeholder="Название схемы"
                aria-label="Название схемы"
              />
              <button
                type="button"
                className={styles.publishButton}
                onClick={publishScheme}
                disabled={isPublishing || !schemesConfigured}
              >
                {isPublishing ? "Сохраняю…" : "Опубликовать"}
              </button>
              {publishMessage ? <p className={styles.publishMessage}>{publishMessage}</p> : null}
              {!schemesConfigured ? (
                <p className={styles.publishMessage}>Публичное хранилище пока недоступно.</p>
              ) : null}

              <div className={styles.savedSchemesHead}>
                <span>Сохранённые</span>
                <div>
                  <button
                    type="button"
                    className={schemeSort === "new" ? styles.activeSort : ""}
                    onClick={() => setSchemeSort("new")}
                  >
                    Новые
                  </button>
                  <button
                    type="button"
                    className={schemeSort === "popular" ? styles.activeSort : ""}
                    onClick={() => setSchemeSort("popular")}
                  >
                    Популярные
                  </button>
                  <button
                    type="button"
                    className={schemeSort === "mine" ? styles.activeSort : ""}
                    onClick={() => setSchemeSort("mine")}
                  >
                    Мои
                  </button>
                </div>
              </div>

              <div className={styles.savedSchemes}>
                {schemesLoading ? <p className={styles.schemeHint}>Загружаю…</p> : null}
                {!schemesLoading && schemeSort === "mine" && nick.trim().length < 2 ? (
                  <p className={styles.schemeHint}>Напиши свой ник выше — покажу твои схемы.</p>
                ) : null}
                {!schemesLoading && !publicSchemes.length ? (
                  schemeSort !== "mine" || nick.trim().length >= 2 ? (
                    <p className={styles.schemeHint}>Пока ни одной :)</p>
                  ) : null
                ) : null}
                {publicSchemes.map((scheme) => (
                  <article key={scheme.id} className={styles.schemeCard}>
                    <div
                      className={styles.schemePreview}
                      style={{ "--preview-columns": scheme.columns } as React.CSSProperties}
                      aria-hidden="true"
                    >
                      {scheme.cells.map((file, index) => (
                        <span key={index}>
                          {file ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={file} alt="" loading="lazy" />
                          ) : null}
                        </span>
                      ))}
                    </div>
                    <div className={styles.schemeInfo}>
                      <strong>{scheme.title}</strong>
                      <span>{scheme.nick} · {scheme.columns}×{scheme.rows}</span>
                      <div className={styles.schemeActions}>
                        <button type="button" onClick={() => openPublicScheme(scheme)}>Открыть</button>
                        <button
                          type="button"
                          className={likedSchemes.has(scheme.id) ? styles.liked : ""}
                          onClick={() => likeScheme(scheme.id)}
                          disabled={likedSchemes.has(scheme.id)}
                          aria-label={`Нравится: ${scheme.likes}`}
                        >
                          ♥ {scheme.likes}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
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

        {previewOpen ? (
          <div
            className={styles.previewOverlay}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPreviewOpen(false);
            }}
          >
            <section className={styles.infoPreview} role="dialog" aria-modal="true" aria-label="Предпросмотр рисунка в инфе">
              <div className={styles.previewHead}>
                <div>
                  <p className={styles.miniLabel}>Предпросмотр</p>
                  <h2>Так рисунок будет выглядеть в инфе</h2>
                </div>
                <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Закрыть предпросмотр">×</button>
              </div>
              <p className={styles.previewNote}>
                Пример прямо на скрине из инфы. Пустые клетки схлопнуты — как и при настоящей выкладке подарков.
              </p>
              <div className={styles.infoMock}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.infoScreenshot}
                  src="/images/gift-board-info-top.png"
                  alt=""
                />
                <div className={styles.infoDrawingArea}>
                  <div className={styles.infoDrawingSheet}>
                    <div className={styles.infoGiftGrid}>
                      {previewCells.map((file, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`new-${file}-${index}`} src={file} alt="" />
                      ))}
                      {INFO_PREVIEW_EXISTING_GIFTS.map((file, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`existing-${file}-${index}`} src={file} alt="" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
