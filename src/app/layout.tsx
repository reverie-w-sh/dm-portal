import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter-src",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "die Wölfchen",
  description: "Официальный сайт клана die Wölfchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-dark text-ink">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-white/[0.06] mt-20 py-8 text-center text-ink-muted text-sm">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="text-ink-dim font-semibold mb-1">🐺 die Wölfchen</div>
            <div className="text-xs text-ink-muted">Стая. Честь. Верность.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
