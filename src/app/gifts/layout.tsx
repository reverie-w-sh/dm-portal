import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Подарочки для игры «Древний Мир» (DM)',
  description: 'Каталог наших клановых подарков для игры «Древний Мир» (DM): скачивай, загружай через услуги коммерческого отдела и дари их! :)',
  alternates: { canonical: '/gifts' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/gifts",
    title: "Подарочки для игры «Древний Мир» (DM)",
    description: "Каталог наших клановых подарков для игры «Древний Мир» (DM): скачивай, загружай через услуги коммерческого отдела и дари их! :)",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Подарочки для игры «Древний Мир» (DM)",
    description: "Каталог наших клановых подарков для игры «Древний Мир» (DM): скачивай, загружай через услуги коммерческого отдела и дари их! :)",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
