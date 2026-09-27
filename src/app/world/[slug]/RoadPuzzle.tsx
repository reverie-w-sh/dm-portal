"use client";

import { useEffect, useRef, useState } from "react";
import ScreenshotModal from "./ScreenshotModal";
import styles from "./RoadPuzzle.module.css";

const COUNT = 41;
const COLS = 4;
const ROWS = 4;
const WIDTH = 120;
const HEIGHT = 90;
const BOARD_X = 260;
const BOARD_Y = 135;
const STARTS = [
  { x: 45, y: 53 }, { x: 825, y: 51 },
  { x: 45, y: 185 }, { x: 825, y: 181 },
  { x: 45, y: 318 }, { x: 825, y: 314 },
  { x: 45, y: 450 }, { x: 825, y: 446 },
  { x: 251, y: 20 }, { x: 378, y: 20 }, { x: 505, y: 20 }, { x: 632, y: 20 },
  { x: 251, y: 536 }, { x: 378, y: 536 }, { x: 505, y: 536 }, { x: 632, y: 536 },
];

type Piece = { id: number; x: number; y: number; rotation: number; placed: boolean };
type Drag = { id: number; offsetX: number; offsetY: number; startX: number; startY: number; moved: boolean };

function shuffledPieces(): Piece[] {
  const order = Array.from({ length: COLS * ROWS }, (_, id) => id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((id, index) => ({ id, ...STARTS[index], rotation: (index % 3 + 1) % 4, placed: false }));
}

function pieceShape(id: number): string {
  const col = id % COLS;
  const row = Math.floor(id / COLS);
  // One shared boundary sign is used by both neighbours. Reversing the
  // traversal reverses the control points, so a tab fits its adjacent notch.
  const horizontal = (boundaryRow: number, boundaryCol: number) => (boundaryRow + boundaryCol) % 2 ? 1 : -1;
  const vertical = (boundaryRow: number, boundaryCol: number) => (boundaryRow + boundaryCol) % 2 ? -1 : 1;
  const top = row === 0 ? 0 : horizontal(row - 1, col);
  const bottom = row === ROWS - 1 ? 0 : horizontal(row, col);
  const left = col === 0 ? 0 : vertical(row, col - 1);
  const right = col === COLS - 1 ? 0 : vertical(row, col);
  const edge = (length: number, sign: number, reverse: boolean, horizontalEdge: boolean, fixed: number) => {
    const at = (fraction: number, depth = 0) => horizontalEdge
      ? `${(reverse ? 1 - fraction : fraction) * length} ${fixed + sign * depth}`
      : `${fixed + sign * depth} ${(reverse ? 1 - fraction : fraction) * length}`;
    if (!sign) return ` L${at(1)}`;
    const depth = horizontalEdge ? 18 : 17;
    return ` L${at(.32)} C${at(.37)},${at(.36, depth)},${at(.43, depth)} C${at(.46, depth * 1.45)},${at(.54, depth * 1.45)},${at(.57, depth)} C${at(.64, depth)},${at(.63)},${at(.68)} L${at(1)}`;
  };
  return `M0 0${edge(WIDTH, top, false, true, 0)}${edge(HEIGHT, right, false, false, WIDTH)}${edge(WIDTH, bottom, true, true, HEIGHT)}${edge(HEIGHT, left, true, false, 0)} Z`;
}

export default function RoadPuzzle({ screenshot }: { screenshot: string }) {
  const [active, setActive] = useState(false);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [seconds, setSeconds] = useState(75);
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
    deadlineRef.current = Date.now() + 75_000;
    setSeconds(75);
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
    dragRef.current = { id: piece.id, offsetX: p.x - piece.x, offsetY: p.y - piece.y, startX: p.x, startY: p.y, moved: false };
    event.preventDefault();
  }

  function move(event: React.PointerEvent<SVGGElement>) {
    const drag = dragRef.current;
    const p = point(event);
    if (!drag || !p) return;
    if (Math.hypot(p.x - drag.startX, p.y - drag.startY) < 8 && !drag.moved) return;
    drag.moved = true;
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
    if (!drag.moved) {
      const next = piecesRef.current.map((item) => item.id === piece.id
        ? { ...item, rotation: (item.rotation + 1) % 4 } : item);
      piecesRef.current = next;
      setPieces(next);
      return;
    }
    const targetX = BOARD_X + (piece.id % COLS) * WIDTH;
    const targetY = BOARD_Y + Math.floor(piece.id / COLS) * HEIGHT;
    if (piece.rotation === 0 && Math.hypot(piece.x - targetX, piece.y - targetY) < 38) {
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
            <svg ref={svgRef} viewBox="0 0 1000 650" className={styles.playArea} role="img" aria-label="Пазл: перетащи детали на места в центральном поле, нажми на деталь для поворота">
              <defs>
                {Array.from({ length: COLS * ROWS }, (_, id) => <clipPath key={id} id={`road-piece-${id}`} clipPathUnits="userSpaceOnUse"><path d={pieceShape(id)} /></clipPath>)}
              </defs>
              <rect x={BOARD_X} y={BOARD_Y} width={WIDTH * COLS} height={HEIGHT * ROWS} fill="#100d09" fillOpacity=".9" stroke="#d5a657" strokeWidth="4" />
              {Array.from({ length: COLS * ROWS }, (_, id) => <rect key={id} x={BOARD_X + id % COLS * WIDTH} y={BOARD_Y + Math.floor(id / COLS) * HEIGHT} width={WIDTH} height={HEIGHT} fill="none" stroke="#a68856" strokeOpacity=".65" strokeDasharray="5 5" />)}
              {pieces.map((piece) => (
                <g key={piece.id} transform={`translate(${piece.x} ${piece.y})`} onPointerDown={(event) => begin(event, piece)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className={piece.placed ? styles.placed : styles.draggable}>
                  <g transform={`rotate(${piece.rotation * 90} ${WIDTH / 2} ${HEIGHT / 2})`}>
                    <path d={pieceShape(piece.id)} fill="#392918" stroke="#f0cb81" strokeWidth="5" />
                    <g clipPath={`url(#road-piece-${piece.id})`}>
                      <image href={image} x={-(piece.id % COLS) * WIDTH} y={-Math.floor(piece.id / COLS) * HEIGHT} width={WIDTH * COLS} height={HEIGHT * ROWS} preserveAspectRatio="none" />
                    </g>
                    <path d={pieceShape(piece.id)} fill="transparent" stroke="#f0cb81" strokeWidth="2" />
                  </g>
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
        <p>Перетащи деталь на место. Нажми на неё, чтобы повернуть.</p>
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
