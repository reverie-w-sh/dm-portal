"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { PortraitImage } from "./PortraitImage";
import styles from "./page.module.css";

export function PortraitGallery({
  images,
  playerName,
}: {
  images: string[];
  playerName: string;
}) {
  const uniqueImages = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    if (!isGalleryOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsGalleryOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isGalleryOpen]);

  return (
    <>
      <div className={styles.portraitFrame}>
        <PortraitImage
          src={uniqueImages[0]}
          alt={`Образ персонажа ${playerName}`}
          className={styles.portrait}
          fallbackClassName={styles.portraitFallback}
        />
      </div>

      {uniqueImages.length > 1 ? (
        <button
          type="button"
          className={styles.portraitGalleryLink}
          onClick={() => setIsGalleryOpen(true)}
        >
          Галерея образов <span>· {uniqueImages.length}</span>
        </button>
      ) : null}

      {isGalleryOpen
        ? createPortal(
            <div
              className={styles.portraitGalleryOverlay}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setIsGalleryOpen(false);
              }}
            >
              <section
                className={styles.portraitGalleryModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="portrait-gallery-title"
              >
                <header className={styles.portraitGalleryHeader}>
                  <div>
                    <h2 id="portrait-gallery-title">Галерея образов</h2>
                    <p>{playerName} · {uniqueImages.length}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.portraitGalleryClose}
                    aria-label="Закрыть галерею"
                    onClick={() => setIsGalleryOpen(false)}
                    autoFocus
                  >
                    ×
                  </button>
                </header>

                <div className={styles.portraitGalleryGrid}>
                  {uniqueImages.map((src, index) => (
                    <figure className={styles.galleryPortrait} key={src}>
                      {/* Локальные GIF сохраняются без преобразования, включая анимацию. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Образ ${playerName}, ${index + 1}`}
                        loading="lazy"
                      />
                    </figure>
                  ))}
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
