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
    .replace(/\s+/g, " ")
    .trim();
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

  // ── Last activity ───────────────────────────

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
