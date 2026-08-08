import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Летопись Древнего Мира",
  description:
    "Хроника Древнего Мира: уровни, кланы, свадьбы, смайлики, фестивали, бои с боссами, победители, призы и новости игры.",
  path: "/chronicle",
  image: "/og/chronicle.webp",
  imageAlt: "Летопись Древнего Мира",
});

export default function ChronicleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
