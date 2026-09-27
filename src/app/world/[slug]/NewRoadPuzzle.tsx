"use client";

import { useEffect, useRef, useState } from "react";
import { dimensions, NEW_PUZZLES, type PuzzleDifficulty, type PuzzleScore } from "@/lib/road-puzzle-data";
import styles from "./NewRoadPuzzle.module.css";

export type NewRound = { id: string; difficulty: PuzzleDifficulty; imageIndex: number; tiles: number[]; startedAt: number };
type Scores = Record<PuzzleDifficulty, PuzzleScore[]>;
const EMPTY_SCORES: Scores = { "5x7": [], "7x10": [] };

function time(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function NewRoadPuzzle({ round, screenshot, onAgain }: { round: NewRound; screenshot: string; onAgain: (difficulty: PuzzleDifficulty) => void }) {
  const { cols, rows } = dimensions(round.difficulty);
  const [tiles, setTiles] = useState(round.tiles);
  const [selected, setSelected] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finishedMs, setFinishedMs] = useState<number | null>(null);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [nick, setNick] = useState("");
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const movesRef = useRef<[number, number][]>([]);
  const finishingRef = useRef(false);
  const image = `/images/world/new-puzzles/${NEW_PUZZLES[round.imageIndex].file}.webp`;

  useEffect(() => {
    if (finishedMs !== null) return;
    const timer = window.setInterval(() => setElapsed(Math.max(0, Date.now() - round.startedAt)), 250);
    return () => window.clearInterval(timer);
  }, [finishedMs, round.startedAt]);

  useEffect(() => {
    fetch("/api/road-puzzle", { cache: "no-store" }).then((response) => response.json())
      .then((data) => { if (data.scores) setScores(data.scores); })
      .catch(() => {});
  }, []);

  async function complete(moves: [number, number][]) {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setMessage("Проверяю результат...");
    try {
      const response = await fetch("/api/road-puzzle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finish", id: round.id, moves }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.message || "Результат не сохранился");
      setFinishedMs(data.elapsedMs);
      setElapsed(data.elapsedMs);
      setClaimId(data.claimId);
      setMessage(data.qualifies ? "Результат вошёл в топ-10! Впиши свой ник, чтобы сохранить его." : "Пазл собран! Результат не вошёл в топ-10. Попробуй ещё раз.");
      const updated = await fetch("/api/road-puzzle", { cache: "no-store" }).then((reply) => reply.json());
      if (updated.scores) setScores(updated.scores);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось проверить результат");
      finishingRef.current = false;
    }
  }

  function choose(index: number) {
    if (finishedMs !== null || finishingRef.current) return;
    if (selected === null) { setSelected(index); return; }
    if (selected === index) { setSelected(null); return; }
    const next = [...tiles];
    [next[selected], next[index]] = [next[index], next[selected]];
    const moves = [...movesRef.current, [selected, index] as [number, number]];
    movesRef.current = moves;
    setTiles(next);
    setSelected(null);
    if (next.every((tile, place) => tile === place)) void complete(moves);
  }

  async function saveNick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!claimId || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/road-puzzle", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", claimId, nick }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.message || "Не удалось сохранить ник");
      setScores((previous) => ({ ...previous, [round.difficulty]: data.scores }));
      setClaimId(null);
      setMessage("Твой ник и результат сохранены в топе!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить результат");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.stage}>
        <img src={screenshot} alt="" className={styles.backdrop} />
        <div className={styles.toolbar}>
          <span>Новый пазл: {NEW_PUZZLES[round.imageIndex].name} · {round.difficulty}</span>
          <strong>Время: {time(elapsed)}</strong>
          <button type="button" onClick={() => setShowReference((value) => !value)} aria-pressed={showReference}>{showReference ? "Скрыть картинку" : "Посмотреть картинку"}</button>
        </div>
        <div className={styles.board} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, aspectRatio: "1448 / 1024" }} aria-label={`Пазл ${round.difficulty}. Нажми на две части, чтобы поменять их местами`}>
          {tiles.map((tile, place) => (
            <button key={place} type="button"
              className={`${styles.tile} ${selected === place ? styles.selected : ""}`}
              style={{ backgroundImage: `url(${image})`, backgroundSize: `${cols * 100}% ${rows * 100}%`, backgroundPosition: `${(tile % cols) * 100 / (cols - 1)}% ${Math.floor(tile / cols) * 100 / (rows - 1)}%` }}
              onClick={() => choose(place)} aria-label={`Часть ${place + 1}${selected === place ? ", выбрана" : ""}`} aria-pressed={selected === place} />
          ))}
        </div>
        {showReference && <div className={styles.reference}><img src={image} alt={`Целая картинка: ${NEW_PUZZLES[round.imageIndex].name}`} /></div>}
        {finishedMs !== null && <div className={styles.finish} role="status">
          <strong>Молодец! Пазл собран за {time(finishedMs)}.</strong>
          <p>{message}</p>
          {claimId && <form onSubmit={saveNick} className={styles.nickForm}><label htmlFor="puzzle-nick">Твой ник в игре</label><input id="puzzle-nick" value={nick} onChange={(event) => setNick(event.target.value)} maxLength={24} required /><button type="submit" disabled={saving}>{saving ? "Сохраняю..." : "Записать в топ"}</button></form>}
          <button type="button" onClick={() => onAgain(round.difficulty)}>Собрать ещё пазл</button>
        </div>}
      </div>
      {message && finishedMs === null && <p className={styles.message} role="status">{message}</p>}
      <div className={styles.leaderboards}>
        {(["5x7", "7x10"] as const).map((difficulty) => <section key={difficulty}>
          <h3>Топ-10 · {difficulty}</h3>
          {scores[difficulty].length ? <ol>{scores[difficulty].map((score) => <li key={score.id}><span>{score.nick}</span><strong>{time(score.elapsedMs)}</strong></li>)}</ol> : <p>Пока нет результатов. Можно занять первое место!</p>}
        </section>)}
      </div>
    </div>
  );
}
