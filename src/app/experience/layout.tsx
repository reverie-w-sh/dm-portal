import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Калькулятор и таблица опыта — Древний Мир",
  description:
    "Узнай свой уровень и ап, посчитай, сколько опыта осталось до следующего апа и нового уровня в игре Древний Мир.",
  path: "/experience",
  image: "/og/experience.webp",
  imageAlt: "Калькулятор и таблица опыта для игры Древний Мир",
});

export default function ExperienceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
