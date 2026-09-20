"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type ScreenshotModalProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export default function ScreenshotModal({ src, alt, priority = false }: ScreenshotModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.zoomImageButton}
        onClick={() => setOpen(true)}
        title="Нажми, чтобы посмотреть в оригинальном размере"
        aria-label={`${alt}. Открыть в оригинальном размере`}
      >
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </button>

      {open && (
        <div
          className={styles.zoomModal}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className={styles.zoomClose}
            onClick={() => setOpen(false)}
            aria-label="Закрыть изображение"
            title="Закрыть"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            className={styles.zoomModalImage}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
