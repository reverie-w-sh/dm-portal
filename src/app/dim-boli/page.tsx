"use client";

import { useEffect, useState } from "react";

export default function DimBoliPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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

        <div className="divider-accent mb-10" />

        <div className="kp-grid">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={id}
              className="kp-card cursor-pointer"
              onClick={() => {
                setSelected(id);
                setZoomed(false);
              }}
            >
              <img src={`/kp-maps/kp-map${id}.png`} alt={`Карта ${id}`} />

              <div className="kp-title">Карта {id}</div>
            </div>
          ))}
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
            src={`/kp-maps/kp-map${selected}.jpg`}
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
