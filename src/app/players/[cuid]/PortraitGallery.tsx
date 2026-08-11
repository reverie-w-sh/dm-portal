"use client";

import { useMemo, useState } from "react";
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
  const [selectedImageState, setSelectedImage] = useState<string>();
  const selectedImage = uniqueImages.includes(selectedImageState ?? "")
    ? selectedImageState
    : uniqueImages[0];

  return (
    <>
      <div className={styles.portraitFrame}>
        <PortraitImage
          src={selectedImage}
          alt={`Образ персонажа ${playerName}`}
          className={styles.portrait}
          fallbackClassName={styles.portraitFallback}
        />
      </div>

      {uniqueImages.length > 1 ? (
        <div className={styles.portraitGallery} aria-label={`Образы ${playerName}`}>
          {uniqueImages.map((src, index) => (
            <button
              type="button"
              className={`${styles.portraitThumbnail} ${
                src === selectedImage ? styles.activePortraitThumbnail : ""
              }`}
              aria-label={`Показать образ ${index + 1}`}
              aria-pressed={src === selectedImage}
              onClick={() => setSelectedImage(src)}
              key={src}
            >
              {/* Локальные GIF сохраняются без преобразования, включая анимацию. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
