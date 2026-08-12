import { createPageMetadata } from "@/lib/metadata";

export const metadata = {
  ...createPageMetadata({
    title: "Админка — die Wölfchen",
    description:
      "Закрытая страница со статистикой сайта и запуском синхронизации данных.",
    path: "/admin",
    image: "/og/admin.webp",
    imageAlt: "Административная панель сайта die Wölfchen",
  }),
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-page-background">{children}</div>;
}
