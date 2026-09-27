"use client";

import { useEffect, useRef, useState } from "react";
import ScreenshotModal from "./ScreenshotModal";
import styles from "./RoadPuzzle.module.css";

const COUNT = 42;
const COLS = 3;
const ROWS = 3;
const WIDTH = 160;
const HEIGHT = 120;
const BOARD_X = 260;
const BOARD_Y = 135;
const STARTS = [
  { x: 42, y: 40 }, { x: 800, y: 36 }, { x: 39, y: 247 },
  { x: 802, y: 243 }, { x: 43, y: 445 }, { x: 800, y: 445 },
  { x: 242, y: 515 }, { x: 423, y: 515 }, { x: 602, y: 515 },
];

type Piece = { id: number; x: number; y: number; placed: boolean };
type Drag = { id: number; offsetX: number; offsetY: number };

function shuffledPieces(): Piece[] {
  const order = Array.from({ length: COLS * ROWS }, (_, id) => id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((id, index) => ({ id, ...STARTS[index], placed: false }));
}

function pieceShape(id: number): string {
  const col = id % COLS;
  const row = Math.floor(id / COLS);
  const top = row === 0 ? 0 : -((row - 1 + col) % 2 ? 1 : -1);
  const right = col === COLS - 1 ? 0 : (row + col) % 2 ? 1 : -1;
  const bottom = row === ROWS - 1 ? 0 : (row + col + 1) % 2 ? 1 : -1;
  const left = col === 0 ? 0 : -((row + col - 1) % 2 ? 1 : -1);
  const h = (sign: number, y: number, direction: 1 | -1) => {
    if (!sign) return ` L${direction === 1 ? WIDTH : 0} ${y}`;
    const a = direction === 1 ? 1 : -1;
    const start = direction === 1 ? 0 : WIDTH;
    return ` L${start + a * 54} ${y} C${start + a * 60} ${y},${start + a * 59} ${y - sign * 17},${start + a * 72} ${y - sign * 18} C${start + a * 91} ${y - sign * 32},${start + a * 108} ${y - sign * 11},${start + a * 106} ${y} L${direction === 1 ? WIDTH : 0} ${y}`;
  };
  const v = (sign: number, x: number, direction: 1 | -1) => {
    if (!sign) return ` L${x} ${direction === 1 ? HEIGHT : 0}`;
    const a = direction === 1 ? 1 : -1;
    const start = direction === 1 ? 0 : HEIGHT;
    return ` L${x} ${start + a * 37} C${x} ${start + a * 45},${x + sign * 18} ${start + a * 44},${x + sign * 19} ${start + a * 55} C${x + sign * 30} ${start + a * 74},${x + sign * 12} ${start + a * 86},${x} ${start + a * 83} L${x} ${direction === 1 ? HEIGHT : 0}`;
  };
  return `M0 0${h(top, 0, 1)}${v(right, WIDTH, 1)}${h(-bottom, HEIGHT, -1)}${v(-left, 0, -1)} Z`;
}

export default function RoadPuzzle({ screenshot }: { screenshot: string }) {
  const [active, setActive] = useState(false);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [seconds, setSeconds] = useState(60);
  const [result, setResult] = useState<"won" | "lost" | null>(null);
  const [number, setNumber] = useState(1);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const piecesRef = useRef<Piece[]>([]);
  const deadlineRef = useRef(0);

  useEffect(() => {
    if (!active || result) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) setResult("lost");
    }, 200);
    return () => window.clearInterval(timer);
  }, [active, result]);

  useEffect(() => {
    if (zoomed === null) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setZoomed(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [zoomed]);

  function start() {
    const next = shuffledPieces();
    piecesRef.current = next;
    setPieces(next);
    setNumber(Math.floor(Math.random() * COUNT) + 1);
    deadlineRef.current = Date.now() + 60_000;
    setSeconds(60);
    setResult(null);
    setActive(true);
  }

  function point(event: React.PointerEvent<SVGElement>) {
    const matrix = svgRef.current?.getScreenCTM()?.inverse();
    if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix);
    return { x: p.x, y: p.y };
  }

  function begin(event: React.PointerEvent<SVGGElement>, piece: Piece) {
    if (piece.placed || result) return;
    const p = point(event);
    if (!p) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: piece.id, offsetX: p.x - piece.x, offsetY: p.y - piece.y };
    event.preventDefault();
  }

  function move(event: React.PointerEvent<SVGGElement>) {
    const drag = dragRef.current;
    const p = point(event);
    if (!drag || !p) return;
    const next = piecesRef.current.map((piece) => piece.id === drag.id
      ? { ...piece, x: p.x - drag.offsetX, y: p.y - drag.offsetY } : piece);
    piecesRef.current = next;
    setPieces(next);
  }

  function end(event: React.PointerEvent<SVGGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const piece = piecesRef.current.find((item) => item.id === drag.id);
    dragRef.current = null;
    if (!piece || result || seconds === 0) return;
    const targetX = BOARD_X + (piece.id % COLS) * WIDTH;
    const targetY = BOARD_Y + Math.floor(piece.id / COLS) * HEIGHT;
    if (Math.hypot(piece.x - targetX, piece.y - targetY) < 46) {
      const next = piecesRef.current.map((item) => item.id === piece.id
        ? { ...item, x: targetX, y: targetY, placed: true } : item);
      piecesRef.current = next;
      setPieces(next);
      if (next.every((item) => item.placed) && seconds > 0) setResult("won");
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const image = `/images/world/puzzles/pazl${number}.jpg`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.screenshot}>
        {!active && <ScreenshotModal src={screenshot} alt="Игровой экран: Дорога к Пещере" priority />}
        {active && (
          <div className={styles.game}>
            <img src={screenshot} alt="" className={styles.backdrop} />
            <svg ref={svgRef} viewBox="0 0 1000 650" className={styles.playArea} role="img" aria-label="Пазл: перетащи детали на места в центральном поле">
              <defs>
                {Array.from({ length: 9 }, (_, id) => <clipPath key={id} id={`road-piece-${id}`} clipPathUnits="userSpaceOnUse"><path d={pieceShape(id)} /></clipPath>)}
              </defs>
              <rect x={BOARD_X} y={BOARD_Y} width={WIDTH * COLS} height={HEIGHT * ROWS} fill="#100d09" fillOpacity=".9" stroke="#d5a657" strokeWidth="4" />
              {Array.from({ length: 9 }, (_, id) => <rect key={id} x={BOARD_X + id % 3 * WIDTH} y={BOARD_Y + Math.floor(id / 3) * HEIGHT} width={WIDTH} height={HEIGHT} fill="none" stroke="#a68856" strokeOpacity=".65" strokeDasharray="5 5" />)}
              {pieces.map((piece) => (
                <g key={piece.id} transform={`translate(${piece.x} ${piece.y})`} onPointerDown={(event) => begin(event, piece)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className={piece.placed ? styles.placed : styles.draggable}>
                  <path d={pieceShape(piece.id)} fill="#392918" stroke="#f0cb81" strokeWidth="5" />
                  <g clipPath={`url(#road-piece-${piece.id})`}>
                    <image href={image} x={-(piece.id % 3) * WIDTH} y={-Math.floor(piece.id / 3) * HEIGHT} width={WIDTH * 3} height={HEIGHT * 3} preserveAspectRatio="none" />
                  </g>
                  <path d={pieceShape(piece.id)} fill="transparent" stroke="#f0cb81" strokeWidth="2" />
                </g>
              ))}
            </svg>
            <div className={styles.clock} aria-live="off">Осталось: {seconds} сек.</div>
            {result && <div className={styles.finish} role="status"><strong>{result === "won" ? "Молодец!" : "Время вышло, попробуй ещё раз."}</strong>{result === "won" && <p>Напиши мне в приват, что хочешь подарок с пазликом (Аланька).</p>}<button type="button" onClick={start}>Собрать ещё пазл</button></div>}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={start}>{active ? "Начать заново" : "Собрать пазл"}</button>
      </div>
      <details className={styles.archive}>
        <summary>Показать КМовские пазлики</summary>
        <p>В BloodyWorld в дороге можно было собирать пазлы... Эта страничка для тех, кто помнит :)</p>
        <div className={styles.gallery}>
          {Array.from({ length: COUNT }, (_, index) => index + 1).map((id) => <button type="button" key={id} onClick={() => setZoomed(id)} aria-label={`Увеличить пазл ${id}`}><img src={`/images/world/puzzles/pazl${id}.jpg`} alt={`КМовский пазл ${id}`} loading="lazy" /></button>)}
        </div>
      </details>
      {zoomed !== null && <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`КМовский пазл ${zoomed}`} onClick={() => setZoomed(null)}><button type="button" className={styles.close} onClick={() => setZoomed(null)} aria-label="Закрыть">×</button><img src={`/images/world/puzzles/pazl${zoomed}.jpg`} alt={`КМовский пазл ${zoomed}`} onClick={(event) => event.stopPropagation()} /></div>}
    </div>
  );
}
