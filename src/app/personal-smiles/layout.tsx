import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Личные смайлики игроков «Древнего Мира» (DM)',
  description: 'Коллекция личных смайликов игроков игры «Древний Мир» (DM). Ищи друзей, редкие смайлики и новые пополнения коллекции.',
  path: "/personal-smiles",
  image: "/og/personal-smiles.webp",
  imageAlt: 'Милый волчонок и личные смайлики игроков',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
