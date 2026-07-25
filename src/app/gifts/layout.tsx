import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Подарочки для игры «Древний Мир» (DM)',
  description: 'Каталог наших клановых подарков для игры «Древний Мир» (DM): скачивай, загружай через услуги коммерческого отдела и дари их! :)',
  alternates: { canonical: '/gifts' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
