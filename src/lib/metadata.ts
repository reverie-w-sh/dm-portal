import type { Metadata } from "next";

export const SITE_URL = "https://wolfchen-clan.com";
export const SITE_NAME = "die Wölfchen";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image: string;
  imageAlt?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt = title,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url: path,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/webp",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
