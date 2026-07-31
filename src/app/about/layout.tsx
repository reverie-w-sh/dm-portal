import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "О клане die Wölfchen",
  description: "История клана die Wölfchen, наши ценности, союзники и немного о нас.",
  path: "/about",
  image: "/og/home.webp",
  imageAlt: "О клане die Wölfchen",
});

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
