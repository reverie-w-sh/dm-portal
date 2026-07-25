import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Планшет охотника — «Древний Мир» (DM)',
  description: 'Планшет охотника с автоматическим подсчётом очков для игроков «Древнего Мира» (DM).',
  alternates: { canonical: '/hunter-board' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/hunter-board",
    title: "Планшет охотника — «Древний Мир» (DM)",
    description: "Планшет охотника с автоматическим подсчётом очков для игроков «Древнего Мира» (DM).",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Планшет охотника — «Древний Мир» (DM)",
    description: "Планшет охотника с автоматическим подсчётом очков для игроков «Древнего Мира» (DM).",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
