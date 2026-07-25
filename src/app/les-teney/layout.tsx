import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Лес Теней — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Лес Теней» в игре «Древний Мир» (DM): боссы, монстры и полезные отметки игроков.',
  alternates: { canonical: '/les-teney' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/les-teney",
    title: "Лес Теней — карта «Древнего Мира» (DM)",
    description: "Карта подземелья «Лес Теней» в игре «Древний Мир» (DM): боссы, монстры и полезные отметки игроков.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Лес Теней — карта «Древнего Мира» (DM)",
    description: "Карта подземелья «Лес Теней» в игре «Древний Мир» (DM): боссы, монстры и полезные отметки игроков.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
