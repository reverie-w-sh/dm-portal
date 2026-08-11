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
  const fallbackSrc = "/images/players/no-character.png";
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);

  return (
    // Изображения персонажей приходят с dm-game.com и сохраняют родной размер.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${imageSrc === fallbackSrc ? fallbackClassName : ""}`}
      onError={() => setImageSrc(fallbackSrc)}
    />
  );
}
