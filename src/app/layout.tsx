import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
      <body className="min-h-screen bg-dark text-ink">
        <Navbar />

        <main className="min-h-screen">{children}</main>

        <footer className="mt-24 mb-8">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

              <div
                className="w-8 h-8 rounded-lg border border-[#b8b8b8] flex items-center justify-center"
                style={{
                  background: "#d3d3d3",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,.85), 0 4px 14px rgba(0,0,0,.35)",
                }}
              >
                <img
                  src="https://dm-game.com/pics/clanpic/clan_278.gif"
                  alt=""
                  className="w-[19px] h-[19px]"
                />
              </div>

              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />
            </div>

            <div className="flex flex-col items-center gap-5">
              <Link href="/" className="group" title="На главную">
                <div
                  className="w-10 h-10 rounded-xl border border-[#b8b8b8] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:border-[#ffd58d]"
                  style={{
                    background: "#d3d3d3",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,.85), 0 4px 14px rgba(0,0,0,.35)",
                  }}
                >
                  <img
                    src="https://dm-game.com/pics/clanpic/clan_278.gif"
                    alt="Главная"
                    className="w-[19px] h-[19px]"
                  />
                </div>
              </Link>

              <div className="flex flex-wrap justify-center gap-7 text-sm">
                <Link
                  href="/members"
                  className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
                >
                  Состав
                </Link>

                <Link
                  href="/clans"
                  className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
                >
                  Кланы
                </Link>

                <Link
                  href="/gifts"
                  className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
                >
                  Подарочки
                </Link>

                <Link
                  href="/links"
                  className="text-[#b9bec6] hover:text-[#ffd58d] transition-colors"
                >
                  Что-то полезное
                </Link>
              </div>

              <Link
                href="/"
                className="text-[11px] text-[#777] hover:text-[#a8a8a8] transition-colors tracking-wide"
                title="♥"
              >
                ♥ 2026 © A&amp;W ♥
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
