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
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseInactiveMinutes(html: string): number | null {
  const text = htmlToPlainText(html);

  if (/Персонаж\s+находится\s+Online\b/i.test(text)) {
    return 0;
  }

  /*
   * Варианты:
   *
   * ждём : 1 час 28 минут 55 секунд
   * скучаем :( 3 мес 23 дней 20 часов 9 минут 49 секунд
   * ждём : -1 часов 47 минут 46 секунд
   *
   * В ДМ иногда первый компонент времени бывает отрицательным.
   */
  const activityMatch =
    /(?:жд[её]м|скучаем)[\s:()]*((?:-?\d+\s*(?:мес(?:яц(?:а|ев)?)?|день|дня|дней|час|часа|часов|минута|минуты|минут|секунда|секунды|секунд)\s*)+)/i.exec(
      text
    );

  if (!activityMatch) {
    return null;
  }

  const duration = activityMatch[1];

  function getDurationPart(
    pattern: RegExp
  ): number {
    const raw = pattern.exec(duration)?.[1];

    if (raw === undefined) {
      return 0;
    }

    const value = Number.parseInt(raw, 10);

    return Number.isFinite(value) ? value : 0;
  }

  const months = getDurationPart(
    /(-?\d+)\s*мес/i
  );

  const days = getDurationPart(
    /(-?\d+)\s*(?:день|дня|дней)/i
  );

  const hours = getDurationPart(
    /(-?\d+)\s*(?:час|часа|часов)/i
  );

  const minutes = getDurationPart(
    /(-?\d+)\s*(?:минута|минуты|минут)/i
  );

  const seconds = getDurationPart(
    /(-?\d+)\s*(?:секунда|секунды|секунд)/i
  );

  const totalMinutes =
    months * 30 * 24 * 60 +
    days * 24 * 60 +
    hours * 60 +
    minutes +
    seconds / 60;

  /*
   * Отрицательное время — особенность/ошибка вывода ДМ.
   * Для статуса активности считаем его недавним входом.
   */
  return Math.max(0, Math.floor(totalMinutes));
}

export function parseProfileHtml(html: string): ParsedProfile {
  const snbRaw = /showNameBlock\(([^)]+)\)/.exec(html)?.[1] ?? null;

  const snbArgs: string[] = [];

  if (snbRaw) {
    const re = /'([^']*)'/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(snbRaw)) !== null) {
      snbArgs.push(match[1]);
    }
  }

  const cuid = snbArgs[1] ?? null;
  const nick = snbArgs[2] ?? null;

  const activeLevelRaw = snbArgs[3];
  const activeLevel =
    activeLevelRaw !== undefined
      ? Number.parseInt(activeLevelRaw, 10)
      : null;

  const clanIcon = snbArgs[8] ?? null;
  const clanName = snbArgs[10] ?? null;

  // ── Reincarnation level ──────────────────────────────────────────────────
  const reincarnationBlock =
    /<b>\s*Возрождение\s*:?\s*<\/b>([\s\S]*?)(?:<br>\s*<br>|<\/div>)/i.exec(
      html,
    )?.[1] ?? "";

  const reincarnationMatch =
    /\[(\d+)\]/i.exec(reincarnationBlock);

  const secondLevel = reincarnationMatch
    ? Number.parseInt(reincarnationMatch[1], 10)
    : null;

  let level = activeLevel;
  let reincarnationLevel: number | null = null;

  if (
    activeLevel !== null &&
    Number.isFinite(activeLevel) &&
    secondLevel !== null &&
    Number.isFinite(secondLevel)
  ) {
    level = Math.max(activeLevel, secondLevel);
    reincarnationLevel = Math.min(activeLevel, secondLevel);
  }

  // ── Clan ─────────────────────────────────────────────────────────────────
  let clanId: string | null = null;

  if (clanIcon) {
    const match = /clan_(\d+)/.exec(clanIcon);

    if (match) {
      clanId = match[1];
    } else if (/h-sheriff/i.test(clanIcon)) {
      clanId = "7";
    }
  } else if (clanIcon === "") {
    clanId = "";
  }

  // ── Alliance ─────────────────────────────────────────────────────────────
  // null = profile could not be parsed
  // ""   = profile was parsed and the character's clan has no alliance
  let allianceId: string | null = snbRaw ? "" : null;
  let allianceName: string | null = snbRaw ? "" : null;

  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];

  for (const tag of imageTags) {
    const src =
      /\bsrc\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? "";

    const allianceIdMatch =
      /\/pics\/alc\/ali_(\d+)(?:_b)?\.(?:gif|jpe?g|png)/i.exec(src);

    if (!allianceIdMatch) {
      continue;
    }

    allianceId = allianceIdMatch[1];

    const alt =
      /\balt\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? "";

    const title =
      /\btitle\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? "";

    const label = alt || title;
    const nameMatch = /Альянс\s*:\s*(.+)/i.exec(label);

    if (nameMatch?.[1]) {
      allianceName = nameMatch[1].trim();
    }
  }

  /*
   * Sometimes the small alliance icon has no alt/title while the large icon
   * contains the name. Search the full HTML independently from the ID.
   */
  if (allianceId && !allianceName) {
    const allianceNameMatch =
      /(?:alt|title)\s*=\s*["']Альянс\s*:\s*([^"']+)["']/i.exec(html);

    if (allianceNameMatch?.[1]) {
      allianceName = allianceNameMatch[1].trim();
    }
  }

  // ── Position ─────────────────────────────────────────────────────────────
  const descAdd =
    /<div[^>]*id="set_DescAdd"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1] ?? "";

  let position = "";
  const labelIndex = descAdd.indexOf("Должность в сообществе:");

  if (labelIndex !== -1) {
    const afterLabel = descAdd.slice(labelIndex);
    const boldTag = /<b>([^<]+)<\/b>/g;
    let match: RegExpExecArray | null;

    while ((match = boldTag.exec(afterLabel)) !== null) {
      const value = match[1].trim();

      if (value) {
        position = value;
        break;
      }
    }
  }
const inactiveMinutes =
  parseInactiveMinutes(html);
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
  };
}
