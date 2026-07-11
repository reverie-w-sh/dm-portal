export interface ParsedProfile {
  cuid: string | null;
  nick: string | null;
  level: number | null;
  reincarnationLevel: number | null;
  clanId: string | null;
  clanName: string | null;
  clanIcon: string | null;
  position: string;
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

  const reincarnationMatch =
    /Возрождение\s*:?\s*[\s\S]{0,500}?\[(\d+)\]/i.exec(html);

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

  return {
    cuid,
    nick,
    level,
    reincarnationLevel,
    clanId,
    clanName,
    clanIcon,
    position,
  };
}
