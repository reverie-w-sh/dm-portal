import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Планшет охотника — «Древний Мир» (DM)',
  description: 'Планшет охотника с автоматическим подсчётом очков для игроков «Древнего Мира» (DM).',
  alternates: { canonical: '/hunter-board' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
