import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Личные смайлики игроков «Древнего Мира» (DM)',
  description: 'Коллекция личных смайликов игроков игры «Древний Мир» (DM). Ищи друзей, редкие смайлики и новые пополнения коллекции.',
  alternates: { canonical: '/personal-smiles' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
