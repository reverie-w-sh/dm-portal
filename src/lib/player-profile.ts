export type PlayerFestivalResult = {
  id: string;
  title: string;
  date: string;
  sourceUrl: string;
  place?: number;
  tier?: string;
  prizes: string[];
};

type GameNewsComment = {
  date?: string;
  body: string;
};

type GameNewsItem = {
  id: string;
  tid: string;
  title: string;
  publishedAt: string;
  createdAt?: string;
  body: string;
  sourceUrl: string;
  category: string;
  festivalType?: string;
  resultText?: string;
  comments?: GameNewsComment[];
};

type ParsedOutcome = {
  place?: number;
  tier?: string;
  prize?: string;
};

function normalized(value: string): string {
  return value
    .replace(/[“”«»"']/g, "")
    .replace(/[*_]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

function sameNick(value: string, nick: string): boolean {
  return normalized(value.replace(/^.*?\[Система\]:\s*/i, "")) === normalized(nick);
}

function splitNames(value: string): string[] {
  return value
    .replace(/^.*?\[Система\]:\s*/i, "")
    .replace(/^\s*Система\]:\s*/i, "")
    .split(/\s*,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function cleanPrize(value?: string): string | undefined {
  if (!value) return undefined;

  const cleaned = value
    .replace(/^[.:,\s-]+/, "")
    .replace(/[.\s]+$/, "")
    .replace(/\s*-\s*ТОП$/i, "")
    .replace(/\s+/g, " ")
    .replace(/\(по\s+(\d+)шт\.\)/i, "(по $1 шт.)")
    .trim();

  return cleaned || undefined;
}

function parseRankingRows(body: string, nick: string): ParsedOutcome[] {
  const outcomes: ParsedOutcome[] = [];
  let rank = 0;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/\*\*/g, "").trim();
    if (!line) continue;

    if (/рейтинг\s+топ/i.test(line)) {
      rank = 0;
      continue;
    }

    const match = line.match(/^(.+?)\[(\d+)\]\s*\[([\d\s]+)\]\s*(.*)$/u);
    if (!match) continue;

    rank += 1;
    if (!sameNick(match[1], nick)) continue;

    outcomes.push({
      place: rank,
      prize: cleanPrize(match[4]),
    });
  }

  return outcomes;
}

function resultSegments(body: string): string[] {
  return body
    .replace(/\r/g, "")
    .split(/(?=\d{1,2}:\d{2}\s*\[Система\]:)|\n\s*\n+/)
    .map((part) =>
      part
        .replace(/\s*\n\s*/g, " ")
        .replace(/^\.\s+/, "")
        .trim(),
    )
    .filter(Boolean);
}

function parseNamedLists(body: string, nick: string): ParsedOutcome[] {
  const outcomes: ParsedOutcome[] = [];

  for (const segment of resultSegments(body)) {
    const fighter = segment.match(
      /^(.+?)\s+ТОП\s*(10|25|50)\s+самых[^.]*[.]?\s*Получают\s+(.+)$/iu,
    );

    if (fighter) {
      const names = splitNames(fighter[1]);
      const index = names.findIndex((name) => sameNick(name, nick));
      if (index >= 0) {
        outcomes.push({
          place: index + 1,
          prize: cleanPrize(fighter[3]),
        });
      }
      continue;
    }

    const received = segment.match(
      /^(.+?)\s+получ(?:или|ил|ила|ает|ают)\s+(.+?)\s+ТОП\s*(\d+)(?:\s*-\s*(\d+))?(?:\s+(.+))?$/iu,
    );

    if (!received) continue;

    const names = splitNames(received[1]);
    const index = names.findIndex((name) => sameNick(name, nick));
    if (index < 0) continue;

    const start = Number(received[3]);
    const end = received[4] ? Number(received[4]) : undefined;
    const context = received[5]?.trim();
    const isTeamResult =
      /команд/i.test(context ?? "") ||
      /андвари/i.test(context ?? "") ||
      /андвари/i.test(received[2]);

    outcomes.push({
      place: end && !isTeamResult ? start + index : undefined,
      tier: end
        ? undefined
        : isTeamResult
          ? `ТОП-${start} команды`
          : `ТОП-${start}`,
      prize: cleanPrize(received[2]),
    });
  }

  return outcomes;
}

function parseEasterPrizes(news: GameNewsItem, nick: string): string[] {
  const prizes: string[] = [];
  const body = `${news.body}\n${news.resultText ?? ""}`.replace(/\r/g, "");

  const pointsMatch = body.match(/Поздравление:\s*([\s\S]*?)\s+получают\s+([^\n]+)/i);
  if (pointsMatch) {
    const names = splitNames(pointsMatch[1]);
    if (names.some((name) => sameNick(name, nick))) {
      const prize = cleanPrize(pointsMatch[2]);
      if (prize) prizes.push(prize);
    }
  }

  const eggMatch = body.match(/Обладатели золотых яиц:\s*([\s\S]+?)(?:Спасибо|$)/i);
  if (eggMatch) {
    const owners = eggMatch[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/\[\d+]/g, "").trim())
      .filter(Boolean);

    if (owners.some((owner) => sameNick(owner, nick))) {
      prizes.push("Золотое яйцо: +5% к опыту на год");
    }
  }

  return prizes;
}

function mergeOutcomes(outcomes: ParsedOutcome[]): {
  place?: number;
  tier?: string;
  prizes: string[];
} {
  const exact = outcomes.find((outcome) => outcome.place != null);
  const tier = outcomes.find((outcome) => outcome.tier)?.tier;
  const prizes = [...new Set(outcomes.map((outcome) => outcome.prize).filter(Boolean))] as string[];

  return {
    place: exact?.place,
    tier: exact?.place == null ? tier : undefined,
    prizes,
  };
}

export function getPlayerFestivalResults(
  newsItems: GameNewsItem[],
  nick: string,
): PlayerFestivalResult[] {
  const results: PlayerFestivalResult[] = [];

  for (const news of newsItems) {
    const isFestival =
      news.category === "festival" || Boolean(news.festivalType);

    if (!isFestival) continue;

    const outcomes = (news.comments ?? []).flatMap((comment) => [
      ...parseRankingRows(comment.body, nick),
      ...parseNamedLists(comment.body, nick),
    ]);

    const easterPrizes = news.festivalType === "easter"
      ? parseEasterPrizes(news, nick)
      : [];
    if (outcomes.length === 0 && easterPrizes.length === 0) continue;

    const merged = mergeOutcomes(outcomes);
    const commentDate = (news.comments ?? []).find((comment) =>
      comment.body.toLocaleLowerCase("ru-RU").includes(nick.toLocaleLowerCase("ru-RU")),
    )?.date;

    results.push({
      id: `festival-${news.id}-${normalized(nick)}`,
      title: news.title,
      date: commentDate || news.publishedAt || news.createdAt || "",
      sourceUrl: news.sourceUrl,
      place: merged.place,
      tier: merged.tier,
      prizes: [...new Set([...merged.prizes, ...easterPrizes])],
    });
  }

  return results.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function formatFestivalPlace(result: PlayerFestivalResult): string {
  if (result.place != null) return `${result.place}-е место`;
  return result.tier || "Участник фестиваля";
}
