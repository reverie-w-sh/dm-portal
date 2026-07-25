import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сравнение кланов «Древнего Мира» (DM)',
  description: 'Сравнивай кланы игры «Древний Мир» (DM): уровни игроков, количество участников, смайлики и место в мире игры.',
  alternates: { canonical: '/clans/compare' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/clans/compare",
    title: "Сравнение кланов «Древнего Мира» (DM)",
    description: "Сравнивай кланы игры «Древний Мир» (DM): уровни игроков, количество участников, смайлики и место в мире игры.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Сравнение кланов «Древнего Мира» (DM)",
    description: "Сравнивай кланы игры «Древний Мир» (DM): уровни игроков, количество участников, смайлики и место в мире игры.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
