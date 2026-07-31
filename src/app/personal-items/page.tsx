import data from "../../../data/personal-items.json";
import players from "../../../data/players.json";
import PersonalItemsClient from "./PersonalItemsClient";

type Player = {
  cuid?: string;
  nick: string;
  profileUrl?: string;
  clanId?: string;
  clanName?: string;
  level?: number;
};

export default function Page() {
  const directory = Object.fromEntries(
    (players as Player[]).map((player) => [
      player.nick.toLocaleLowerCase("ru"),
      player,
    ]),
  );

  return <PersonalItemsClient data={data} directory={directory} />;
}
