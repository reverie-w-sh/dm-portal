import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сравнение альянсов «Древнего Мира» (DM)',
  description: 'Сравнение альянсов игры «Древний Мир» (DM): количество участников, средний и максимальный уровень игроков.',
  alternates: { canonical: '/alliances/compare' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/alliances/compare",
    title: "Сравнение альянсов «Древнего Мира» (DM)",
    description: "Сравнение альянсов игры «Древний Мир» (DM): количество участников, средний и максимальный уровень игроков.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Сравнение альянсов «Древнего Мира» (DM)",
    description: "Сравнение альянсов игры «Древний Мир» (DM): количество участников, средний и максимальный уровень игроков.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
