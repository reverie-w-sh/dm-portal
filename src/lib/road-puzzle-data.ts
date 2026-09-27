export const NEW_PUZZLES = [
  { name: "Дорога к пещере", file: "road-to-cave" },
  { name: "Малахитовые Рудники", file: "malachite-mines" },
  { name: "Сад Кошмаров", file: "garden-of-nightmares" },
  { name: "Василиск", file: "basilisk" },
  { name: "Бестия из Ада", file: "beast-from-hell" },
  { name: "Древний дракон", file: "ancient-dragon" },
  { name: "Волчата", file: "wolfchen" },
  { name: "Зачарование вещи", file: "enchanting" },
] as const;

export type PuzzleDifficulty = "5x7" | "7x10";

export function dimensions(difficulty: PuzzleDifficulty) {
  return difficulty === "5x7" ? { cols: 7, rows: 5 } : { cols: 10, rows: 7 };
}

export type PuzzleScore = { id: string; nick: string; elapsedMs: number; imageIndex: number };
