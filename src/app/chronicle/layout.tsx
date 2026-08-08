import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Летопись Древнего Мира",
  description:
    "Хроника событий игры Древний Мир: новые уровни, переходы между кланами, свадьбы, разводы и новые смайлики.",
  path: "/chronicle",
  image: "/og/chronicle.webp",
  imageAlt: "Летопись Древнего Мира",
});

export default function ChronicleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
