import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Рейтинги игроков «Древнего Мира» (DM)',
  description: 'Рейтинги игроков игры «Древний Мир» (DM): уровни, активность и статистика.',
  alternates: { canonical: '/ratings' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/ratings",
    title: "Рейтинги игроков «Древнего Мира» (DM)",
    description: "Рейтинги игроков игры «Древний Мир» (DM): уровни, активность и статистика.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Рейтинги игроков «Древнего Мира» (DM)",
    description: "Рейтинги игроков игры «Древний Мир» (DM): уровни, активность и статистика.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
