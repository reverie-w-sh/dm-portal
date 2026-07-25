import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'О клане die Wölfchen',
  description: 'История клана die Wölfchen, наши ценности, союзники и немного о нас.',
  alternates: { canonical: '/about' },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
