export interface ParsedAchievement {
  id: string;
  name: string;
  imageUrl: string;
  category: "battle" | "profession" | "research" | "underground" | "other";
}

export interface ParsedProfile {
  cuid: string | null;
  nick: string | null;
  level: number | null;
  reincarnationLevel: number | null;
  clanId: string | null;
  clanName: string | null;
  clanIcon: string | null;
  allianceId: string | null;
  allianceName: string | null;
  position: string;
  inactiveMinutes: number | null;
  marriagePartner: string;
  marriageSince: string;
  characterImage: string | null;
  achievementsKnown: boolean;
  achievements: ParsedAchievement[];
}

/**
 * Extract a player profile from raw HTML of a dm-game.com profile page.
 *
 * level:
 *   Always stores the greater of the active level and rebirth level.
 *
 * reincarnationLevel:
 *   Always stores the smaller of the two levels.
 *
 * allianceId/allianceName:
 *   Read from images such as:
 *     /pics/alc/ali_23.gif
 *     /pics/alc/ali_23_b.jpg
 *   and alt/title="Альянс: Тени Прошлого".
 *
 * inactiveMinutes:
 *   Number of minutes since the last login.
 *   Online characters receive 0.
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    // Numeric entities are often used for the small info icon after [level].
    // Remove any remaining entity so its digits cannot break profile parsing.
    .replace(/&#(?:x[0-9a-f]+|\d+);/gi, " ")
    .replace(/&[a-z][a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function imageAttribute(tag: string, name: string): string {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag);
  return match?.[1] ? decodeHtmlAttribute(match[1]) : "";
}

function parseAchievements(html: string): ParsedAchievement[] {
  const achievements = new Map<string, ParsedAchievement>();
  const categoryByGroup: Record<string, ParsedAchievement["category"]> = {
    "1": "battle",
    "2": "profession",
    "3": "research",
    "4": "underground",
  };

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const source = imageAttribute(tag, "src");
    const group = /\/subject\/+achievement\/+(\d+)\/+[^/?"']+/i.exec(source)?.[1];
    if (!group) continue;

    let imageUrl: string;
    try {
      const parsedUrl = new URL(source, "https://dm-game.com");
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/{2,}/g, "/");
      imageUrl = parsedUrl.toString();
    } catch {
      continue;
    }

    const name = imageAttribute(tag, "title") || imageAttribute(tag, "alt");
    if (!name) continue;

    const id = new URL(imageUrl).pathname.toLocaleLowerCase("en-US");

    achievements.set(id, {
      id,
      name,
      imageUrl,
      category: categoryByGroup[group] ?? "other",
    });
  }

  return [...achievements.values()];
}

function parseInactiveMinutes(
  html: string
): number | null {
  const text = htmlToPlainText(html);

  /*
   * Персонаж прямо сейчас в игре.
   */
  if (
    /Персонаж\s+находится\s+Online\b/i.test(
      text
    )
  ) {
    return 0;
  }

  /*
   * Сначала пробуем взять уже готовую длительность:
   *
   * ждём: 1 час 28 минут 55 секунд
   * ждём: -1 часов 47 минут 46 секунд
   * скучаем :( 19 дней 4 часа
   * скучаем :( 1 месяц 12 дней
   * скучаем :( 1 год 3 мес 5 дней
   */
  const activityMatch =
    /(?:жд[её]м|скучаем)[\s:()]*((?:-?\d+\s*(?:год|года|лет|мес(?:\.|яц|яца|яцев)?|дн(?:\.|я|ей)?|день|час(?:а|ов)?|минут(?:а|ы)?|секунд(?:а|ы)?)\s*)+)/i.exec(
      text
    );

  if (activityMatch) {
    const duration = activityMatch[1];

    function getDurationPart(
      pattern: RegExp
    ): number {
      const raw =
        pattern.exec(duration)?.[1];

      if (raw === undefined) {
        return 0;
      }

      const value = Number.parseInt(
        raw,
        10
      );

      return Number.isFinite(value)
        ? value
        : 0;
    }

    const years = getDurationPart(
      /(-?\d+)\s*(?:год|года|лет)/i
    );

    const months = getDurationPart(
      /(-?\d+)\s*мес/i
    );

    const days = getDurationPart(
      /(-?\d+)\s*(?:дн(?:\.|я|ей)?|день)/i
    );

    const hours = getDurationPart(
      /(-?\d+)\s*час/i
    );

    const minutes = getDurationPart(
      /(-?\d+)\s*минут/i
    );

    const seconds = getDurationPart(
      /(-?\d+)\s*секунд/i
    );

    const totalMinutes =
      years * 365 * 24 * 60 +
      months * 30 * 24 * 60 +
      days * 24 * 60 +
      hours * 60 +
      minutes +
      seconds / 60;

    /*
     * В ДМ иногда выводится отрицательный первый
     * компонент, например:
     *
     * -1 часов 47 минут
     *
     * Это всё равно недавний вход, поэтому не
     * позволяем значению стать отрицательным.
     */
    return Math.max(
      0,
      Math.floor(totalMinutes)
    );
  }

  /*
   * Запасной вариант: если длительность почему-то
   * не распозналась, но есть полная дата входа.
   *
   * вход: 20.03.2026 12:57
   */
  const fullDateMatch =
    /вход\s*:\s*(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})/i.exec(
      text
    );

  if (fullDateMatch) {
    const [
      ,
      day,
      month,
      year,
      hours,
      minutes,
    ] = fullDateMatch;

    /*
     * На сервере Actions лучше считать через UTC,
     * чтобы результат не зависел от локального
     * часового пояса окружения.
     */
    const loginTime = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes)
    );

    const differenceMinutes =
      Math.floor(
        (Date.now() - loginTime) /
          60_000
      );

    return Math.max(
      0,
      differenceMinutes
    );
  }

  return null;
}

