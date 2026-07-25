import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Сад Кошмаров — карта «Древнего Мира» (DM)',
  description: 'Интерактивная карта подземелья «Сад Кошмаров» в игре «Древний Мир» (DM): маршруты, боссы и опасные места.',
  alternates: { canonical: '/sad-koshmarov' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/sad-koshmarov",
    title: "Сад Кошмаров — карта «Древнего Мира» (DM)",
    description: "Интерактивная карта подземелья «Сад Кошмаров» в игре «Древний Мир» (DM): маршруты, боссы и опасные места.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Сад Кошмаров — карта «Древнего Мира» (DM)",
    description: "Интерактивная карта подземелья «Сад Кошмаров» в игре «Древний Мир» (DM): маршруты, боссы и опасные места.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
