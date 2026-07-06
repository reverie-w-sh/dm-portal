export interface ParsedProfile {
  cuid: string | null;
  nick: string | null;
  level: number | null;
  clanId: string | null;
  clanName: string | null;
  clanIcon: string | null;
  position: string;       // "" when absent; render as "—" in UI
}

/**
 * Extract a player profile from raw HTML of a dm-game.com profile page.
 *
 * Sources confirmed from live HTML (June 2026):
 *
 *   showNameBlock() JS call — cuid, nick, level, clanIcon, clanName
 *   #set_DescAdd div        — position (Должность в сообществе), gameClass
 *
 * Key insight: level/nick/position are NOT in rendered text. The page is
 * JS-rendered. Data lives in the showNameBlock() call and hidden server-
 * injected divs that are moved into place by JS after page load.
 */
export function parseProfileHtml(html: string): ParsedProfile {
  // ── showNameBlock(...) ────────────────────────────────────────────────────
  // Observed signature (all args are single-quoted strings):
  //   showNameBlock('RACE','CUID','NICK','LEVEL','0','0','0','0',
  //                 'clan_N.gif','DOMAIN','CLAN_NAME','0')
  // Indices: [1]=cuid  [2]=nick  [3]=level  [8]=clanIcon  [10]=clanName
  const snbRaw = /showNameBlock\(([^)]+)\)/.exec(html)?.[1] ?? null;

  const snbArgs: string[] = [];
  if (snbRaw) {
    const re = /'([^']*)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(snbRaw)) !== null) snbArgs.push(m[1]);
  }

  const cuid     = snbArgs[1]  ?? null;
  const nick     = snbArgs[2]  ?? null;
  const levelRaw = snbArgs[3];
  const level    = levelRaw !== undefined ? parseInt(levelRaw, 10) : null;
  const clanIcon = snbArgs[8]  ?? null;
  const clanName = snbArgs[10] ?? null;

  // clanId from icon filename: "clan_278.gif" → "278".
  // "Хранители" use a different icon pattern (h-sheriff-N.gif) → clanId "7".
  // clanIcon === "" (empty string, but present) means the game reported no
  // clan at all — that must be distinguished from clanIcon === null
  // (showNameBlock missing / parse failure), where we don't know either way.
  let clanId: string | null = null;
  if (clanIcon) {
    const m = /clan_(\d+)/.exec(clanIcon);
    if (m) clanId = m[1];
    else if (/h-sheriff/i.test(clanIcon)) clanId = "7";
  } else if (clanIcon === "") {
    clanId = ""; // explicitly clanless
  }

  // ── #set_DescAdd — position ───────────────────────────────────────────────
  // Server-injected div (not JS-rendered). Flat content: text + <b> + <br>.
  //
  // Observed structure (same for all players):
  //   Должность в сообществе: <b></b><br><b>VALUE</b><br>
  //
  // The first <b> after the label is always empty. The actual value is in
  // the second <b>. Players can write any text — game class names, custom
  // titles, anything. Do not filter or distinguish between them.
  const descAdd =
    /<div[^>]*id="set_DescAdd"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1] ?? "";

  let position = "";
  const labelIdx = descAdd.indexOf("Должность в сообществе:");
  if (labelIdx !== -1) {
    const after = descAdd.slice(labelIdx);
    // Find the first <b> with non-empty content after the label.
    const re = /<b>([^<]+)<\/b>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(after)) !== null) {
      const val = m[1].trim();
      if (val) { position = val; break; }
    }
  }

  return { cuid, nick, level, clanId, clanName, clanIcon, position };
}
