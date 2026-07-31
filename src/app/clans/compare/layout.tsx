import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Сравнение кланов «Древнего Мира» (DM)",
  description: "Сравнивай кланы игры «Древний Мир» (DM): уровни игроков, количество участников, смайлики и место в мире игры.",
  path: "/clans/compare",
  image: "/og/clans.webp",
  imageAlt: "Сравнение кланов игры «Древний Мир»",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