export function parseProfileHtml(
  html: string
): ParsedProfile {
  const characterImageMatch =
    /ClothSh\(\s*["']\{[\s\S]*?["']pic["']\s*:\s*["']([^"']+)["']/i.exec(
      html
    );

  const characterImage = characterImageMatch?.[1]
    ? new URL(
        characterImageMatch[1].replace(/^\/+/, ""),
        "https://dm-game.com/layout/all/Hero_obraz/",
      ).toString()
    : null;
  const snbRaw =
    /showNameBlock\(([^)]+)\)/.exec(
      html
    )?.[1] ?? null;

  const snbArgs: string[] = [];

  if (snbRaw) {
    const re = /'([^']*)'/g;
    let match: RegExpExecArray | null;

    while (
      (match = re.exec(snbRaw)) !== null
    ) {
      snbArgs.push(match[1]);
    }
  }

  const cuid = snbArgs[1] ?? null;
  const nick = snbArgs[2] ?? null;

  const activeLevelRaw = snbArgs[3];

  const activeLevel =
    activeLevelRaw !== undefined
      ? Number.parseInt(
          activeLevelRaw,
          10
        )
      : null;

  const clanIcon =
    snbArgs[8] ?? null;

  const clanName =
    snbArgs[10] ?? null;

  // ── Reincarnation level ─────────────────────

  const reincarnationBlock =
    /<b>\s*Возрождение\s*:?\s*<\/b>([\s\S]*?)(?:<br>\s*<br>|<\/div>)/i.exec(
      html
    )?.[1] ?? "";

  const reincarnationMatch =
    /\[(\d+)\]/i.exec(
      reincarnationBlock
    );

  const secondLevel =
    reincarnationMatch
      ? Number.parseInt(
          reincarnationMatch[1],
          10
        )
      : null;

  let level = activeLevel;

  let reincarnationLevel:
    | number
    | null = null;

  if (
    activeLevel !== null &&
    Number.isFinite(activeLevel) &&
    secondLevel !== null &&
    Number.isFinite(secondLevel)
  ) {
    level = Math.max(
      activeLevel,
      secondLevel
    );

    reincarnationLevel = Math.min(
      activeLevel,
      secondLevel
    );
  }

  // ── Clan ────────────────────────────────────

  let clanId: string | null = null;

  if (clanIcon) {
    const match =
      /clan_(\d+)/.exec(
        clanIcon
      );

    if (match) {
      clanId = match[1];
    } else if (
      /h-sheriff/i.test(
        clanIcon
      )
    ) {
      clanId = "7";
    }
  } else if (clanIcon === "") {
    clanId = "";
  }

  // ── Alliance ────────────────────────────────

  /*
   * null — профиль не удалось распознать.
   * ""   — профиль распознан, но альянса нет.
   */
  let allianceId: string | null =
    snbRaw ? "" : null;

  let allianceName: string | null =
    snbRaw ? "" : null;

  const imageTags =
    html.match(
      /<img\b[^>]*>/gi
    ) ?? [];

  for (const tag of imageTags) {
    const src =
      /\bsrc\s*=\s*["']([^"']+)["']/i.exec(
        tag
      )?.[1] ?? "";

    const allianceIdMatch =
      /\/pics\/alc\/ali_(\d+)(?:_b)?\.(?:gif|jpe?g|png)/i.exec(
        src
      );

    if (!allianceIdMatch) {
      continue;
    }

    allianceId =
      allianceIdMatch[1];

    const alt =
      /\balt\s*=\s*["']([^"']*)["']/i.exec(
        tag
      )?.[1] ?? "";

    const title =
      /\btitle\s*=\s*["']([^"']*)["']/i.exec(
        tag
      )?.[1] ?? "";

    const label = alt || title;

    const nameMatch =
      /Альянс\s*:\s*(.+)/i.exec(
        label
      );

    if (nameMatch?.[1]) {
      allianceName =
        nameMatch[1].trim();
    }
  }

  /*
   * Маленькая иконка может быть без alt/title,
   * а название будет только возле большой.
   */
  if (
    allianceId &&
    !allianceName
  ) {
    const allianceNameMatch =
      /(?:alt|title)\s*=\s*["']Альянс\s*:\s*([^"']+)["']/i.exec(
        html
      );

    if (allianceNameMatch?.[1]) {
      allianceName =
        allianceNameMatch[1].trim();
    }
  }

  // ── Position ────────────────────────────────

  const descAdd =
    /<div[^>]*id="set_DescAdd"[^>]*>([\s\S]*?)<\/div>/.exec(
      html
    )?.[1] ?? "";

  let position = "";

  const labelIndex =
    descAdd.indexOf(
      "Должность в сообществе:"
    );

  if (labelIndex !== -1) {
    const afterLabel =
      descAdd.slice(labelIndex);

    const boldTag =
      /<b>([^<]+)<\/b>/g;

    let match:
      | RegExpExecArray
      | null;

    while (
      (match =
        boldTag.exec(
          afterLabel
        )) !== null
    ) {
      const value =
        match[1].trim();

      if (value) {
        position = value;
        break;
      }
    }
  }

  // ── Marriage ────────────────────────────────

  const plainText = htmlToPlainText(html);
  /*
   * Имя супруга должно быть коротким фрагментом непосредственно перед
   * уровнем в квадратных скобках. Ограничение длины не позволяет случайно
   * захватить весь текст блока «О себе», если пользователь процитировал там
   * похожую фразу.
   */
  const marriageMatch =
    /Персонаж\s+находится\s+в\s+законном\s+браке\s+с\s+([^\[\]\r\n]{1,80}?)\s*\[\d+\][\s\S]{0,160}?[сc]\s+(\d{2}\.\d{2}\.\d{4})/i.exec(
      plainText
    );

  const marriagePartner =
    marriageMatch?.[1]?.trim() ?? "";

  const marriageSince =
    marriageMatch?.[2]?.trim() ?? "";

  // ── Last activity ───────────────────────────

  const inactiveMinutes =
    parseInactiveMinutes(html);

  // ── Achievements ───────────────────────────

  const achievementsKnown = /\bid\s*=\s*["']set_ach(?:Alone|All)Htm["']/i.test(html);
  const achievements = achievementsKnown ? parseAchievements(html) : [];

  return {
    cuid,
    nick,
    level,
    reincarnationLevel,
    clanId,
    clanName,
    clanIcon,
    allianceId,
    allianceName,
    position,
    inactiveMinutes,
    marriagePartner,
    marriageSince,
    characterImage,
    achievementsKnown,
    achievements,
  };
}
