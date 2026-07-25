import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Малахитовые Рудники — карта «Древнего Мира» (DM)',
  description: 'Карта подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM): расположение боссов, монстров и маршрутов.',
  alternates: { canonical: '/malahitovye-rudniki' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/malahitovye-rudniki",
    title: "Малахитовые Рудники — карта «Древнего Мира» (DM)",
    description: "Карта подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM): расположение боссов, монстров и маршрутов.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Малахитовые Рудники — карта «Древнего Мира» (DM)",
    description: "Карта подземелья «Малахитовые Рудники» в игре «Древний Мир» (DM): расположение боссов, монстров и маршрутов.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
