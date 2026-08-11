import ratingsData from "../../../data/ratings.json";
import playersData from "../../../data/players.json";
import RatingsClient from "./RatingsClient";

type PlayerDirectoryItem = {
  cuid: string;
  nick: string;
  level?: number;
  clanId?: string;
  clanName?: string;
  clanIcon?: string;
};

export default function RatingsPage() {
  const playerDirectory = Object.fromEntries(
    (playersData as PlayerDirectoryItem[]).map((player) => [
      player.nick.toLocaleLowerCase("ru"),
      {
        cuid: player.cuid,
        level: player.level,
        clanId: player.clanId,
        clanName: player.clanName,
        clanIcon: player.clanIcon,
      },
    ]),
  );

  return <RatingsClient data={ratingsData} playerDirectory={playerDirectory} />;
}
