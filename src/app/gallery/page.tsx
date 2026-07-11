"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

type Category = "pictures" | "smileys" | "voplots" | "portraits";

interface GalleryItem {
  src: string;
  title: string;
  category: Category;
}

const CATEGORY_LABELS: Record<Category, string> = {
  pictures:  "Картинки",
  smileys:   "Смайлы",
  voplots:   "Воплоты",
  portraits: "Образы персонажей",
};

const CATEGORY_ORDER: Category[] = ["pictures", "smileys", "voplots", "portraits"];

// Чтобы добавить новую картинку: залей файл в public/gallery/ на GitHub,
// затем добавь сюда новую строку с именем файла, подписью и категорией.
const GALLERY: GalleryItem[] = [
  
 { src: "/gallery/auf1.png",       title: "АУФЬ!",         category: "pictures" },
 { src: "/gallery/auf2.png",       title: "АУФЬ!",         category: "pictures" }, 
 { src: "/gallery/lapa-1.png",       title: "Лапка клана",         category: "pictures" },
 { src: "/gallery/lapa-2.png",       title: "Лапка клана",         category: "pictures" },
 { src: "/gallery/pack-family-fire.jpg",  title: "У костра",              category: "pictures" },
 { src: "/gallery/for-you.gif",       title: "Для тебя)",         category: "pictures" },  
 { src: "/gallery/popcorn.png",       title: "Лавочка :)",         category: "pictures" }, 
 { src: "/gallery/ak.gif",       title: "Образ A&K",         category: "pictures" },
 { src: "/gallery/allania.gif",       title: "Образ A",         category: "pictures" },
 { src: "/gallery/aw-0-1.gif",       title: "Образ W&A",         category: "pictures" },  
 { src: "/gallery/aw-1-1.gif",       title: "Образ W&A",         category: "pictures" },  
 { src: "/gallery/aw-2-1.gif",       title: "Образ W&A",         category: "pictures" },  
 { src: "/gallery/aw-3-1.gif",       title: "Образ W&A",         category: "pictures" },  
 { src: "/gallery/aw-4-1.gif",       title: "Образ W&A",         category: "pictures" },  
 { src: "/gallery/ххххх.png",       title: "Образ W&A",         category: "pictures" },   

  
  { src: "/gallery/warrior-and-wolf.jpg",  title: "Warrior & his Wolf",      category: "portraits" },
  { src: "/gallery/allania.png",          title: "White",                  category: "portraits" },  
  { src: "/gallery/clan.gif",       title: "Клановый",         category: "portraits" },  
  { src: "/gallery/clan2.png",          title: "Клановый",                  category: "portraits" },  

  { src: "/gallery/voplot-wolfchen-1.gif",   title: "Wölfchen",   category: "voplots" },
  { src: "/gallery/voplot-wolfchen.gif",   title: "Wölfchen",   category: "voplots" },
  { src: "/gallery/voplot-volk.gif",       title: "Волк",       category: "voplots" },
  { src: "/gallery/voplot-volchica.gif",   title: "Волчица",    category: "voplots" },
  { src: "/gallery/voplot-volchica-3.gif", title: "Волчица3",   category: "voplots" },
  { src: "/gallery/pup-hand-red.jpg",      title: "Малыш стаи",            category: "voplots" },
  { src: "/gallery/pup-hand-blue.jpg",     title: "Искра во тьме",         category: "voplots" },  
  { src: "/gallery/wolf-blue-moon.jpg",    title: "Под лунным светом",     category: "voplots" },
  { src: "/gallery/wolf-blood-forest.jpg", title: "Волчица",  category: "voplots" },
  { src: "/gallery/wolf-blood-white.jpg", title: "Волчица",  category: "voplots" },



  { src: "/gallery/smileys/auf.gif",     title: "Ауфь!",             category: "smileys" },

  { src: "/gallery/smileys/popcorn-girls.gif",     title: "Лавочка",             category: "smileys" },
  { src: "/gallery/smileys/wolf-girl-allania.gif",           title: "Волчица Аланьки",             category: "smileys" },

  { src: "/gallery/smileys/wolf-girl-katya.gif",   title: "Волчица Катерины",        category: "smileys" },
  { src: "/gallery/smileys/wolf-girl-vova.gif",    title: "Волчица Лени",        category: "smileys" },
  { src: "/gallery/smileys/wolf-girl-vova-1.gif",    title: "Волчица Лени",        category: "smileys" },
  { src: "/gallery/smileys/wolf-girl-asta.gif",    title: "Волчица Асталависты",        category: "smileys" },
  { src: "/gallery/smileys/play.gif",          title: "Волчата играются",   category: "smileys" },
  { src: "/gallery/smileys/kiss-1.gif",            title: "Любовь Волчат",             category: "smileys" },
  { src: "/gallery/smileys/kiss-2.gif",            title: "Любовь Волчат 2",           category: "smileys" },
  { src: "/gallery/smileys/kiss-3.gif",            title: "Любовь Волчат 3",           category: "smileys" },
  { src: "/gallery/smileys/hug-wave.gif",          title: "Клановые Волчата. Обнимашки",               category: "smileys" },
  { src: "/gallery/smileys/wanteck-allania-hug.gif",       title: "Волчата Аллании и Вантека",             category: "smileys" },
  { src: "/gallery/smileys/sad-wolf.gif",       title: "Волчица в печали",             category: "smileys" },
  { src: "/gallery/smileys/carrying-off.gif",      title: "I'm taking you... for reasons",              category: "smileys" },  
  { src: "/gallery/smileys/popcorn-cubs.gif",      title: "Попкорн",   category: "smileys" },
  { src: "/gallery/smileys/drinking-coffee.gif",   title: "Кофе",           category: "smileys" },
  { src: "/gallery/smileys/watermelon.gif",        title: "Арбузик",             category: "smileys" },
  { src: "/gallery/smileys/hug-hearts.gif",        title: "Обнимашки",           category: "smileys" },
  { src: "/gallery/smileys/chibi-sit.gif",         title: "Лапки устали",               category: "smileys" },
  { src: "/gallery/smileys/good-morning-mug.gif",  title: "Доброе утро",         category: "smileys" },
  { src: "/gallery/smileys/coffee-for-you.gif",    title: "Кофе для тебя",       category: "smileys" },
  { src: "/gallery/smileys/morning-coffee.gif",    title: "Кавуся",       category: "smileys" },
  { src: "/gallery/smileys/wolf-clan-s-3.gif",    title: "Волчонок и монитор 3",       category: "smileys" },
  { src: "/gallery/smileys/wolf-clan-s-1.gif",    title: "Волчонок и монитор 1",       category: "smileys" },
];

