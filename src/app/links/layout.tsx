import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Полезности для игроков «Древнего Мира» (DM)',
  description: 'Карты подземелий, планшет охотника, личные смайлики и другие полезные инструменты для игроков «Древнего Мира» (DM).',
  alternates: { canonical: '/links' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/links",
    title: "Полезности для игроков «Древнего Мира» (DM)",
    description: "Карты подземелий, планшет охотника, личные смайлики и другие полезные инструменты для игроков «Древнего Мира» (DM).",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Полезности для игроков «Древнего Мира» (DM)",
    description: "Карты подземелий, планшет охотника, личные смайлики и другие полезные инструменты для игроков «Древнего Мира» (DM).",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
