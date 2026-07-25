import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter-src",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

const siteUrl = "https://wolfchen-clan.com";
const defaultDescription =
  "Сайт клана die Wölfchen в игре «Древний Мир» (DM) — продолжении и аналоге игры BloodyWorld (КМ). Участники клана, карты подземелий, личные смайлики, подарочки и полезные инструменты для игроков.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "die Wölfchen — клан игры «Древний Мир» (DM)",
    template: "%s | die Wölfchen",
  },
  description: defaultDescription,
  applicationName: "die Wölfchen",
  authors: [{ name: "die Wölfchen" }],
  creator: "die Wölfchen",
  publisher: "die Wölfchen",
  keywords: [
    "Древний Мир",
    "DM",
    "BloodyWorld",
    "КМ",
    "браузерная MMORPG",
    "кланы Древнего Мира",
    "карты Древнего Мира",
    "Сад Кошмаров",
    "Малахитовые Рудники",
    "Лес Теней",
    "die Wölfchen",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "die Wölfchen",
    title: "die Wölfchen — клан игры «Древний Мир» (DM)",
    description: defaultDescription,
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "die Wölfchen — клан игры «Древний Мир» (DM)",
    description: defaultDescription,
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-dark text-ink flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
