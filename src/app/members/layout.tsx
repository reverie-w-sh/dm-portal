import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Волчата — состав клана die Wölfchen в «Древнем Мире» (DM)',
  description: 'Все участники клана die Wölfchen в игре «Древний Мир» (DM): уровни, реинкарнации и состав нашей стаи.',
  alternates: { canonical: '/members' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/members",
    title: "Волчата — состав клана die Wölfchen в «Древнем Мире» (DM)",
    description: "Все участники клана die Wölfchen в игре «Древний Мир» (DM): уровни, реинкарнации и состав нашей стаи.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Волчата — состав клана die Wölfchen в «Древнем Мире» (DM)",
    description: "Все участники клана die Wölfchen в игре «Древний Мир» (DM): уровни, реинкарнации и состав нашей стаи.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
