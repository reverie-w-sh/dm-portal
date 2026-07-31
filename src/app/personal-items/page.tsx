import data from "../../../data/personal-items.json";
import players from "../../../data/players.json";
import PersonalItemsClient from "./PersonalItemsClient";

type Player = { nick: string; profileUrl?: string; clanId?: string; clanName?: string; level?: number };
export default function Page() {
  const directory = Object.fromEntries((players as Player[]).map((p) => [p.nick.toLocaleLowerCase("ru"), p]));
  return <PersonalItemsClient data={data} directory={directory} />;
}
