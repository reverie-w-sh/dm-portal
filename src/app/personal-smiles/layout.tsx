import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Личные смайлики игроков «Древнего Мира» (DM)',
  description: 'Коллекция личных смайликов игроков игры «Древний Мир» (DM). Ищи друзей, редкие смайлики и новые пополнения коллекции.',
  alternates: { canonical: '/personal-smiles' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/personal-smiles",
    title: "Личные смайлики игроков «Древнего Мира» (DM)",
    description: "Коллекция личных смайликов игроков игры «Древний Мир» (DM). Ищи друзей, редкие смайлики и новые пополнения коллекции.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "Личные смайлики игроков «Древнего Мира» (DM)",
    description: "Коллекция личных смайликов игроков игры «Древний Мир» (DM). Ищи друзей, редкие смайлики и новые пополнения коллекции.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
