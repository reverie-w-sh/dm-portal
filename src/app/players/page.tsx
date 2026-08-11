import playersJson from "../../../data/players.json";
import { PlayersDirectory, type DirectoryPlayer } from "./PlayersDirectory";
import styles from "./page.module.css";

type PlayerSource = DirectoryPlayer & {
  position?: string;
};

const players = (playersJson as PlayerSource[]).map(
  ({
    cuid,
    nick,
    level,
    levelUp,
    reincarnationLevel,
    reincarnationUp,
    clanId,
    clanName,
    inactiveMinutes,
    characterImage,
  }) => ({
    cuid,
    nick,
    level,
    levelUp,
    reincarnationLevel,
    reincarnationUp,
    clanId,
    clanName,
    inactiveMinutes,
    characterImage,
  }),
);

export default async function PlayersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = Array.isArray(params?.q) ? params.q[0] : params?.q;

  return (
    <main className={styles.page}>
      <PlayersDirectory players={players} initialQuery={query?.trim() ?? ""} />
    </main>
  );
}
