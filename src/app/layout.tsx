import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteAnalytics from "@/components/SiteAnalytics";
import { SITE_NAME, SITE_URL } from "@/lib/metadata";

const defaultTitle = "die Wölfchen — клан игры «Древний Мир» (DM)";
const defaultDescription =
  "Сайт клана die Wölfchen в игре «Древний Мир» (DM) — продолжении и аналоге игры BloodyWorld (КМ). Участники клана, карты подземелий, личные смайлики, подарочки и полезные инструменты для игроков.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/og/home.webp",
        width: 1200,
        height: 630,
        alt: "Белая и тёмная волчицы клана die Wölfchen на фоне замка",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og/home.webp"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-dark text-ink">
        <Navbar />
        <main className="site-content">{children}</main>
        <Footer />
        <SiteAnalytics />
      </body>
    </html>
  );
}
