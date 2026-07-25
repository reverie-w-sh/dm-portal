import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: 'Волчата — состав клана die Wölfchen в «Древнем Мире» (DM)',
  description: 'Все участники клана die Wölfchen в игре «Древний Мир» (DM): уровни, реинкарнации и состав нашей стаи.',
  path: "/members",
  image: "/og/members.webp",
  imageAlt: 'Волки die Wölfchen возле кланового знамени',
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
