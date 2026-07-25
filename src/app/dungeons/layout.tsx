import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Карты подземелий «Древнего Мира» (DM)',
  description: 'Интерактивные карты подземелий игры «Древний Мир» (DM): Сад Кошмаров, Малахитовые Рудники и Лес Теней.',
  alternates: { canonical: '/dungeons' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/dungeons",
    title: "Карты подземелий «Древнего Мира» (DM)",
    description: "Интерактивные карты подземелий игры «Древний Мир» (DM): Сад Кошмаров, Малахитовые Рудники и Лес Теней.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Карты подземелий «Древнего Мира» (DM)",
    description: "Интерактивные карты подземелий игры «Древний Мир» (DM): Сад Кошмаров, Малахитовые Рудники и Лес Теней.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
