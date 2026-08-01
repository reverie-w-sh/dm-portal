import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "О клане die Wölfchen",
  description:
    "Клан создан 15.06.2026. Началось все с триумфального возвращения Шпиля за несколько дней до этой даты...",
  path: "/about",
  image: "/og/about.webp",
  imageAlt: "О клане die Wölfchen",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
