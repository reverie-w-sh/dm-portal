import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Определение уровня достаточности клановых смайлов",
  description:
    "Диагностическая система оценки достаточности смайликового фонда кланов Древнего Мира.",
  path: "/smile-sufficiency",
  image: "/og/smile-sufficiency.webp",
  imageAlt: "Диагностика достаточности клановых смайлов",
});

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
