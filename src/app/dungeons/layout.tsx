import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Карты подземелий «Древнего Мира» (DM)',
  description: 'Интерактивные карты подземелий игры «Древний Мир» (DM): Сад Кошмаров, Малахитовые Рудники и Лес Теней.',
  alternates: { canonical: '/dungeons' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
