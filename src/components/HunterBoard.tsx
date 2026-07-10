"use client";

import { useEffect, useState } from "react";

type Mark = "" | "miss" | "1" | "3";

type Cell = {
  left: Mark;
  center: Mark;
  right: Mark;
};

const emptyCell: Cell = {
  left: "",
  center: "",
  right: "",
};

const createBoard = () =>
  Array.from({ length: 16 }, () => ({ ...emptyCell }));

export default function HunterBoard() {
  const [board, setBoard] = useState<Cell[]>(createBoard());

  useEffect(() => {
    const saved = localStorage.getItem("hunter-board");

    if (saved) {
      setBoard(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "hunter-board",
      JSON.stringify(board)
    );
  }, [board]);

  const changeMark = (
    index: number,
    side: keyof Cell,
    value: Mark
  ) => {
    const copy = [...board];

    copy[index] = {
      ...copy[index],
      [side]: value,
    };

    setBoard(copy);
  };


  const resetBoard = () => {
    if (confirm("Очистить весь планшет?")) {
      setBoard(createBoard());
    }
  };


  const score = board.reduce((sum, cell) => {
    return (
      sum +
      (cell.left === "1" ? 1 : cell.left === "3" ? 3 : 0) +
      (cell.center === "1" ? 1 : cell.center === "3" ? 3 : 0) +
      (cell.right === "1" ? 1 : cell.right === "3" ? 3 : 0)
    );
  }, 0);


  const checked = board.filter(cell =>
    cell.left || cell.center || cell.right
  ).length;


  const buttons = [
    { label: "✖", value: "miss" },
    { label: "+1", value: "1" },
    { label: "+3", value: "3" },
  ] as const;


  return (
    <div>

      <div className="flex gap-6 mb-6 text-sm">
        <div>
          🏆 Очки: 
          <b className="ml-2">{score}</b>
        </div>

        <div>
          🔎 Проверено:
          <b className="ml-2">
            {checked}/16
          </b>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {board.map((cell, index) => (

          <div
            key={index}
            className="
              bg-white/10
              border border-white/20
              rounded-xl
              p-3
            "
          >

            <div className="text-center font-bold mb-3">
              Клетка {index + 1}
            </div>


            {(["left","center","right"] as const)
              .map(side => (

              <div
                key={side}
                className="mb-3"
              >

                <div className="text-xs text-white/60 mb-1">
                  {
                    side === "left"
                    ? "Лево"
                    : side === "center"
                    ? "Центр"
                    : "Право"
                  }
                </div>


                <div className="flex gap-1">

                  {buttons.map(btn => (

                    <button
                      key={btn.value}
                      onClick={() =>
                        changeMark(
                          index,
                          side,
                          btn.value
                        )
                      }

                      className={`
                        flex-1
                        rounded
                        py-1
                        text-sm
                        ${
                          cell[side] === btn.value
                          ? "bg-white text-black"
                          : "bg-black/40"
                        }
                      `}
                    >
                      {btn.label}
                    </button>

                  ))}

                </div>

              </div>

            ))}


          </div>

        ))}

      </div>


      <button
        onClick={resetBoard}
        className="
          mt-8
          px-5
          py-2
          rounded-lg
          bg-red-700
          hover:bg-red-600
        "
      >
        🧹 Очистить планшет
      </button>


    </div>
  );
}
