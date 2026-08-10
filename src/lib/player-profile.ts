export type FestivalNewsItem = {
  id: string;
  title: string;
  publishedAt?: string;
  createdAt: string;
  sourceUrl: string;
  category: "festival" | "boss" | "other";
  festivalType?: string;
  resultText?: string;
  comments?: Array<{ body: string; date?: string }>;
};

export type PlayerFestivalResult = {
  id: string;
  date: string;
  place: number;
  festivalName: string;
  prizes: string[];
  sourceUrl: string;
};

const FESTIVAL_NAMES: Record<string, string> = {
  fisher: "Рыбака",
  gatherer: "Собирателя",
  hunter: "Охотника",
  andvari: "Андвари",
  blacksmith: "Кузнеца",
  fighters: "Бойцов",
  labyrinth: "Лабиринта",
  familiar: "Фамильяра",
  bouquets: "Букетов",
  blood: "Крови",
  easter: "Пасхальном",
  pumpkin: "Безумная тыква",
};

function normalizeName(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/^[-–—*•\s]+|[-–—*•\s]+$/g, "")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

function festivalName(news: FestivalNewsItem): string {
  if (news.festivalType && FESTIVAL_NAMES[news.festivalType]) {
    return FESTIVAL_NAMES[news.festivalType];
  }

  return news.title
    .replace(/^(?:стартовал[аи]?|итоги?)\s+/iu, "")
    .replace(/^фестивал[ья]\s+/iu, "")
    .replace(/[.!]+$/g, "")
    .trim();
}

function cleanPrize(value: string): string {
  return value
    .replace(/^[:\s-]+/, "")
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/g, "")
    .trim();
}

function resultFromAwardMessage(
  news: FestivalNewsItem,
  playerNick: string,
  rawMessage: string,
  resultDate: string,
): PlayerFestivalResult | null {
  const message = rawMessage.replace(/\s+/g, " ").trim();
  const awardMatch = /получ(?:ил(?:а|и)?|ают)/iu.exec(message);
  if (!awardMatch) return null;

  let namesText = message.slice(0, awardMatch.index);
  namesText = namesText.replace(/^.*?\[Система\]:\s*/iu, "");
  namesText = namesText.replace(/^.*?(?:окончен|заверш[её]н)[^.]*\.\s*/iu, "");

  const names = namesText
    .split(/\s*,\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
  const playerIndex = names.findIndex(
    (name) => normalizeName(name) === normalizeName(playerNick),
  );
  if (playerIndex < 0) return null;

  const awardText = message.slice(awardMatch.index + awardMatch[0].length);
  const range = /(?:топ|top)\s*(\d+)\s*[-–—]\s*(\d+)/iu.exec(awardText);
  const prizeBoundary = /\s[-–—]?\s*(?:топ|top)/iu.exec(awardText);
  const prize = cleanPrize(
    prizeBoundary ? awardText.slice(0, prizeBoundary.index) : awardText,
  );
  const place = (range ? Number(range[1]) : 1) + playerIndex;

  return {
    id: `${news.id}-${playerNick}-${place}`,
    date: resultDate,
    place,
    festivalName: festivalName(news),
    prizes: prize ? [prize] : [],
    sourceUrl: news.sourceUrl,
  };
}

function resultFromRankingList(
  news: FestivalNewsItem,
  playerNick: string,
  text: string,
  resultDate: string,
): PlayerFestivalResult | null {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  let place = 0;
  let inRanking = false;

  for (const line of lines) {
    if (/рейтинг\s+топ\s*\d+/iu.test(line)) {
      place = 0;
      inRanking = true;
      continue;
    }
    if (!inRanking || !line || /^[-—]+$/.test(line)) continue;
    if (/^(?:рейтинг|итог|приз)/iu.test(line)) {
      inRanking = false;
      continue;
    }

    const rankedName = line.replace(/\s+\[[\d\s]+\]\s*(?:.*)?$/u, "").trim();
    if (!rankedName) continue;
    place += 1;

    if (normalizeName(rankedName) === normalizeName(playerNick)) {
      const suffix = line.slice(rankedName.length).replace(/^\s*\[[\d\s]+\]\s*/, "");
      const prize = cleanPrize(suffix);
      return {
        id: `${news.id}-${playerNick}-${place}`,
        date: resultDate,
        place,
        festivalName: festivalName(news),
        prizes: prize ? [prize] : [],
        sourceUrl: news.sourceUrl,
      };
    }
  }

  return null;
}

function resultForNews(
  news: FestivalNewsItem,
  playerNick: string,
): PlayerFestivalResult | null {
  const texts = [
    { body: news.resultText ?? "", date: news.createdAt },
    ...(news.comments ?? []).map((comment) => ({
      body: comment.body,
      date: comment.date || news.createdAt,
    })),
  ].filter((entry) => Boolean(entry.body));

  for (const text of texts) {
    const joinedSystemLines = text.body.replace(
      /\n(?!\d{1,2}:\d{2}\s*\[Система\]:)/giu,
      " ",
    );
    const messages = joinedSystemLines.split(
      /(?<!\d)(?=\d{1,2}:\d{2}\s*\[Система\]:)/giu,
    );

    for (const message of messages) {
      const result = resultFromAwardMessage(news, playerNick, message, text.date);
      if (result) return result;
    }

    const ranked = resultFromRankingList(news, playerNick, text.body, text.date);
    if (ranked) return ranked;
  }

  return null;
}

export function getPlayerFestivalResults(
  newsItems: FestivalNewsItem[],
  playerNick: string,
): PlayerFestivalResult[] {
  return newsItems
    .filter((news) => news.category === "festival")
    .map((news) => resultForNews(news, playerNick))
    .filter((result): result is PlayerFestivalResult => Boolean(result));
}

export function formatFestivalPlace(result: PlayerFestivalResult): string {
  return `${result.place}-е место`;
}
