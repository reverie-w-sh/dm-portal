"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  src: string;
  title: string;
}

// Чтобы добавить новую картинку: залей файл в public/gallery/ на GitHub,
// затем добавь сюда новую строку с именем файла и подписью.
const GALLERY: GalleryItem[] = [
  { src: "/gallery/pack-family-fire.jpg",  title: "У костра" },
  { src: "/gallery/wolf-blood-forest.jpg", title: "Волчица" },
  { src: "/gallery/wolf-blue-moon.jpg",    title: "Под лунным светом" },
  { src: "/gallery/pup-hand-red.jpg",      title: "Малыш стаи" },
  { src: "/gallery/pup-hand-blue.jpg",     title: "Искра во тьме" },
];

export default function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length)),
    [],
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % GALLERY.length)),
    [],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, showPrev, showNext]);

  const active = activeIndex !== null ? GALLERY[activeIndex] : null;

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Галерея
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Арты нашего клана — {GALLERY.length} {GALLERY.length === 1 ? "картина" : "картин"}
        </p>
      </div>
      <div className="divider-accent mb-8" />

      {GALLERY.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {GALLERY.map((item, i) => (
            <button
              key={item.src}
              onClick={() => setActiveIndex(i)}
              className="glass-hover glass rounded-2xl overflow-hidden mb-4 w-full block break-inside-avoid cursor-zoom-in text-left"
            >
              <Image
                src={item.src}
                alt={item.title}
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <p className="px-4 py-3 text-sm font-medium text-ink">
                {item.title}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-14 text-center">
          <div className="text-4xl mb-3 opacity-20">🖼</div>
          <p className="text-ink-muted text-sm">Пока здесь пусто</p>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────── */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10"
          style={{ background: "rgba(10, 8, 6, 0.92)" }}
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Закрыть"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full flex items-center justify-center text-2xl text-[#e6e6e6] hover:text-[#ffd58d] transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ✕
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            aria-label="Предыдущая"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-2xl text-[#e6e6e6] hover:text-[#ffd58d] transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ‹
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            aria-label="Следующая"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-2xl text-[#e6e6e6] hover:text-[#ffd58d] transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ›
          </button>

          <div
            className="max-w-[92vw] max-h-[86vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.title}
              width={1600}
              height={1600}
              className="max-w-[92vw] max-h-[76vh] w-auto h-auto object-contain rounded-xl"
              priority
            />
            <p className="text-[#e6e6e6] text-sm font-medium">{active.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
