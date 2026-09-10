import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Определение уровня достаточности клановых смайлов",
  description: "Диагностическая система оценки смайликового фонда кланов Древнего Мира.",
  path: "/smile-sufficiency",
  image: "/og/personal-smiles.webp",
  imageAlt: "Определение уровня достаточности клановых смайлов",
});

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
