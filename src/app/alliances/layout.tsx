import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Альянсы игры «Древний Мир» (DM)',
  description: 'Список альянсов игры «Древний Мир» (DM) и их статистика.',
  alternates: { canonical: '/alliances' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/alliances",
    title: "Альянсы игры «Древний Мир» (DM)",
    description: "Список альянсов игры «Древний Мир» (DM) и их статистика.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Альянсы игры «Древний Мир» (DM)",
    description: "Список альянсов игры «Древний Мир» (DM) и их статистика.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
