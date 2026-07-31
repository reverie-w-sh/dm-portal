import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор и таблица опыта — Древний Мир",
  description:
    "Узнай свой уровень и ап, посчитай, сколько опыта осталось до следующего апа и нового уровня в игре Древний Мир.",

  openGraph: {
    title: "Калькулятор и таблица опыта — Древний Мир",
    description:
      "Узнай свой уровень и ап, посчитай опыт до следующего апа и нового уровня.",
    url: "https://www.wolfchen-clan.com/experience",
    siteName: "die Wölfchen",
    images: [
      {
        url: "/og/experience.webp",
        width: 1200,
        height: 630,
        alt: "Калькулятор и таблица опыта для игры Древний Мир",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Калькулятор и таблица опыта — Древний Мир",
    description:
      "Посчитай опыт до следующего апа и нового уровня.",
    images: ["/og/experience.webp"],
  },
};

export default function ExperienceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
