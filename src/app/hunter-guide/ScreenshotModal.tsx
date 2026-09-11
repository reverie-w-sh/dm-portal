"use client";

import { useEffect, useState } from "react";

export default function ScreenshotModal({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <figure className="mt-5 overflow-hidden rounded-xl border border-[#79501f] bg-[#050605] p-2 shadow-[0_12px_30px_rgba(0,0,0,.38)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={`${title}. Нажми, чтобы увеличить`}
          className="block w-full cursor-zoom-in border-0 bg-transparent p-0"
        >
          <img
            src={src}
            alt={alt}
            title={title}
            loading="lazy"
            className="h-auto w-full rounded-lg object-contain"
          />
        </button>
        <figcaption className="px-2 pb-1 pt-2 text-center text-[11px] text-[#8f7a5c]">
          Нажми на скриншот, чтобы увеличить
        </figcaption>
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#a67a3a] bg-[#090a09]/90 text-2xl text-[#ead1a2] shadow-lg"
            aria-label="Закрыть изображение"
            title="Закрыть"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            title={title}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[94vh] max-w-[96vw] cursor-default object-contain shadow-[0_20px_70px_rgba(0,0,0,.75)]"
          />
        </div>
      )}
    </>
  );
}
