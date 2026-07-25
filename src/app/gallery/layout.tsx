import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Галерея die Wölfchen — «Древний Мир» (DM)',
  description: 'Арты, волки, эльфы и памятные моменты клана die Wölfchen из игры «Древний Мир» (DM).',
  alternates: { canonical: '/gallery' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/gallery",
    title: "Галерея die Wölfchen — «Древний Мир» (DM)",
    description: "Арты, волки, эльфы и памятные моменты клана die Wölfchen из игры «Древний Мир» (DM).",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Галерея die Wölfchen — «Древний Мир» (DM)",
    description: "Арты, волки, эльфы и памятные моменты клана die Wölfchen из игры «Древний Мир» (DM).",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
