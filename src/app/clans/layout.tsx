import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Кланы игры «Древний Мир» (DM)',
  description: 'Список кланов игры «Древний Мир» (DM): участники, альянсы, клановые смайлики и сравнение кланов. Продолжение и аналог легендарной игры BloodyWorld (КМ).',
  path: "/clans",
  image: "/og/clans.webp",
  imageAlt: 'Коллекция гербов кланов игры «Древний Мир»',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