function scrollToCategory(key: Category) {
  document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function GalleryPage() {
  const [activeItems, setActiveItems] = useState<GalleryItem[] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const close = useCallback(() => setActiveItems(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (activeItems ? (i - 1 + activeItems.length) % activeItems.length : 0)),
    [activeItems],
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (activeItems ? (i + 1) % activeItems.length : 0)),
    [activeItems],
  );

  useEffect(() => {
    if (!activeItems) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeItems, close, showPrev, showNext]);

  const active = activeItems ? activeItems[activeIndex] : null;

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-ink tracking-tight">
          Галерея
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Всякое разное :) 
        </p>
      </div>
      <div className="divider-accent mb-6" />

      {/* Быстрые ссылки-якоря на разделы ниже */}
      <div className="flex flex-wrap gap-2 mb-10 sticky top-[68px] z-30 py-2 -mx-2 px-2 backdrop-blur-sm">
        {CATEGORY_ORDER.map((key) => {
          const count = GALLERY.filter((g) => g.category === key).length;
          return (
            <button
              key={key}
              onClick={() => scrollToCategory(key)}
              className="text-xs px-4 py-2.5 rounded-lg border border-white/10 text-ink-muted hover:text-ink hover:border-white/20 transition-colors font-medium"
            >
              {CATEGORY_LABELS[key]} · {count}
            </button>
          );
        })}
      </div>

{CATEGORY_ORDER.map((key) => {
        const items = GALLERY.filter((g) => g.category === key);
        const isSmileys = key === "smileys";
        const isVoplots = key === "voplots";

        return (
          <section key={key} id={`section-${key}`} className="mb-14 scroll-mt-32">
            <h2 className="text-xl font-bold text-ink mb-5">
              {CATEGORY_LABELS[key]}
            </h2>

            {items.length > 0 ? (
              isSmileys ? (
                // Смайлы: сетка мелких карточек на светло-серой подложке — так же,
                // как они будут смотреться в чате (фон чата #d3d3d3).
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {items.map((item, i) => (
                    <button
                      key={item.src}
                      onClick={() => { setActiveItems(items); setActiveIndex(i); }}
                      className="rounded-xl overflow-hidden cursor-zoom-in text-left border border-black/10 hover:border-[#b86a16]/50 transition-colors"
                      style={{ background: "#d3d3d3" }}
                    >
                      <div className="aspect-square flex items-center justify-center p-3">
                        <Image
                          src={item.src}
                          alt={item.title}
                          width={300}
                          height={300}
                          unoptimized
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              ) : isVoplots ? (
                // Воплоты: показываем в их родном размере (205px шириной), не растягивая.
                <div className="flex flex-wrap gap-4">
                  {items.map((item, i) => (
                    <button
                      key={item.src}
                      onClick={() => { setActiveItems(items); setActiveIndex(i); }}
                      className="glass-hover glass rounded-2xl overflow-hidden cursor-zoom-in shrink-0"
                    >
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={205}
                        height={283}
                        unoptimized
                        className="block  w-[205px] h-[283px]"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
                  {items.map((item, i) => (
                    <button
                      key={item.src}
                      onClick={() => { setActiveItems(items); setActiveIndex(i); }}
                      className="glass-hover glass rounded-2xl overflow-hidden mb-4 w-full block break-inside-avoid cursor-zoom-in text-left"
                    >
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={800}
                        height={800}
                        unoptimized={item.src.endsWith(".gif")}
                        className="w-full h-auto object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="glass rounded-2xl p-14 text-center">
                <div className="text-4xl mb-3 opacity-20">🖼</div>
                <p className="text-ink-muted text-sm">Пока здесь пусто</p>
              </div>
            )}
          </section>
        );
      })}

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
            <div
              className="rounded-xl p-4 flex items-center justify-center"
              style={{ background: active.src.includes("/smileys/") ? "#d3d3d3" : "transparent" }}
            >
              <Image
                src={active.src}
                alt={active.title}
                width={1600}
                height={1600}
                unoptimized={active.src.endsWith(".gif")}
                className="max-w-[88vw] max-h-[70vh] w-auto h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
