import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Кланы игры «Древний Мир» (DM)',
  description: 'Список кланов игры «Древний Мир» (DM): участники, альянсы, клановые смайлики и сравнение кланов. Продолжение и аналог легендарной игры BloodyWorld (КМ).',
  alternates: { canonical: '/clans' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/clans",
    title: "Кланы игры «Древний Мир» (DM)",
    description: "Список кланов игры «Древний Мир» (DM): участники, альянсы, клановые смайлики и сравнение кланов. Продолжение и аналог легендарной игры BloodyWorld (КМ).",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Кланы игры «Древний Мир» (DM)",
    description: "Список кланов игры «Древний Мир» (DM): участники, альянсы, клановые смайлики и сравнение кланов. Продолжение и аналог легендарной игры BloodyWorld (КМ).",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
