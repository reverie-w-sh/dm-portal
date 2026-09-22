import type { MetadataRoute } from "next";
import clansJson from "../../data/clans.json";
import playersJson from "../../data/players.json";
import { WORLD_LOCATIONS } from "@/lib/world-map";
import { SITE_URL } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/about", "/alliances", "/alliances/compare", "/chronicle", "/clans",
    "/clans/compare", "/dom-boli", "/dungeons", "/experience", "/gallery",
    "/gift-board", "/gifts",
    "/hunter-board", "/hunter-guide", "/les-teney", "/links", "/malahitovye-rudniki",
    "/members", "/players", "/personal-smiles", "/personal-items", "/couples",
    "/ratings", "/sad-koshmarov", "/smile-sufficiency", "/world",
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: route === "" ? "daily" as const : "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const clanPages = (clansJson as Array<{ clanId: string }>).map((clan) => ({
    url: `${SITE_URL}/clans/${clan.clanId}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const playerPages = (playersJson as Array<{ cuid: string }>).map((player) => ({
    url: `${SITE_URL}/players/${player.cuid}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const worldPages = WORLD_LOCATIONS.map((location) => ({
    url: `${SITE_URL}/world/${location.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...staticPages, ...worldPages, ...clanPages, ...playerPages];
}
