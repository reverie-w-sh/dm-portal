import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'О клане die Wölfchen',
  description: 'История клана die Wölfchen, наши ценности, союзники и немного о нас.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "die Wölfchen",
    url: "/about",
    title: "О клане die Wölfchen",
    description: "История клана die Wölfchen, наши ценности, союзники и немного о нас.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "die Wölfchen" }],
  },
  twitter: {
    card: "summary",
    title: "О клане die Wölfchen",
    description: "История клана die Wölfchen, наши ценности, союзники и немного о нас.",
    images: ["/icon.png"],
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
