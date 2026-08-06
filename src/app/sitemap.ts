import type { MetadataRoute } from "next";
import clansJson from "../../data/clans.json";

const baseUrl = "https://wolfchen-clan.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/about", "/alliances", "/alliances/compare", "/clans",
    "/clans/compare", "/dom-boli", "/dungeons", "/gallery", "/gifts",
    "/gift-board", "/hunter-board", "/les-teney", "/links", "/malahitovye-rudniki",
    "/members", "/personal-smiles", "/personal-items", "/couples", "/ratings", "/sad-koshmarov",
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" as const : "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const clanPages = (clansJson as Array<{ clanId: string }>).map((clan) => ({
    url: `${baseUrl}/clans/${clan.clanId}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...clanPages];
}
