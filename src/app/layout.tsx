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

export const metadata: Metadata = {
  title: {
    default: "die Wölfchen",
    template: "%s | die Wölfchen",
  },
  description: "Официальный сайт клана die Wölfchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-dark text-ink flex flex-col">

        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}
