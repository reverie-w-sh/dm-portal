"use client";

import { useState } from "react";

type PortraitImageProps = {
  src?: string;
  alt: string;
  className: string;
  fallbackClassName: string;
  width?: number;
  height?: number;
};

export function PortraitImage({
  src,
  alt,
  className,
  fallbackClassName,
  width = 104,
  height = 184,
}: PortraitImageProps) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <span
        className={`${className} ${fallbackClassName}`}
        role="img"
        aria-label={alt}
      >
        🐾
      </span>
    );
  }

  return (
    // Изображения персонажей приходят с dm-game.com и сохраняют родной размер.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
