import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Карта Дома Боли — «Древний Мир» (DM)',
  description: 'Интерактивная карта Дома Боли в игре «Древний Мир» (DM) с удобным поиском координат.',
  alternates: { canonical: '/dom-boli' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/dom-boli",
    title: "Карта Дома Боли — «Древний Мир» (DM)",
    description: "Интерактивная карта Дома Боли в игре «Древний Мир» (DM) с удобным поиском координат.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Карта Дома Боли — «Древний Мир» (DM)",
    description: "Интерактивная карта Дома Боли в игре «Древний Мир» (DM) с удобным поиском координат.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
