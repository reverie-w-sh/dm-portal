import type { MetadataRoute } from "next";
import clansJson from "../../data/clans.json";
import playersJson from "../../data/players.json";
import { WORLD_LOCATIONS } from "@/lib/world-map";

const baseUrl = "https://wolfchen-clan.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/about", "/alliances", "/alliances/compare", "/chronicle", "/clans",
    "/clans/compare", "/dom-boli", "/dungeons", "/gallery", "/gifts",
    "/hunter-board", "/hunter-guide", "/les-teney", "/links", "/malahitovye-rudniki",
    "/members", "/players", "/personal-smiles", "/personal-items", "/couples", "/ratings", "/sad-koshmarov", "/world",
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

  const playerPages = (playersJson as Array<{ cuid: string }>).map((player) => ({
    url: `${baseUrl}/players/${player.cuid}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const worldPages = WORLD_LOCATIONS.map((location) => ({
    url: `${baseUrl}/world/${location.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...staticPages, ...worldPages, ...clanPages, ...playerPages];
}
